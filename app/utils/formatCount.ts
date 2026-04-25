/*
 * Tweet action counter formatter — matches the `formatN` filter in v1:
 *   < 1 000   → "123"
 *   < 1 000 000 → "1.2K"
 *   >= 1M    → "1.2M"
 */

export function formatCount(n: number | undefined | null): string {
  if (!n || n <= 0) return ''
  if (n < 1000) return String(n)
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
