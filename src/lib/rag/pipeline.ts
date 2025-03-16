// import { AdaptiveBatcher } from "@/lib/utils/adaptive-batcher";
// import { HallucinationDetector } from "@/lib/rag/hallucination-detector";
// import { ResponseValidator } from "@/lib/rag/response-validator";
// import { StringOutputParser } from "@langchain/core/output_parsers";
// import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
// import { formatDocumentsAsString } from "langchain/util/document";

// import { VectorCache } from "@/lib/rag/caching";
// import { GenerationEngine } from "@/lib/rag/generation";
// import { vectorStore } from "@/lib/utils/supabase/server";

// // Initialize components
// const initializeRetriever = async (documentId: string) => {
//   // Create search filter based on documentId if provided
//   const filter = { document_id: documentId };

//   // Get vector store with filter  
//   const vector = await vectorStore(filter);

//   // Return the retriever without filter (since it's already applied in vectorStore)
//   return vector.asRetriever({
//     searchType: "mmr",
//     searchKwargs: {
//       fetchK: 6,
//       lambda: 0.75,
//     }
//   });
// };

// const generationEngine = new GenerationEngine();

// // Initialize Vector Cache with production settings
// const vectorCache = new VectorCache({
//   maxSize: 2000,               // Store up to 2000 entries
//   ttlMs: 60 * 60 * 1000,      // 1 hour TTL
//   similarityThreshold: 0.92,   // Slightly relaxed threshold for better hit rate
//   persistToLocalStorage: true  // Persist cache across sessions
// });

// // Create a cached retriever wrapper
// const createCachedRetriever = async (documentId: string) => {
//   const filter = { document_id: documentId };
//   const vector = await vectorStore(filter);
//   return async (input: any) => {
//     const query = typeof input === 'string' ? input : input.question;
//     const documentId = input.documentId && input.documentId !== 'null' ? input.documentId : null;

//     // Generate a cache key that includes documentId if present
//     const cacheKey = documentId ? `${query}_doc_${documentId}` : query;

//     try {
//       // Try to get cached retrieval results
//       const cachedResults = await vectorCache.getCachedRetrieval(
//         cacheKey,
//         vector,
//         { timestamp: Date.now() }
//       );

//       if (cachedResults) {
//         console.debug('Cache hit for query:', query);
//         return cachedResults;
//       }

//       // On cache miss, perform retrieval and cache results
//       console.debug('Cache miss for query:', query);
//       // Use the document-aware retriever
//       const results = await (await initializeRetriever(documentId)).invoke(query);

//       return results;
//     } catch (error) {
//       console.error('Cache retrieval error:', error);
//       // Fallback to direct retrieval on cache error
//       return await (await initializeRetriever(documentId)).invoke(query);
//     }
//   };
// };

// // Format chat history for context
// const formatChatHistory = (history: any[] = []) => {
//   if (!history || history.length === 0) return '';

//   return history
//     .map(msg => `${msg.is_user ? 'User' : 'Assistant'}: ${msg.content}`)
//     .join('\n');
// };

// // Extract sources from search results
// const extractSources = (searchResults: any[] = []) => {
//   if (!searchResults || searchResults.length === 0) return [];

//   return searchResults.map(result => ({
//     title: result.metadata?.title || 'Document',
//     page: result.metadata?.page || 1,
//     text: result.pageContent?.substring(0, 150) || result.text?.substring(0, 150) || '',
//   }));
// };

// // Build the optimized pipeline
// export const createOptimizedPipeline = async (documentId: string) => {
//   try {
//     console.log('Initializing RAG pipeline components...');
//     const hallucinationDetector = new HallucinationDetector(0.85);
//     const responseValidator = new ResponseValidator();
//     const batcher = new AdaptiveBatcher({
//       minBatchSize: 1,
//       maxBatchSize: 8,
//       targetLatencyMs: 750,
//       maxLatencies: 30
//     });

//     // Create cached retriever instance
//     console.log('Creating cached retriever...');
//     const cachedRetriever = await createCachedRetriever(documentId);
//     console.log('Cached retriever initialized');

