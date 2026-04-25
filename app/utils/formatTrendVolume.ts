/*
 * V1 string parity:
 *   `trendspage.tweetVolume` = "Under 10K tweets | {volume} tweets"
 * The i18n plural syntax `A | B` picks B when `volume >= 10_000`.
 */

export function formatTrendVolume(volume: number | undefined | null): string | undefined {
  if (!volume || volume <= 0) return undefined
  if (volume < 10_000) return 'Under 10K tweets'
  return `${formatCompact(volume)} tweets`
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
