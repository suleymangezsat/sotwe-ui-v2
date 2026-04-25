/*
 * Compact Twitter-style timeago formatter + absolute tooltip string.
 *   < 60s   → "now"
 *   < 1h    → "5m"
 *   < 24h   → "2h"
 *   same yr → "Apr 19"
 *   older   → "Apr 19, 2023"
 * Uses `Intl.DateTimeFormat` for locale-sensitive month names — no
 * date-fns dependency, keeps the bundle lean.
 */

export function formatCreatedAt(
  input: number | string | Date,
  locale?: string,
  now: Date = new Date(),
): string {
  const d = input instanceof Date ? input : new Date(input)
  const deltaMs = now.getTime() - d.getTime()
  const deltaSec = Math.floor(deltaMs / 1000)

  if (deltaSec < 60) return 'now'
  if (deltaSec < 3600) return `${Math.floor(deltaSec / 60)}m`
  if (deltaSec < 86400) return `${Math.floor(deltaSec / 3600)}h`

  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(locale, sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Full absolute ISO-ish string for <time title="..."> tooltips. */
export function formatCreatedAtAbsolute(
  input: number | string | Date,
  locale?: string,
): string {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