//     console.log('Building RAG pipeline sequence...');
//     const pipeline = RunnableSequence.from([
//       {
//         context: RunnableSequence.from([
//           async (input: any) => {
//             console.log('Pipeline processing input:', {
//               question: input.question,
//               sessionId: input.sessionId ? `${input.sessionId.substring(0, 8)}...` : undefined,
//               documentId: input.documentId ? `${input.documentId.substring(0, 8)}...` : undefined,
//               historyLength: input.history?.length || 0
//             });

//             // Process chat history if available
//             const historyContext = formatChatHistory(input.history);
//             if (historyContext) {
//               console.log('Chat history context available, length:', historyContext.length);
//             }

//             // Batch retrieval requests with caching
//             console.log('Starting document retrieval...');
//             try {
//               const docs = await batcher.processBatch([input], async (batch) => {
//                 const results = await Promise.all(
//                   batch.map(item => cachedRetriever(item))
//                 );
//                 return results.flat();
//               });

//               console.log('Retrieved', docs.length, 'documents');

//               // Add sources to the input for later reference
//               input.sources = extractSources(docs);
              
//               // Store the documents for later use in validation
//               input.documents = docs;

//               // Combine retrieved docs with chat history if available
//               if (historyContext) {
//                 return `Chat History:\n${historyContext}\n\nRetrieved Documents:\n${formatDocumentsAsString(docs)}`;
//               }

//               return formatDocumentsAsString(docs);
//             } catch (retrievalError) {
//               console.error('Document retrieval error:', retrievalError);
//               throw retrievalError;
//             }
//           },
//           new StringOutputParser()
//         ]),
//         question: new RunnablePassthrough(),
//         originalInput: new RunnablePassthrough()
//       },
//       generationEngine.promptTemplate,
//       RunnableSequence.from([
//         async (input: any) => {
//           console.log('Generating response with LLM...');
//           try {
//             // Batch LLM requests
//             const responses = await batcher.processBatch([input], async (batch) => {
//               return await generationEngine.model.batch(batch);
//             });
//             console.log('LLM response generated successfully');
            
//             // Pass through both the LLM response and the original input
//             return {
//               llmResponse: responses[0],
//               originalInput: input.originalInput
//             };
//           } catch (llmError) {
//             console.error('LLM generation error:', llmError);
//             throw llmError;
//           }
//         },
//         async (input: { llmResponse: string, originalInput: any }) => {
//           // Extract just the LLM response for the StringOutputParser
//           return input.llmResponse;
//         },
//         new StringOutputParser(),
//         async (response: string) => {
//           console.log('Validating response...');
          
//           try {
//             // Skip hallucination detection for now since we can't access the context
//             // We'll implement a better solution in a future update
            
//             console.log('Response validated successfully');
            
//             // Return both the text response and sources
//             return {
//               text: response,
//               sources: [] // We'll populate this from the route handler
//             };
//           } catch (validationError) {
//             console.error('Response validation error:', validationError);
//             throw validationError;
//           }
//         }
//       ])
//     ]).withConfig({
//       runName: "LegalRAGPipeline",
//       metadata: {
//         description: "Production RAG pipeline for legal document analysis",
//         version: "1.0.0",
//         metrics: {
//           getCurrentBatchSize: () => batcher.getCurrentBatchSize(),
//           getAverageLatency: () => batcher.getAverageLatency(),
//           getCacheStats: () => vectorCache.getCacheStats()
//         }
//       },
//       maxConcurrency: 5,
//       callbacks: [{
//         handleLLMError: async (e) => {
//           console.error('LLM error handled by callback:', e.message);
//           if (e.message.includes("rate_limit")) {
//             return "Rate limit exceeded. Please try again in a moment.";
//           }
//           if (e.message.includes("hallucination")) {
//             return "I apologize, but I cannot provide a reliable answer based on the available context. Please rephrase your question or provide additional context.";
//           }
//           throw e;
//         }
//       }]
//     });

//     console.log('RAG pipeline successfully created');
//     return pipeline;
//   } catch (error) {
//     console.error('Failed to create RAG pipeline:', error);
//     throw error;
//   }
// };