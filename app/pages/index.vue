<script setup lang="ts">
/*
 * Home (`/`) — same trends view as `/trends/:country/:city?`, defaulted
 * to the visitor's CF-IPCountry (or `worldwide` as a last resort). Matches
 * v1 where `pages/index.vue` nested `pages/trends.vue` via <nuxt-child>
 * and rendered the MastHead hero on top.
 *
 * Accepts the same `?date=YYYYMMDD-HH` / `?ago=N` query params as the
 * /trends/* route so the topics filter works identically on either page.
 */

import { placeDisplayName } from '~/composables/useTrendsData'

const country = (useRequestHeader('cf-ipcountry') || '').toLowerCase() || 'worldwide'

const route = useRoute()
const dateParams = computed(() => {
  const date = typeof route.query.date === 'string' ? route.query.date : undefined
  const agoRaw = typeof route.query.ago === 'string' ? Number(route.query.ago) : undefined
  const ago = Number.isFinite(agoRaw) && agoRaw! >= 0 && agoRaw! <= 23 ? agoRaw : undefined
  return date || ago !== undefined ? { date, ago } : undefined
})

const { data } = await useTrendsData(country, undefined, dateParams)

const placeLabel = computed(() => placeDisplayName(data.value?.country || country, data.value?.city))
const topTopicsText = computed(() => (data.value?.topics || []).slice(0, 4).map(t => t.name).join(', '))

// Locale-aware meta. Both `/` and `/trends/:country/:city?` share the same
// SEO key set (`trendspage.meta.*`) since they render the same view —
// keeps Google's index from splitting trend traffic across two competing
// title patterns. Param names match v1 verbatim (`activePlace`,
// `topTopics`) so a single key tree drives all 4 locales.
const { t } = useI18n()
useSotweMeta({
  title: t('trendspage.meta.title', { activePlace: placeLabel.value }),
  description: t('trendspage.meta.description', {
    activePlace: placeLabel.value,
    topTopics: topTopicsText.value,
  }),
})
</script>

<template>
  <!-- SMastHead carries the page-level h1 (the SEO-critical hero copy
       Google indexes). The topbar title is navigation chrome only, so it
       drops to h2 to keep this page at exactly one h1. -->
  <STopBar :title="t('navigation.home')" :as="'h2'" />
  <SMastHead />
  <STrendsView v-if="data" :data="data" />
</template>
