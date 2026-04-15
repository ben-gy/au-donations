// Formatting helpers — pure functions, fully unit-tested.

export function formatCurrency(amount: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(amount)) return '—';
  if (opts.compact) {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 10_000) return `$${(amount / 1_000).toFixed(0)}k`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}k`;
    return `$${amount.toFixed(0)}`;
  }
  return `$${formatNumber(Math.round(amount))}`;
}

export function formatNumber(value: number, decimals: number = 0): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse a financial year string like "2023-24" into its starting calendar year.
 * Returns NaN on malformed input.
 */
export function parseFyStart(fy: string): number {
  const match = /^(\d{4})-(\d{2})$/.exec(fy);
  if (!match) return NaN;
  const start = Number(match[1]);
  const endShort = Number(match[2]);
  // Sanity check: end year must be exactly start+1 (mod 100)
  if ((start + 1) % 100 !== endShort) return NaN;
  return start;
}

export function fyLabel(fy: string): string {
  const start = parseFyStart(fy);
  if (Number.isNaN(start)) return fy;
  return `FY${String(start).slice(2)}-${String(start + 1).slice(2)}`;
}

/**
 * Compare two financial year strings. Returns -1/0/1 for a vs b.
 */
export function compareFy(a: string, b: string): number {
  const aStart = parseFyStart(a);
  const bStart = parseFyStart(b);
  if (Number.isNaN(aStart) && Number.isNaN(bStart)) return 0;
  if (Number.isNaN(aStart)) return 1;
  if (Number.isNaN(bStart)) return -1;
  return aStart - bStart;
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if truncated.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '\u2026';
}
