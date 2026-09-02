/**
 * Distributed Cache Manager Engine
 * High-performance key-value caching layer with TTL expiration and pattern-based invalidation.
 */

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
}

export class CacheManager {
  private store = new Map<string, CacheEntry>();
  private hitsCount = 0;
  private missesCount = 0;

  /**
   * Set key in cache with TTL in milliseconds (default 60,000ms)
   */
  public set<T>(key: string, value: T, ttlMs: number = 60000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get value from cache if present and not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.missesCount += 1;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missesCount += 1;
      return null;
    }

    this.hitsCount += 1;
    return entry.value as T;
  }

  /**
   * Invalidate keys matching a pattern string (e.g. "user:*")
   */
  public invalidateByPattern(pattern: string): number {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    let deletedCount = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount += 1;
      }
    }

    return deletedCount;
  }

  /**
   * Get real-time cache performance metrics
   */
  public getStats(): { totalKeys: number; hitsCount: number; missesCount: number; hitRatioPercent: number } {
    const totalRequests = this.hitsCount + this.missesCount;
    const hitRatioPercent = totalRequests > 0 ? Number(((this.hitsCount / totalRequests) * 100).toFixed(2)) : 0;
    return {
      totalKeys: this.store.size,
      hitsCount: this.hitsCount,
      missesCount: this.missesCount,
      hitRatioPercent,
    };
  }
}

export const cacheManager = new CacheManager();
