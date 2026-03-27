/**
 * @module array
 * Array and object utility functions for data manipulation and transformation.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export type Primitive = string | number | boolean | null | undefined;

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Deduplication ────────────────────────────────────────────────────────────

/** Remove duplicate primitives from an array. */
export function unique<T extends Primitive>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** Remove duplicates based on a key selector. */
export function uniqueBy<T>(arr: T[], key: keyof T | ((item: T) => Primitive)): T[] {
  const seen = new Set<Primitive>();
  return arr.filter((item) => {
    const k = typeof key === 'function' ? key(item) : item[key] as Primitive;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

/** Group an array of objects by a key. */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((groups, item) => {
    const k = String(typeof key === 'function' ? key(item) : item[key]);
    groups[k] = [...(groups[k] ?? []), item];
    return groups;
  }, {});
}

/** Count occurrences per group key. */
export function countBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, number> {
  const groups = groupBy(arr, key);
  return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]));
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

/** Sort an array of objects by a key, optionally descending. */
export function sortBy<T>(arr: T[], key: keyof T, direction: SortDirection = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    const gt = aVal > bVal ? 1 : -1;
    return direction === 'asc' ? gt : -gt;
  });
}

/** Sort by multiple keys in order of priority. */
export function sortByMultiple<T>(
  arr: T[],
  keys: { key: keyof T; direction?: SortDirection }[]
): T[] {
  return [...arr].sort((a, b) => {
    for (const { key, direction = 'asc' } of keys) {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) continue;
      const gt = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? gt : -gt;
    }
    return 0;
  });
}

// ─── Filtering ────────────────────────────────────────────────────────────────

/** Remove falsy values from an array. */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}

/** Partition an array into two arrays based on a predicate. */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of arr) {
    (predicate(item) ? pass : fail).push(item);
  }
  return [pass, fail];
}

/** Filter and type-narrow to non-null/undefined items. */
export function filterDefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

// ─── Chunking & Slicing ───────────────────────────────────────────────────────

/** Split an array into chunks of a given size. */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0.');
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Get first N items. */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

/** Get last N items. */
export function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

// ─── Set Operations ───────────────────────────────────────────────────────────

/** Intersection: items present in both arrays. */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

/** Difference: items in `a` that are not in `b`. */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
}

/** Union: all unique items from both arrays. */
export function union<T>(a: T[], b: T[]): T[] {
  return [...new Set([...a, ...b])];
}

// ─── Transformation ───────────────────────────────────────────────────────────

/** Flatten one level of a nested array. */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => acc.concat(val), []);
}

/** Deep flatten to a single level. */
export function flattenDeep<T>(arr: unknown[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    return Array.isArray(val) ? acc.concat(flattenDeep<T>(val)) : [...acc, val as T];
  }, []);
}

/** Convert an array to a record/map by a key. */
export function keyBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T> {
  return arr.reduce<Record<string, T>>((map, item) => {
    const k = String(typeof key === 'function' ? key(item) : item[key]);
    map[k] = item;
    return map;
  }, {});
}

/** Extract values of a specific key from an array of objects. */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map((item) => item[key]);
}

/** Sum an array or an array of objects by a key. */
export function sum(arr: number[]): number;
export function sum<T>(arr: T[], key: keyof T): number;
export function sum<T>(arr: T[] | number[], key?: keyof T): number {
  if (key === undefined) {
    return (arr as number[]).reduce((s, v) => s + v, 0);
  }
  return (arr as T[]).reduce((s, item) => s + Number(item[key!]), 0);
}

/** Zip two arrays into pairs: zip([1,2],[3,4]) → [[1,3],[2,4]]. */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const len = Math.min(a.length, b.length);
  return Array.from({ length: len }, (_, i) => [a[i], b[i]]);
}

/** Shuffle an array (Fisher-Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Get a random sample of N items without replacement. */
export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Get a single random item from an array. */
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Move an item from one index to another. */
export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Pick specific keys from an object. */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>;
}

/** Omit specific keys from an object. */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const keySet = new Set(keys as string[]);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keySet.has(k))
  ) as Omit<T, K>;
}

/** Deep clone an object (JSON-safe). */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Deep merge two objects (right takes precedence). */
export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source) as (keyof typeof source)[]) {
    const sourceVal = source[key];
    const targetVal = result[key as string];
    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object'
    ) {
      result[key as string] = deepMerge(targetVal as object, sourceVal as object);
    } else if (sourceVal !== undefined) {
      result[key as string] = sourceVal;
    }
  }
  return result as T;
}

/** Flatten a nested object to dot-notation keys: { a: { b: 1 } } → { "a.b": 1 }. */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  separator = '.'
): Record<string, unknown> {
  return Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, val]) => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val as Record<string, unknown>, newKey, separator));
    } else {
      acc[newKey] = val;
    }
    return acc;
  }, {});
}

/** Unflatten a dot-notation object back to nested. */
export function unflattenObject(obj: Record<string, unknown>, separator = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split(separator);
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/** Remove keys with null or undefined values from an object. */
export function removeNullish<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

/** Check if an object is empty (no own enumerable keys). */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/** Deep equality check. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  );
}

/** Invert the keys and values of an object. */
export function invertObject(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

/** Rename keys in an object using a mapping. */
export function renameKeys<T extends object>(
  obj: T,
  mapping: Partial<Record<keyof T, string>>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [mapping[k as keyof T] ?? k, v])
  );
}
