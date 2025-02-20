import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";

import { loadMongoDBStore } from "@/utils/vector-store";

interface SearchResult {
    document: Document;
    score: number;
    vectorScore: number;
    keywordScore: number;
}

export class HybridSearcher {
    private static readonly VECTOR_WEIGHT = 0.65;
    private static readonly KEYWORD_WEIGHT = 0.35;

    constructor(
        private embeddings: Embeddings,
        private topK: number = 5
    ) {}

    // BM25-inspired keyword scoring
    private calculateKeywordScore(text: string, query: string): number {
        const docWords = new Set(text.toLowerCase().split(/\s+/));
        const queryWords = query.toLowerCase().split(/\s+/);
        
        const k1 = 1.5;  // term frequency saturation parameter
        const b = 0.75;  // length normalization parameter
        const avgDocLength = 500;  // assumed average document length
        
        let score = 0;
        for (const word of queryWords) {
            if (docWords.has(word)) {
                const tf = (text.toLowerCase().match(new RegExp(word, 'g')) || []).length;
                const docLength = text.split(/\s+/).length;
                
                // BM25 score calculation
                const numerator = tf * (k1 + 1);
                const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
                score += numerator / denominator;
            }
        }
        
        return score;
    }

    private normalizeScores(scores: number[]): number[] {
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        return scores.map(score => 
            max === min ? 1 : (score - min) / (max - min)
        );
    }

    async search(query: string): Promise<SearchResult[]> {
        const vectorStore = (await loadMongoDBStore()).vectorStore;

        // Get vector search results
        const vectorResults = await vectorStore.similaritySearch(query, this.topK);
        
        // Calculate keyword scores
        const keywordScores = vectorResults.map(doc => 
            this.calculateKeywordScore(doc.pageContent, query)
        );
        
        // Get vector similarity scores (assuming they're between 0 and 1)
        const vectorScores = await vectorStore.similaritySearchWithScore(query, this.topK);
        
        // Normalize scores
        const normalizedKeywordScores = this.normalizeScores(keywordScores);
        const normalizedVectorScores = this.normalizeScores(vectorScores.map(([_, score]) => score));
        
        // Combine scores
        return vectorResults.map((doc, i) => ({
            document: doc,
            vectorScore: normalizedVectorScores[i],
            keywordScore: normalizedKeywordScores[i],
            score: (
                normalizedVectorScores[i] * HybridSearcher.VECTOR_WEIGHT +
                normalizedKeywordScores[i] * HybridSearcher.KEYWORD_WEIGHT
            )
        }))
        .sort((a, b) => b.score - a.score);
    }

    async searchWithRerank(query: string): Promise<SearchResult[]> {
        // First get initial results
        const initialResults = await this.search(query);
        
        // Initialize Groq for reranking
        const groq = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY!,
            modelName: "mixtral-8x7b-32768",  // Using Mixtral model for better reasoning
            temperature: 0
        });
        
        // Create reranking chain
        const rerankingChain = groq
            .pipe(new StringOutputParser())
            .pipe(async (score: string) => parseFloat(score));
            
        // Rerank results
        const rerankedResults = await Promise.all(
            initialResults.map(async (result) => {
                const prompt = `Rate the relevance of this document to the query "${query}" on a scale of 0-1:
                Document: ${result.document.pageContent.substring(0, 500)}...`;
                
                const llmScore = await rerankingChain.invoke(prompt);
                
                return {
                    ...result,
                    score: (result.score + llmScore) / 2
                };
            })
        );
        
        return rerankedResults.sort((a, b) => b.score - a.score);
    }
}