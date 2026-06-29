export class XbrlCache {
  private cache = new Map<string, { data: string; timestamp: number }>();
  private readonly TTL_MS = 1000 * 60 * 60; // 1 hour

  get(url: string): string | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(url);
      return null;
    }
    return entry.data;
  }

  set(url: string, data: string): void {
    this.cache.set(url, { data, timestamp: Date.now() });
    
    // Naive cleanup of old entries when setting new ones
    for (const [key, val] of this.cache.entries()) {
      if (Date.now() - val.timestamp > this.TTL_MS) {
        this.cache.delete(key);
      }
    }
  }
}
