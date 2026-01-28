/**
 * Stream Optimizer - Batches rapid streaming updates for smoother rendering
 * 
 * Problem: Streaming messages arrive character-by-character or in small chunks,
 * which can cause excessive re-renders and jank.
 * 
 * Solution: Batch updates using requestAnimationFrame to sync with browser refresh rate.
 */

type UpdateCallback = (content: string) => void;

export class StreamOptimizer {
  private pendingContent = '';
  private rafId: number | null = null;
  private callback: UpdateCallback;
  private lastFlushTime = 0;
  private minFlushInterval = 16; // ~60 FPS

  constructor(callback: UpdateCallback) {
    this.callback = callback;
  }

  /**
   * Queue content to be rendered on the next animation frame
   */
  append(content: string): void {
    this.pendingContent += content;

    // If we're already scheduled, just accumulate
    if (this.rafId !== null) return;

    // Check if enough time has passed since last flush
    const now = performance.now();
    const timeSinceLastFlush = now - this.lastFlushTime;

    if (timeSinceLastFlush >= this.minFlushInterval) {
      // Flush immediately if enough time has passed
      this.flush();
    } else {
      // Schedule for next frame
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Immediately flush all pending content
   */
  private flush(): void {
    if (this.pendingContent) {
      this.callback(this.pendingContent);
      this.pendingContent = '';
      this.lastFlushTime = performance.now();
    }
    this.rafId = null;
  }

  /**
   * Force flush and clean up
   */
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.flush();
  }
}
