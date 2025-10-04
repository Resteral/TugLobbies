/**
 * Utility helpers
 * - cn: minimal className combiner with conditional values
 */

/**
 * Combine class names with conditional values.
 * Accepts strings, arrays, and objects where truthy values include the key.
 */
export function cn(...args: Array<string | undefined | null | Record<string, boolean> | Array<string | undefined | null>>): string {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === 'string') {
      out.push(a);
    } else if (Array.isArray(a)) {
      out.push(...a.filter(Boolean) as string[]);
    } else if (typeof a === 'object') {
      for (const [k, v] of Object.entries(a)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(' ');
}

/**
 * Safe localStorage getter with SSR guard.
 */
export function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Safe localStorage setter with SSR guard.
 */
export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

/**
 * Parse JSON safely to avoid throwing on corrupted storage.
 */
export function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
