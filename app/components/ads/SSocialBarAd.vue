<script setup lang="ts">
/*
 * Rotated ad slot — port of v1 `components/ads/SocialBarAd.vue`.
 *
 * Reads the picked network from `useAdsStore().activeAd` and injects
 * the matching network's bootstrap snippet into the DOM, *as a
 * `type="text/partytown"` script*. Partytown picks the tag up at
 * runtime and re-hosts the third-party SDK on a worker thread so the
 * main thread stays free for hydration / scrolling. Crucial for INP
 * / TBT on a 1.5M-daily site whose SERP rankings depend on Core Web
 * Vitals.
 *
 * On a single page load the visitor sees at most one network's slot —
 * the rotation already happened server-side in
 * `app/plugins/01.ads-rotate.global.ts` and the chosen value is
 * baked into the SSR HTML so first paint is correct.
 *
 * Impression tracking fires through `useGtag().gtag('event',
 * 'ad_impression', …)` once on mount; v1 had the same hook (see
 * SocialBarAd `trackAdView`). The event is queued via Partytown's
 * `forward: ['gtag']` bridge so it doesn't block the main thread.
 *
 * Kept as a `<ClientOnly>` because the third-party tags expect
 * `document.body` and a live SW context. SSR is fine to skip — the
 * impression only counts on the client anyway.
 */

import { useAdsStore } from '~/stores/ads'

const ads = useAdsStore()
const app = useAppStore()
const { gtag } = useGtag()

const activeAd = computed(() => ads.activeAd)

function trackImpression() {
  if (!activeAd.value) return
  gtag('event', 'ad_impression', {
    event_category: 'Advertising',
    event_label: 'social_bar',
    ad_provider: activeAd.value,
    ad_placement: 'social_bar',
    country: app.country || 'unknown',
  })
}

onMounted(() => {
  trackImpression()
})
</script>

<template>
  <ClientOnly>
    <div v-if="activeAd" class="hidden">
      <!--
        Each network's bootstrap snippet is wrapped in a
        `type="text/partytown"` script so Partytown's worker picks it
        up. The `v-if` keeps Vue from emitting more than one tag per
        render even if `activeAd` changes mid-session (it shouldn't —
        it's pinned per request).
      -->
      <component
        :is="'script'"
        v-if="activeAd === 'monetag'"
        type="text/partytown"
      >
        (function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'https://paupsoborofoow.net/tag.min.js',9249794,document.body||document.documentElement)
      </component>
      <component
        :is="'script'"
        v-else-if="activeAd === 'adcash'"
        type="text/partytown"
      >
        aclib.runPop({zoneId:'10489954'});
      </component>
      <!--
        admaven / adsterra / popads / propellerads / evadav are wired
        via `MetaHelper.createInitialMeta` in v1 — those scripts ship
        their own `<script>` tags from the head. We defer them to
        Partytown via the global plugin
        (`app/plugins/02.ads-thirdparty.client.ts`) instead of
        rendering more `<script>` tags inline here.
      -->
    </div>
  </ClientOnly>
</template>
