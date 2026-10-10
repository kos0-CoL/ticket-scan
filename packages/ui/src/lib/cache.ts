/**
 * In-memory cache with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    this.defaultTtl = defaultTtlMs;
  }

  set(key: string, data: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtl);
    this.store.set(key, { data, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // Get all keys (for debugging)
  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

// Singleton cache instance for models
export const modelCache = new Cache<any[]>(5 * 60 * 1000); // 5 minutes TTL

// Cache key generator
export function getModelCacheKey(providerName: string): string {
  return `models:${providerName.toLowerCase()}`;
}