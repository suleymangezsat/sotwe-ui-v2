/*
 * Ads rotation store — port of the `ads` + `activeAd` slices from v1
 * `store/index.js` (Vuex root state).
 *
 * Sotwe rotates between several ad networks weighted by the
 * `probabilities` map; only the picked network is rendered on the
 * page. v1's server-side rotation lived in `middleware/ads.js` and
 * was committed to Vuex during `nuxtServerInit`. v2 keeps the same
 * shape — the rotation runs on the **server** so SSR HTML carries the
 * picked ad on first paint (CF caches the 60s SSR response, so most
 * visitors share the rotation result that lasts for the cache lifetime).
 *
 * Networks with weight 0 stay defined so they can be flipped on at
 * runtime via env override without a code change.
 */

import { defineStore } from 'pinia'
import type { ActiveAd } from '~shared/types'

const NO_ADS_ROUTES = new Set([
  '/login',
  '/signup',
  '/logout',
  '/pricing',
  '/me/profile',
  '/me/bookmarks',
  '/me/nearby',
])

const NO_ADS_PREFIXES = [
  '/auth/redirect/',
  '/pricing/',
] as const

/** Default v1 probability map (last touched in production: monetag/admaven 50/50). */
const DEFAULT_PROBABILITIES: Record<ActiveAd, number> = {
  adsterra: 0,
  propellerads: 0,
  evadav: 0,
  admaven: 50,
  adcash: 0,
  monetag: 50,
  popads: 0,
}

export const useAdsStore = defineStore('ads', () => {
  const probabilities = ref<Record<ActiveAd, number>>({ ...DEFAULT_PROBABILITIES })
  const activeAd = ref<ActiveAd | ''>('')

  /**
   * Pick a network using `probabilities` as weights. Mirrors v1's
   * `randexec` helper bit-for-bit so the production traffic split
   * stays identical post-cutover. Returns '' when every weight is 0
   * (visitor sees no rotated ad).
   */
  function rotate(): ActiveAd | '' {
    const entries = Object.entries(probabilities.value) as [ActiveAd, number][]
    const sum = entries.reduce((s, [, p]) => s + p, 0)
    if (sum <= 0) return ''
    const r = Math.random() * sum
    let acc = 0
    for (const [name, p] of entries) {
      acc += p
      if (r < acc) return name
    }
    return entries[entries.length - 1]?.[0] ?? ''
  }

  /**
   * Server-side: roll the dice once per page render so the SSR HTML
   * already carries the picked ad. Skipped when the route is on the
   * NoAds list, when ads are disabled via runtimeConfig, or when an
   * ad has already been picked for this request (idempotent).
   */
  function pickForRoute(routePath: string, options: { disabled?: boolean, override?: ActiveAd | '' } = {}): void {
    if (options.override !== undefined) {
      activeAd.value = options.override
      return
    }
    if (options.disabled || isNoAdsRoute(routePath)) {
      activeAd.value = ''
      return
    }
    if (activeAd.value) return
    activeAd.value = rotate()
  }

  function isNoAdsRoute(path: string): boolean {
    if (NO_ADS_ROUTES.has(path)) return true
    return NO_ADS_PREFIXES.some(p => path.startsWith(p))
  }

  return { probabilities, activeAd, pickForRoute, rotate, isNoAdsRoute }
})
