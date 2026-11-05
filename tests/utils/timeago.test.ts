import { describe, expect, it } from 'vitest'
import { formatCreatedAt, formatCreatedAtAbsolute } from '~/utils/timeago'

/*
 * Tweet timestamps render in two places: the relative chip on each
 * tweet row ("5m", "2h", "Apr 19") and the absolute tooltip ("Apr 19,
 * 2024, 14:32"). v1's `vue-timeago` plugin produced the same compact
 * shape — these tests pin the four boundaries (sec / min / hour /
 * year) so a future tweak doesn't accidentally widen the format.
 *
 * `now` is passed in explicitly so the tests are deterministic across
 * machines and timezones.
 */

const NOW = new Date('2026-04-28T12:00:00Z')

describe('formatCreatedAt', () => {
  it('returns "now" for sub-minute deltas', () => {
    expect(formatCreatedAt(new Date(NOW.getTime() - 30_000), 'en-US', NOW)).toBe('now')
    expect(formatCreatedAt(NOW, 'en-US', NOW)).toBe('now')
  })

  it('returns minutes for sub-hour deltas', () => {
    expect(formatCreatedAt(new Date(NOW.getTime() - 5 * 60_000), 'en-US', NOW)).toBe('5m')
    expect(formatCreatedAt(new Date(NOW.getTime() - 59 * 60_000), 'en-US', NOW)).toBe('59m')
  })

  it('returns hours for sub-day deltas', () => {
    expect(formatCreatedAt(new Date(NOW.getTime() - 2 * 3600_000), 'en-US', NOW)).toBe('2h')
    expect(formatCreatedAt(new Date(NOW.getTime() - 23 * 3600_000), 'en-US', NOW)).toBe('23h')
  })

  it('falls back to "MMM d" for older same-year deltas', () => {
    // 7 days back from 2026-04-28 → 2026-04-21. en-US locale → "Apr 21".
    const d = new Date(NOW.getTime() - 7 * 86400_000)
    expect(formatCreatedAt(d, 'en-US', NOW)).toBe('Apr 21')
  })

  it('includes the year for prior-year deltas', () => {
    const d = new Date('2024-06-12T00:00:00Z')
    // en-US locale → "Jun 12, 2024" (some Node ICU versions emit a NBSP
    // before the year — assert on the parts rather than the literal).
    const out = formatCreatedAt(d, 'en-US', NOW)
    expect(out).toMatch(/^Jun\s12,\s+2024$/)
  })
})

describe('formatCreatedAtAbsolute', () => {
  it('renders a long-form date+time string', () => {
    const out = formatCreatedAtAbsolute('2026-04-28T14:32:00Z', 'en-US')
    // Don't assert the exact hour because the test machine's TZ shifts
    // it — just confirm the date components are present.
    expect(out).toMatch(/Apr 28, 2026/)
    expect(out).toMatch(/\d{1,2}:\d{2}/)
  })
})
