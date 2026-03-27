/**
 * @module string
 * Comprehensive string manipulation utilities.
 */

// ─── Case Transforms ──────────────────────────────────────────────────────────

/** Convert to camelCase: "hello world" → "helloWorld". */
export function toCamelCase(value: string): string {
  return value
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/** Convert to PascalCase: "hello world" → "HelloWorld". */
export function toPascalCase(value: string): string {
  const camel = toCamelCase(value);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/** Convert to snake_case: "Hello World" → "hello_world". */
export function toSnakeCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/** Convert to kebab-case: "Hello World" → "hello-world". */
export function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/** Convert to SCREAMING_SNAKE_CASE: "hello world" → "HELLO_WORLD". */
export function toScreamingSnakeCase(value: string): string {
  return toSnakeCase(value).toUpperCase();
}

/** Title case: "hello world" → "Hello World". */
export function toTitleCase(value: string): string {
  const minors = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'up', 'as']);
  return value
    .toLowerCase()
    .split(' ')
    .map((word, i) =>
      i === 0 || !minors.has(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(' ');
}

/** Sentence case: "hello WORLD" → "Hello world". */
export function toSentenceCase(value: string): string {
  const trimmed = value.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Swap the case of each character. */
export function swapCase(value: string): string {
  return value
    .split('')
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('');
}

// ─── Whitespace & Padding ─────────────────────────────────────────────────────

/** Remove leading/trailing whitespace and collapse internal whitespace. */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Pad center: centerPad("hi", 10) → "    hi    ". */
export function centerPad(value: string, totalLength: number, padChar = ' '): string {
  const totalPad = Math.max(0, totalLength - value.length);
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return padChar.repeat(left) + value + padChar.repeat(right);
}

// ─── Searching & Matching ─────────────────────────────────────────────────────

/** Case-insensitive string includes check. */
export function includesCI(source: string, search: string): boolean {
  return source.toLowerCase().includes(search.toLowerCase());
}

/** Case-insensitive equality check. */
export function equalsCI(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** Count occurrences of a substring. */
export function countOccurrences(source: string, search: string): number {
  if (search === '') return 0;
  return source.split(search).length - 1;
}

/** Returns true if a string starts with a prefix (case-insensitive). */
export function startsWithCI(value: string, prefix: string): boolean {
  return value.toLowerCase().startsWith(prefix.toLowerCase());
}

/** Returns true if a string ends with a suffix (case-insensitive). */
export function endsWithCI(value: string, suffix: string): boolean {
  return value.toLowerCase().endsWith(suffix.toLowerCase());
}

// ─── Transformation ───────────────────────────────────────────────────────────

/** Reverse a string. */
export function reverse(value: string): string {
  return [...value].reverse().join('');
}

/** Repeat a string N times with an optional separator. */
export function repeat(value: string, times: number, separator = ''): string {
  return Array(times).fill(value).join(separator);
}

/** Truncate in the middle: "abcdefgh" → "ab…gh". */
export function truncateMiddle(value: string, maxLength: number, ellipsis = '…'): string {
  if (value.length <= maxLength) return value;
  const charsToKeep = maxLength - ellipsis.length;
  const leftChars = Math.ceil(charsToKeep / 2);
  const rightChars = Math.floor(charsToKeep / 2);
  return value.slice(0, leftChars) + ellipsis + value.slice(value.length - rightChars);
}

/** Replace all occurrences of a substring. */
export function replaceAll(source: string, search: string, replacement: string): string {
  return source.split(search).join(replacement);
}

/** Remove all occurrences of substrings from a string. */
export function removeAll(source: string, ...substrings: string[]): string {
  return substrings.reduce((acc, sub) => replaceAll(acc, sub, ''), source);
}

/** Strip HTML tags from a string. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/** Escape HTML special characters. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Unescape HTML entities. */
export function unescapeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Convert newlines to HTML <br> tags. */
export function nl2br(value: string): string {
  return value.replace(/\n/g, '<br>');
}

/** Remove diacritics (accents) from a string: "café" → "cafe". */
export function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Slugs & URLs ─────────────────────────────────────────────────────────────

/** Create a URL-safe slug: "Hello World!" → "hello-world". */
export function toSlug(value: string): string {
  return removeDiacritics(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Extraction ───────────────────────────────────────────────────────────────

/** Extract all email addresses from a string. */
export function extractEmails(value: string): string[] {
  return value.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g) ?? [];
}

/** Extract all URLs from a string. */
export function extractURLs(value: string): string[] {
  return value.match(/https?:\/\/[^\s]+/g) ?? [];
}

/** Extract all phone numbers from a string (basic patterns). */
export function extractPhones(value: string): string[] {
  return value.match(/\+?[\d\s\-().]{7,20}/g)?.map((p) => p.trim()) ?? [];
}

/** Extract all numbers (integers and floats) from a string. */
export function extractNumbers(value: string): number[] {
  return (value.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

// ─── Comparison & Distance ────────────────────────────────────────────────────

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/** Similarity score between 0 and 1 based on Levenshtein distance. */
export function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

/** Split a string by multiple delimiters. */
export function splitMulti(value: string, ...delimiters: string[]): string[] {
  if (delimiters.length === 0) return [value];
  const escaped = delimiters.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return value.split(new RegExp(escaped.join('|'))).map((s) => s.trim()).filter(Boolean);
}

/** Parse a "key=value" string into a key-value map. */
export function parseKeyValue(
  value: string,
  pairSeparator = ';',
  kvSeparator = '='
): Record<string, string> {
  return Object.fromEntries(
    value
      .split(pairSeparator)
      .map((pair) => pair.split(kvSeparator).map((s) => s.trim()))
      .filter(([k]) => k)
      .map(([k, v]) => [k, v ?? ''])
  );
}

/** Interpolate template strings: interpolate("Hello, {name}!", { name: "Bill" }) → "Hello, Bill!" */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** Count words in a string. */
export function wordCount(value: string): number {
  return value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
}

/** Count unique words in a string (case-insensitive). */
export function uniqueWordCount(value: string): number {
  return new Set(value.toLowerCase().match(/\b\w+\b/g) ?? []).size;
}
