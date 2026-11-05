import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdsStore } from '~/stores/ads'

/*
 * Ad rotation store mirrors v1's `randexec` Vuex slice. Pin three
 * properties that the post-cutover production traffic split depends
 * on:
 *
 *   - `pickForRoute` is a noop on the NoAds list (v1 parity)
 *   - the weighted RNG returns each weighted network proportional to
 *     its weight, never a 0-weight one
 *   - `?test=foo` overrides skip the weighting entirely
 *
 * The RNG path is exercised with a stubbed `Math.random` so the
 * assertions stay deterministic across machines.
 */

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useAdsStore.pickForRoute', () => {
  it('clears activeAd on NoAds routes regardless of probabilities', () => {
    const ads = useAdsStore()
    ads.activeAd = 'monetag'
    ads.pickForRoute('/login')
    expect(ads.activeAd).toBe('')
    ads.activeAd = 'monetag'
    ads.pickForRoute('/pricing/stripe/success')
    expect(ads.activeAd).toBe('')
  })

  it('clears activeAd when ads are disabled', () => {
    const ads = useAdsStore()
    ads.pickForRoute('/elonmusk', { disabled: true })
    expect(ads.activeAd).toBe('')
  })

  it('respects an explicit override (e.g. ?test=adcash)', () => {
    const ads = useAdsStore()
    ads.pickForRoute('/elonmusk', { override: 'adcash' })
    expect(ads.activeAd).toBe('adcash')
  })

  it('is idempotent — does not re-roll once a network is pinned', () => {
    const ads = useAdsStore()
    ads.activeAd = 'monetag'
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      ads.pickForRoute('/elonmusk')
      expect(ads.activeAd).toBe('monetag')
    }
    finally {
      spy.mockRestore()
    }
  })

  it('rolls a new network when activeAd is empty', () => {
    const ads = useAdsStore()
    // Force the bottom of the weighted range — picks the first
    // non-zero entry (admaven=50 in the default map).
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      ads.pickForRoute('/elonmusk')
      expect(ads.activeAd).toBe('admaven')
    }
    finally {
      spy.mockRestore()
    }
  })
})

describe('useAdsStore.rotate', () => {
  it('returns "" when every weight is 0', () => {
    const ads = useAdsStore()
    for (const k of Object.keys(ads.probabilities)) {
      ads.probabilities[k as keyof typeof ads.probabilities] = 0
    }
    expect(ads.rotate()).toBe('')
  })

  it('matches the weight distribution', () => {
    const ads = useAdsStore()
    // admaven=50, monetag=50 — Math.random returning 0.25 sits in the
    // first half (admaven), 0.75 in the second (monetag).
    const spy = vi.spyOn(Math, 'random')
    try {
      spy.mockReturnValueOnce(0.25)
      expect(ads.rotate()).toBe('admaven')
      spy.mockReturnValueOnce(0.75)
      expect(ads.rotate()).toBe('monetag')
    }
    finally {
      spy.mockRestore()
    }
  })
})

describe('useAdsStore.isNoAdsRoute', () => {
  it.each([
    ['/login', true],
    ['/signup', true],
    ['/me/profile', true],
    ['/pricing', true],
    ['/pricing/stripe/success', true],
    ['/auth/redirect/google', true],
    ['/elonmusk', false],
    ['/tweet/123', false],
    ['/', false],
  ])('classifies %s → %s', (path, expected) => {
    const ads = useAdsStore()
    expect(ads.isNoAdsRoute(path)).toBe(expected)
  })
})
