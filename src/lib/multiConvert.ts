import { convert, getUnitById } from './units';

// Defining types for multi-conversion operations
export interface MultiConversionItem {
  value: number;
  categoryId: string;
  fromUnitId: string;
  toUnitId: string;
  result?: number;
  error?: string;
}

export interface MultiConversionRequest {
  items: MultiConversionItem[];
  batchId: string;
}

export interface MultiConversionResponse {
  items: MultiConversionItem[];
  batchId: string;
  processingTimeMs: number;
}

/**
 * Worker code as a string for dynamic creation
 * This will be executed in a separate thread
 */
const workerCode = `
  self.onmessage = function(e) {
    const { items, batchId } = e.data;
    const startTime = performance.now();
    
    // Process each conversion item
    const results = items.map(item => {
      try {
        // Basic validation
        if (typeof item.value !== 'number' || isNaN(item.value)) {
          return { ...item, error: 'Invalid value' };
        }
        
        // We can't directly import functions from the main thread
        // So we need to reimplement the conversion logic here
        // In practice, you could use a more sophisticated method
        // like SharedArrayBuffer or importing conversion data at worker init
        
        // For this example, we'll use a simple mock implementation
        // that just passes through the data
        const result = {
          ...item,
          result: item.value,  // Placeholder
          error: undefined
        };
        
        // Simulate processing time for demo purposes
        const delay = Math.random() * 10;
        for (let i = 0; i < delay * 1000000; i++) {
          // Empty loop to consume CPU cycles
        }
        
        return result;
      } catch (error) {
        return { ...item, error: error.message || 'Unknown error' };
      }
    });
    
    // Return the processed results
    self.postMessage({
      items: results,
      batchId,
      processingTimeMs: performance.now() - startTime
    });
  };
`;

/**
 * Create a Blob URL for the worker
 */
const createWorkerBlob = (): string => {
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};

/**
 * Class to manage multi-conversion operations using Web Workers
 */
export class MultiConversionManager {
  private worker: Worker | null = null;
  private conversionQueue: Map<string, (response: MultiConversionResponse) => void> = new Map();
  private isProcessing = false;
  
  constructor() {
    this.initWorker();
  }
  
  private initWorker(): void {
    try {
      // Create worker from Blob URL
      const workerUrl = createWorkerBlob();
      this.worker = new Worker(workerUrl);
      
      // Handle messages from the worker
      this.worker.onmessage = (e: MessageEvent<MultiConversionResponse>) => {
        const { batchId } = e.data;
        
        // Find the callback for this batch
        const callback = this.conversionQueue.get(batchId);
        if (callback) {
          // Process the results on the main thread
          // This is where we'd apply the actual conversion logic 
          // that the worker couldn't directly access
          const finalData = this.processWorkerResults(e.data);
          
          // Execute the callback with the results
          callback(finalData);
          
          // Remove from queue
          this.conversionQueue.delete(batchId);
        }
        
        // Check if there are more items in the queue
        this.isProcessing = this.conversionQueue.size > 0;
      };
      
      // Handle worker errors
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.terminateWorker();
        this.initWorker(); // Recreate worker
      };
      
      // Clean up the Blob URL
      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.error('Failed to initialize worker:', error);
    }
  }
  
  /**
   * Process a batch of conversions in parallel
   * @param items List of conversion items
   * @returns Promise that resolves with conversion results
   */
  public convert(items: MultiConversionItem[]): Promise<MultiConversionResponse> {
    // Generate a unique batch ID
    const batchId = Date.now().toString() + Math.random().toString(36).substring(2);
    
    return new Promise((resolve) => {
      // Add to queue
      this.conversionQueue.set(batchId, resolve);
      
      // If worker is available, process the request
      if (this.worker && !this.isProcessing) {
        this.isProcessing = true;
        this.worker.postMessage({ items, batchId });
      } else if (!this.worker) {
        // Fallback to synchronous processing if worker is not available
        this.processWithoutWorker(items, batchId, resolve);
      }
    });
  }
  
  /**
   * Process worker results on the main thread
   * @param response Worker response
   * @returns Processed response with actual conversion results
   */
  private processWorkerResults(response: MultiConversionResponse): MultiConversionResponse {
    // Apply the actual conversion logic to the worker's results
    const processedItems = response.items.map(item => {
      if (item.error) return item;
      
      try {
        // Perform the actual unit conversion
        const result = convert(
          item.value,
          item.categoryId,
          item.fromUnitId, 
          item.toUnitId
        );
        
        return {
          ...item,
          result: result !== null ? result : undefined,
          error: result === null ? 'Conversion failed' : undefined
        };
      } catch (error) {
        return {
          ...item,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    return {
      ...response,
      items: processedItems
    };
  }
  
  /**
   * Fallback method for processing without a worker
   */
  private processWithoutWorker(
    items: MultiConversionItem[],
    batchId: string,
    callback: (response: MultiConversionResponse) => void
  ): void {
    const startTime = performance.now();
    
    // Process each conversion
    const results = items.map(item => {
      try {
        const result = convert(
          item.value,
          item.categoryId,
          item.fromUnitId,
          item.toUnitId
        );
        
        return {
          ...item,
          result: result !== null ? result : undefined,
          error: result === null ? 'Conversion failed' : undefined
        };
      } catch (error) {
        return {
          ...item,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    // Create response
    const response: MultiConversionResponse = {
      items: results,
      batchId,
      processingTimeMs: performance.now() - startTime
    };
    
    // Execute callback
    setTimeout(() => callback(response), 0);
  }
  
  /**
   * Terminate the worker when no longer needed
   */
  public terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance for easy import
export const multiConverter = new MultiConversionManager(); 