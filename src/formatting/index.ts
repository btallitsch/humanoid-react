/**
 * @module formatting
 * Data formatting and parsing utilities.
 * Covers numbers, currency, file sizes, phone numbers, addresses, tables, and more.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormatNumberOptions {
  decimals?: number;
  locale?: string;
  compact?: boolean;
}

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface TableRow {
  [key: string]: string | number | boolean | null | undefined;
}

// ─── Numbers ─────────────────────────────────────────────────────────────────

/** Format a number with locale-aware separators. */
export function formatNumber(
  value: number,
  options: FormatNumberOptions = {}
): string {
  const { decimals = 2, locale = 'en-US', compact = false } = options;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

/** Format as a compact number: 1200 → "1.2K", 1500000 → "1.5M". */
export function formatCompact(value: number, locale = 'en-US'): string {
  return formatNumber(value, { compact: true, locale });
}

/** Format as a percentage: 0.25 → "25%". */
export function formatPercent(value: number, decimals = 1, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format as an ordinal: 1 → "1st", 2 → "2nd", 3 → "3rd". */
export function formatOrdinal(n: number, locale = 'en-US'): string {
  return new Intl.PluralRules(locale, { type: 'ordinal' }).select(n) === 'one'
    ? `${n}st`
    : new Intl.PluralRules(locale, { type: 'ordinal' }).select(n) === 'two'
    ? `${n}nd`
    : new Intl.PluralRules(locale, { type: 'ordinal' }).select(n) === 'few'
    ? `${n}rd`
    : `${n}th`;
}

/** Pad a number with leading zeros: padNumber(7, 3) → "007". */
export function padNumber(value: number, totalLength: number): string {
  return String(value).padStart(totalLength, '0');
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/** Format a number as currency: formatCurrency(1500, 'USD') → "$1,500.00". */
export function formatCurrency(
  value: number,
  currencyCode = 'USD',
  locale = 'en-US',
  decimals = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Parse a currency string to a number: "$1,234.56" → 1234.56 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}

// ─── File Sizes ───────────────────────────────────────────────────────────────

const FILE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/** Format bytes to a human-readable size: 1536 → "1.5 KB". */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(decimals)} ${FILE_UNITS[i]}`;
}

/** Parse a file size string back to bytes: "1.5 KB" → 1536. */
export function parseFileSize(value: string): number {
  const match = value.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB|PB)?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = (match[2] ?? 'B').toUpperCase();
  const index = FILE_UNITS.indexOf(unit);
  return Math.round(num * Math.pow(1024, index));
}

// ─── Phone Numbers ───────────────────────────────────────────────────────────

/** Format a US phone number: "5551234567" → "(555) 123-4567". */
export function formatUSPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return digits;
}

/** Strip all non-digit characters from a phone string. */
export function stripPhone(value: string): string {
  return value.replace(/\D/g, '');
}

// ─── Addresses ────────────────────────────────────────────────────────────────

/** Format address components into a single line. */
export function formatAddressOneLine(addr: AddressComponents): string {
  return [addr.street, addr.city, addr.state, addr.zip, addr.country]
    .filter(Boolean)
    .join(', ');
}

/** Format address as multi-line. */
export function formatAddressMultiLine(addr: AddressComponents): string {
  const lines: string[] = [];
  if (addr.street) lines.push(addr.street);
  const cityState = [addr.city, addr.state].filter(Boolean).join(', ');
  const zipCountry = [addr.zip, addr.country].filter(Boolean).join(' ');
  if (cityState) lines.push(cityState);
  if (zipCountry) lines.push(zipCountry);
  return lines.join('\n');
}

// ─── Names ────────────────────────────────────────────────────────────────────

/** Format first + last name into a display name. */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/** Get initials from a full name: "John Doe" → "JD". */
export function getInitials(fullName: string, maxInitials = 2): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, maxInitials)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── IDs & Codes ─────────────────────────────────────────────────────────────

/** Format a number as a zero-padded ID: "00042". */
export function formatID(value: number, length = 5, prefix = ''): string {
  return `${prefix}${String(value).padStart(length, '0')}`;
}

/** Generate a short random alphanumeric code. */
export function randomCode(length = 6, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Lists & Tables ───────────────────────────────────────────────────────────

/** Join an array into a natural language list: ["a","b","c"] → "a, b, and c". */
export function formatList(items: string[], conjunction = 'and', locale = 'en-US'): string {
  if ('ListFormat' in Intl) {
    return new (Intl as unknown as { ListFormat: new (locale: string, opts: object) => { format: (items: string[]) => string } })
      .ListFormat(locale, { style: 'long', type: 'conjunction' })
      .format(items);
  }
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/** Convert an array of objects to a CSV string. */
export function toCSV(rows: TableRow[], headers?: string[]): string {
  if (rows.length === 0) return '';
  const keys = headers ?? Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const headerRow = keys.map(escape).join(',');
  const dataRows = rows.map((row) => keys.map((k) => escape(row[k])).join(','));
  return [headerRow, ...dataRows].join('\n');
}

/** Parse a simple CSV string into an array of objects. */
export function fromCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Mask a string, leaving the last N characters visible: maskString("4242424242424242", 4) → "************4242". */
export function maskString(value: string, visibleChars = 4, maskChar = '*'): string {
  if (value.length <= visibleChars) return value;
  return maskChar.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

/** Truncate a string and add an ellipsis: truncate("Hello World", 7) → "Hello…". */
export function truncate(value: string, maxLength: number, ellipsis = '…'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/** Pluralize a word based on count: pluralize("item", 3) → "items". */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural ?? `${word}s`;
}

/** Format bytes: alias for formatFileSize */
export const formatBytes = formatFileSize;
