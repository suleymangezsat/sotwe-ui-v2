/*
 * Per-route ad rotation. Mirrors v1 `middleware/ads.js`:
 *   - Skip the rotation entirely on auth / pricing / profile pages
 *     (NoAdsPages list, baked into `useAdsStore.isNoAdsRoute`).
 *   - `?test=monetag` query forces a specific network so QA can pin
 *     a render — only honoured on the server (so the visitor can't
 *     spam-load any zone they want by query string).
 *   - On any other route, pick once per request via the weighted
 *     probability map.
 *
 * Runs as `app:rendered` on the server so the SSR HTML already
 * carries `ads.activeAd`. CF caches the rendered HTML for 60s so
 * cohorts of visitors share the same rotation result for that
 * window — the same behaviour v1 relied on.
 */

import { useAdsStore } from '~/stores/ads'

export default defineNuxtPlugin((nuxtApp) => {
  const ads = useAdsStore()
  const config = useRuntimeConfig()
  const adsEnabled = !!config.public.adsEnabled

  nuxtApp.hook('app:rendered', () => {
    const route = useRoute()
    const testOverride = (import.meta.server && typeof route.query.test === 'string')
      ? (route.query.test as string)
      : undefined
    const override = testOverride && testOverride.length > 0
      ? testOverride as ReturnType<typeof ads.rotate>
      : undefined

    ads.pickForRoute(route.path, {
      disabled: !adsEnabled,
      override,
    })
  })
})
