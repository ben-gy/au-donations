import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  parseFyStart,
  fyLabel,
  compareFy,
  truncate,
} from '../src/utils/format';

describe('formatNumber', () => {
  it('formats thousands with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
  it('handles negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
  it('supports decimal places', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });
  it('returns em-dash for non-finite', () => {
    expect(formatNumber(NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('—');
  });
});

describe('formatCurrency', () => {
  it('prefixes with $ and rounds to integer', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
  it('compact millions', () => {
    expect(formatCurrency(5_600_000, { compact: true })).toBe('$5.60M');
  });
  it('compact billions', () => {
    expect(formatCurrency(2_500_000_000, { compact: true })).toBe('$2.50B');
  });
  it('compact thousands', () => {
    expect(formatCurrency(15_000, { compact: true })).toBe('$15k');
  });
  it('compact small thousands uses one decimal', () => {
    expect(formatCurrency(1500, { compact: true })).toBe('$1.5k');
  });
  it('compact sub-thousand', () => {
    expect(formatCurrency(450, { compact: true })).toBe('$450');
  });
});

describe('formatPercent', () => {
  it('appends percent sign', () => {
    expect(formatPercent(12.3456)).toBe('12.3%');
  });
  it('respects decimal places', () => {
    expect(formatPercent(12.3456, 2)).toBe('12.35%');
  });
  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });
});

describe('parseFyStart', () => {
  it('parses valid financial years', () => {
    expect(parseFyStart('2023-24')).toBe(2023);
    expect(parseFyStart('1999-00')).toBe(1999);
  });
  it('returns NaN for malformed input', () => {
    expect(parseFyStart('2023')).toBeNaN();
    expect(parseFyStart('2023-25')).toBeNaN();
    expect(parseFyStart('')).toBeNaN();
    expect(parseFyStart('FY2023')).toBeNaN();
  });
});

describe('fyLabel', () => {
  it('formats valid FY strings', () => {
    expect(fyLabel('2023-24')).toBe('FY23-24');
  });
  it('returns original string on malformed input', () => {
    expect(fyLabel('invalid')).toBe('invalid');
  });
});

describe('compareFy', () => {
  it('returns negative when a precedes b', () => {
    expect(compareFy('2022-23', '2023-24')).toBeLessThan(0);
  });
  it('returns positive when a follows b', () => {
    expect(compareFy('2023-24', '2022-23')).toBeGreaterThan(0);
  });
  it('returns zero for equal years', () => {
    expect(compareFy('2023-24', '2023-24')).toBe(0);
  });
  it('sorts malformed last', () => {
    expect(compareFy('invalid', '2023-24')).toBeGreaterThan(0);
  });
});

describe('truncate', () => {
  it('leaves short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello w\u2026');
  });
  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});
