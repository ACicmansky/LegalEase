import { AdaptiveBatcher } from "@/utils/adaptive-batcher";
import { HallucinationDetector } from "@/lib/hallucination-detector";
import { ResponseValidator } from "@/lib/response-validator";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

import { VectorCache } from "@/lib/caching";
import { GenerationEngine } from "@/lib/generation";
import { vectorStore } from "@/utils/supabase/server";

// Initialize components
const initializeRetriever = async () => {
  const vector = await vectorStore();
  return vector.asRetriever({
    searchType: "mmr",
    searchKwargs: {
      fetchK: 6,
      lambda: 0.75,
    },
    filter: {
      metadata: {
        source: { $exists: true }
      }
    }
  });
};

const generationEngine = new GenerationEngine();

// Initialize Vector Cache with production settings
const vectorCache = new VectorCache({
  maxSize: 2000,               // Store up to 2000 entries
  ttlMs: 60 * 60 * 1000,      // 1 hour TTL
  similarityThreshold: 0.92,   // Slightly relaxed threshold for better hit rate
  persistToLocalStorage: true  // Persist cache across sessions
});

// Create a cached retriever wrapper
const createCachedRetriever = async () => {
  const vector = await vectorStore();
  return async (input: any) => {
    const query = typeof input === 'string' ? input : input.question;
    
    try {
      // Try to get cached retrieval results
      const cachedResults = await vectorCache.getCachedRetrieval(
        query,
        vector,
        { timestamp: Date.now() }
      );

      if (cachedResults) {
        console.debug('Cache hit for query:', query);
        return cachedResults;
      }

      // On cache miss, perform retrieval and cache results
      console.debug('Cache miss for query:', query);
      const results = await (await initializeRetriever()).invoke(query);
      
      return results;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      // Fallback to direct retrieval on cache error
      return await (await initializeRetriever()).invoke(query);
    }
  };
};

// Build the optimized pipeline
export const createOptimizedPipeline = async () => {
  const hallucinationDetector = new HallucinationDetector(0.85);
  const batcher = new AdaptiveBatcher({
    minBatchSize: 1,
    maxBatchSize: 8,
    targetLatencyMs: 750,
    maxLatencies: 30
  });

  // Create cached retriever instance
  const cachedRetriever = await createCachedRetriever();

  return RunnableSequence.from([
    {
      context: RunnableSequence.from([
        async (input: any) => {
          // Batch retrieval requests with caching
          const docs = await batcher.processBatch([input], async (batch) => {
            const results = await Promise.all(
              batch.map(item => cachedRetriever(item))
            );
            return results.flat();
          });
          return docs;
        },
        formatDocumentsAsString
      ]),
      question: new RunnablePassthrough()
    },
    generationEngine.promptTemplate,
    RunnableSequence.from([
      async (input: any) => {
        // Batch LLM requests
        const responses = await batcher.processBatch([input], async (batch) => {
          return await generationEngine.model.batch(batch);
        });
        return responses[0];
      },
      new StringOutputParser(),
      async (response: string, runManager: any) => {
        const context = runManager.context;
        
        // Check for hallucinations first
        const hallucinationCheck = await hallucinationDetector.detectHallucination(response, context);
        if (hallucinationCheck.isHallucination) {
          console.warn(`Hallucination detected: ${hallucinationCheck.reason}`);
          throw new Error(`Potential hallucination detected: ${hallucinationCheck.reason}`);
        }
        
        // Then validate citations
        const validator = new ResponseValidator();
        const isValid = await validator.validateCitations(response, context);
        
        if (!isValid) {
          throw new Error("Invalid response: Missing or incorrect citations");
        }
        
        return response;
      }
    ])
  ]).withConfig({
    runName: "LegalRAGPipeline",
    metadata: {
      description: "Production RAG pipeline for legal document analysis",
      version: "1.0.0",
      metrics: {
        getCurrentBatchSize: () => batcher.getCurrentBatchSize(),
        getAverageLatency: () => batcher.getAverageLatency(),
        getCacheStats: () => vectorCache.getCacheStats()
      }
    },
    maxConcurrency: 5,
    callbacks: [{
      handleLLMError: async (e) => {
        if (e.message.includes("rate_limit")) {
          return "Rate limit exceeded. Please try again in a moment.";
        }
        if (e.message.includes("hallucination")) {
          return "I apologize, but I cannot provide a reliable answer based on the available context. Please rephrase your question or provide additional context.";
        }
        throw e;
      }
    }]
  });
};