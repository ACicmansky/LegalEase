export class AdaptiveBatcher {
    private minBatchSize: number;
    private maxBatchSize: number;
    private targetLatencyMs: number;
    private currentBatchSize: number;
    private recentLatencies: number[];
    private maxLatencies: number;
  
    constructor({
      minBatchSize = 1,
      maxBatchSize = 10,
      targetLatencyMs = 500,
      maxLatencies = 50,
    } = {}) {
      this.minBatchSize = minBatchSize;
      this.maxBatchSize = maxBatchSize;
      this.targetLatencyMs = targetLatencyMs;
      this.currentBatchSize = minBatchSize;
      this.recentLatencies = [];
      this.maxLatencies = maxLatencies;
    }
  
    private updateBatchSize(latencyMs: number) {
      this.recentLatencies.push(latencyMs);
      if (this.recentLatencies.length > this.maxLatencies) {
        this.recentLatencies.shift();
      }
  
      const avgLatency = this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
      
      if (avgLatency > this.targetLatencyMs * 1.1) {
        // Latency too high, decrease batch size
        this.currentBatchSize = Math.max(
          this.minBatchSize,
          Math.floor(this.currentBatchSize * 0.8)
        );
      } else if (avgLatency < this.targetLatencyMs * 0.9) {
        // Latency acceptable, try increasing batch size
        this.currentBatchSize = Math.min(
          this.maxBatchSize,
          Math.floor(this.currentBatchSize * 1.2)
        );
      }
    }
  
    async processBatch<T>(
      items: T[],
      processor: (batch: T[]) => Promise<any[]>
    ): Promise<any[]> {
      const results: any[] = [];
      const startTime = Date.now();
  
      for (let i = 0; i < items.length; i += this.currentBatchSize) {
        const batch = items.slice(i, i + this.currentBatchSize);
        const batchStartTime = Date.now();
        
        try {
          const batchResults = await processor(batch);
          results.push(...batchResults);
          
          const batchLatency = Date.now() - batchStartTime;
          this.updateBatchSize(batchLatency);
        } catch (error) {
          console.error(`Batch processing error:`, error);
          // On error, reduce batch size immediately
          this.currentBatchSize = Math.max(this.minBatchSize, Math.floor(this.currentBatchSize * 0.5));
          throw error;
        }
      }
  
      return results;
    }
  
    getCurrentBatchSize(): number {
      return this.currentBatchSize;
    }
  
    getAverageLatency(): number {
      if (this.recentLatencies.length === 0) return 0;
      return this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
    }
  }