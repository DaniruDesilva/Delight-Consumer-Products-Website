/**
 * lib/cache.ts
 * Simple in-memory TTL cache for API responses.
 * Reduces SQLite reads on every request on cPanel shared hosting.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value. Returns undefined if not found or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  /**
   * Set a value with a TTL in milliseconds.
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate a specific key or all keys matching a prefix.
   */
  invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix + ':')) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries.
   */
  clear(): void {
    this.store.clear();
  }
}

// TTL presets (milliseconds)
export const TTL = {
  SHORT: 30_000,       // 30 seconds  — frequently changing data
  MEDIUM: 60_000,      // 1 minute    — products, categories
  LONG: 300_000,       // 5 minutes   — settings, slides, brands
  VERY_LONG: 900_000,  // 15 minutes  — static page content
} as const;

// Singleton cache instance (persists across requests within the same Node process)
export const apiCache = new TTLCache();
