import { LRUCache } from "lru-cache";

export class LRUCacheHelper {
  private cache: LRUCache<string, string>;

  constructor(maxEntries: number = 100, ttlMs: number = 1000 * 60 * 10) {
    this.cache = new LRUCache<string, string>({
      max: maxEntries,
      ttl: ttlMs,
    });
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

let globalToolCache: LRUCacheHelper | null = null;

export function getToolCache(): LRUCacheHelper {
  if (!globalToolCache) {
    globalToolCache = new LRUCacheHelper();
  }
  return globalToolCache;
}
