import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

interface VectorCacheConfig {
  maxSize?: number;          // Maximum number of entries in cache
  ttlMs?: number;           // Time-to-live in milliseconds
  similarityThreshold?: number; // Threshold for considering vectors similar
  persistToLocalStorage?: boolean; // Whether to persist cache to localStorage
}

export class VectorCache {
  private embeddingCache: Map<string, CacheEntry<number[]>>;
  private retrievalCache: Map<string, CacheEntry<Document[]>>;
  private maxSize: number;
  private ttlMs: number;
  private similarityThreshold: number;
  private persistToLocalStorage: boolean;

  constructor(config: VectorCacheConfig = {}) {
    this.maxSize = config.maxSize || 1000;
    this.ttlMs = config.ttlMs || 30 * 60 * 1000; // 30 minutes default
    this.similarityThreshold = config.similarityThreshold || 0.95;
    this.persistToLocalStorage = config.persistToLocalStorage || false;
    
    this.embeddingCache = new Map();
    this.retrievalCache = new Map();

    if (this.persistToLocalStorage) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const embeddingData = localStorage.getItem('vectorCache_embeddings');
      const retrievalData = localStorage.getItem('vectorCache_retrievals');

      if (embeddingData) {
        this.embeddingCache = new Map(JSON.parse(embeddingData));
      }
      if (retrievalData) {
        this.retrievalCache = new Map(JSON.parse(retrievalData));
      }

      // Clean expired entries after loading
      this.cleanExpiredEntries();
    } catch (error) {
      console.warn('Failed to load vector cache from localStorage:', error);
    }
  }

  private saveToLocalStorage() {
    if (!this.persistToLocalStorage) return;

    try {
      localStorage.setItem(
        'vectorCache_embeddings',
        JSON.stringify(Array.from(this.embeddingCache.entries()))
      );
      localStorage.setItem(
        'vectorCache_retrievals',
        JSON.stringify(Array.from(this.retrievalCache.entries()))
      );
    } catch (error) {
      console.warn('Failed to save vector cache to localStorage:', error);
    }
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    
    for (const [key, entry] of this.embeddingCache.entries()) {
      if (entry.expiresAt < now) {
        this.embeddingCache.delete(key);
      }
    }

    for (const [key, entry] of this.retrievalCache.entries()) {
      if (entry.expiresAt < now) {
        this.retrievalCache.delete(key);
      }
    }

    // Enforce max size limit using LRU policy
    if (this.embeddingCache.size > this.maxSize) {
      const sortedEntries = Array.from(this.embeddingCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - this.maxSize);
      for (const [key] of entriesToRemove) {
        this.embeddingCache.delete(key);
      }
    }

    if (this.retrievalCache.size > this.maxSize) {
      const sortedEntries = Array.from(this.retrievalCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - this.maxSize);
      for (const [key] of entriesToRemove) {
        this.retrievalCache.delete(key);
      }
    }

    if (this.persistToLocalStorage) {
      this.saveToLocalStorage();
    }
  }

  private computeCacheKey(text: string, metadata?: Record<string, any>): string {
    const metadataStr = metadata ? JSON.stringify(metadata) : '';
    return `${text}:${metadataStr}`;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getCachedEmbedding(
    text: string,
    embeddings: Embeddings,
    metadata?: Record<string, any>
  ): Promise<number[] | null> {
    const cacheKey = this.computeCacheKey(text, metadata);
    const cached = this.embeddingCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const embedding = await embeddings.embedQuery(text);
    
    this.embeddingCache.set(cacheKey, {
      value: embedding,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ttlMs
    });

    this.cleanExpiredEntries();
    return embedding;
  }

  async getCachedRetrieval(
    query: string,
    vectorStore: VectorStore,
    metadata?: Record<string, any>
  ): Promise<Document[] | null> {
    const cacheKey = this.computeCacheKey(query, metadata);
    const cached = this.retrievalCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const results = await vectorStore.similaritySearch(query);
    
    this.retrievalCache.set(cacheKey, {
      value: results,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ttlMs
    });

    this.cleanExpiredEntries();
    return results;
  }

  async findSimilarCachedQuery(
    embedding: number[],
    metadata?: Record<string, any>
  ): Promise<Document[] | null> {
    for (const [key, entry] of this.retrievalCache.entries()) {
      if (entry.expiresAt < Date.now()) continue;

      const [cachedQuery] = key.split(':');
      const cachedEmbedding = await this.embeddingCache.get(cachedQuery);

      if (cachedEmbedding && 
          this.cosineSimilarity(embedding, cachedEmbedding.value) > this.similarityThreshold) {
        return entry.value;
      }
    }

    return null;
  }

  clearCache() {
    this.embeddingCache.clear();
    this.retrievalCache.clear();
    
    if (this.persistToLocalStorage) {
      localStorage.removeItem('vectorCache_embeddings');
      localStorage.removeItem('vectorCache_retrievals');
    }
  }

  getCacheStats() {
    return {
      embeddingCacheSize: this.embeddingCache.size,
      retrievalCacheSize: this.retrievalCache.size,
      hitRate: {
        embeddings: this.getHitRate(this.embeddingCache),
        retrievals: this.getHitRate(this.retrievalCache)
      }
    };
  }

  private getHitRate(cache: Map<string, CacheEntry<any>>): number {
    let hits = 0;
    let total = 0;
    
    for (const entry of cache.values()) {
      if (entry.timestamp > Date.now() - (5 * 60 * 1000)) { // Last 5 minutes
        total++;
        if (entry.expiresAt > Date.now()) {
          hits++;
        }
      }
    }
    
    return total === 0 ? 0 : hits / total;
  }
}