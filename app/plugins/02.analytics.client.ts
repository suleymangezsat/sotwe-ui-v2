/*
 * Bootstrap third-party analytics + ad-network library tags via
 * Partytown.
 *
 * Tags emitted here:
 *
 *   Yandex Metrica — every visitor (counter 88678119). v1 wired this
 *   in `MetaHelper.createInitialMeta` as a main-thread `<script>`,
 *   which dragged INP. Same code, but as `type="text/partytown"` so
 *   the SDK's xhr / dataLayer / event loop runs on the worker.
 *
 *   adcash bootstrap — lazy-loads `aclib.js` from acscdn so the
 *   inline `aclib.runPop(...)` snippet inside SSocialBarAd has a
 *   library to call. Only emitted when the picked rotation slot is
 *   adcash.
 *
 *   admaven / monetag / popads — those snippets fetch their own
 *   loader as part of the bootstrap (no separate library tag), so
 *   they live in SSocialBarAd directly.
 *
 * Ads-disabled (`NUXT_PUBLIC_ADS_ENABLED=false`) short-circuits the
 * entire plugin — handy for local dev and the "free tier preview"
 * flow where premium users see no ads.
 */

import { useAdsStore } from '~/stores/ads'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const ads = useAdsStore()

  if (!config.public.adsEnabled) return

  // Yandex Metrica: queued every page (no rotation gating). Uses
  // dataLayer-style `ym(...)` calls; `forward: ['ym']` in
  // nuxt.config.ts bridges them through to the worker.
  const yandexId = config.public.yandexMetricaId
  const yandexScript = yandexId
    ? `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js", "ym");
ym(${JSON.stringify(yandexId)}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });`
    : ''

  // adcash uses a separate aclib loader; the runPop() calls live in
  // SSocialBarAd. Only attached when adcash is the picked rotation —
  // no point loading the lib for a visitor who won't see the slot.
  const acLibLoader = ads.activeAd === 'adcash'
    ? '//acscdn.com/script/aclib.js'
    : ''

  // admaven loader is a one-shot `<script src=…>` request; the JS
  // on the other side wires the slot itself. Run on the worker.
  const admavenLoader = ads.activeAd === 'admaven'
    ? 'https://d33f51dyacx7bd.cloudfront.net/?aydfd=1240052'
    : ''

  useHead({
    script: [
      ...(yandexScript ? [{ type: 'text/partytown', innerHTML: yandexScript }] : []),
      ...(acLibLoader ? [{ type: 'text/partytown', src: acLibLoader, async: true }] : []),
      ...(admavenLoader ? [{ type: 'text/partytown', src: admavenLoader, 'data-cfasync': 'false' }] : []),
    ],
  })
})
