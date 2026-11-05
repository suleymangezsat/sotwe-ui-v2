import { describe, expect, it } from 'vitest'
import { formatCount } from '~/utils/formatCount'

/*
 * `formatCount` is the K/M abbreviator used in tweet action rows
 * ("1.2K replies", "5M followers"). It mirrors v1's `formatN` filter,
 * so the same input must produce the same output — these tests pin the
 * three buckets (raw / thousands / millions) plus the "no value" case
 * the UI uses to suppress empty count labels.
 */

describe('formatCount', () => {
  it('returns empty string for nullish or zero values', () => {
    expect(formatCount(null)).toBe('')
    expect(formatCount(undefined)).toBe('')
    expect(formatCount(0)).toBe('')
    expect(formatCount(-5)).toBe('')
  })

  it('returns the raw integer below 1000', () => {
    expect(formatCount(1)).toBe('1')
    expect(formatCount(42)).toBe('42')
    expect(formatCount(999)).toBe('999')
  })

  it('compact-formats values in the thousands as `xK`', () => {
    expect(formatCount(1000)).toBe('1K')
    expect(formatCount(1234)).toBe('1.2K')
    expect(formatCount(15_000)).toBe('15K')
    expect(formatCount(999_999)).toMatch(/^1M$/)
  })

  it('compact-formats values in the millions as `xM`', () => {
    expect(formatCount(1_500_000)).toBe('1.5M')
    expect(formatCount(239_400_000)).toBe('239.4M')
  })
})
