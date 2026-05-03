import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  // Strategic Caching (Requirement #9)
  private cache = new Map<string, any>();

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Helper for "expensive" operations
  getOrCreate<T>(key: string, factory: () => T): T {
    if (this.has(key)) {
      return this.get<T>(key)!;
    }
    const value = factory();
    this.set(key, value);
    return value;
  }
}
