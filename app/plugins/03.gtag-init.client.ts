/*
 * Lazy gtag.js initialisation.
 *
 * `nuxt-gtag` is configured with `initMode: 'manual'` so the gtag
 * library doesn't ship until we explicitly call `initGtag()` on the
 * client. We delay the call past the first paint to keep gtag's
 * inline bootstrap out of the LCP critical path — Lighthouse rewards
 * deferred analytics on a 1.5M-daily site.
 *
 * Pure no-op when `adsEnabled === false` (set via env on dev /
 * preview deploys) so analytics events from local sessions don't
 * pollute the prod GA4 property.
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  if (!config.public.adsEnabled) return

  const { initialize } = useGtag()

  // Defer until the page is settled. `requestIdleCallback` would be
  // ideal but Safari only added it in 17.4; fall back to
  // requestAnimationFrame + setTimeout so older Safari still runs the
  // init within ~50 ms of paint.
  const ric: typeof globalThis.requestIdleCallback | undefined = (globalThis as { requestIdleCallback?: typeof globalThis.requestIdleCallback }).requestIdleCallback
  const schedule = ric ?? ((cb: () => void) => setTimeout(cb, 0))

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete') schedule(() => initialize())
    else window.addEventListener('load', () => schedule(() => initialize()), { once: true })
  }
})
