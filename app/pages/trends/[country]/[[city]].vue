<script setup lang="ts">
/*
 * Trends per place — `/trends/:country/:city?`. Same surface as `/`, minus
 * the MastHead hero (which is home-only), plus optional `?date=YYYYMMDD-HH`
 * or `?ago=N` query filters that the underlying useTrendsData consumes.
 */

import { placeDisplayName } from '~/composables/useTrendsData'

const route = useRoute()
const country = computed(() => String(route.params.country || '').toLowerCase())
const city = computed(() => {
  const c = route.params.city
  return c ? String(Array.isArray(c) ? c[0] : c).toLowerCase() : undefined
})
const dateParams = computed(() => {
  const date = typeof route.query.date === 'string' ? route.query.date : undefined
  const agoRaw = typeof route.query.ago === 'string' ? Number(route.query.ago) : undefined
  const ago = Number.isFinite(agoRaw) && agoRaw! >= 0 && agoRaw! <= 23 ? agoRaw : undefined
  return date || ago !== undefined ? { date, ago } : undefined
})

const { data } = await useTrendsData(country, city, dateParams)

const placeLabel = computed(() => placeDisplayName(country.value, city.value))
const topTopicsText = computed(() => (data.value?.topics || []).slice(0, 4).map(t => t.name).join(', '))

// Same i18n keys as `/` (index.vue) — both views render the same trends
// surface, so they share `trendspage.meta.*` to avoid splitting Google's
// index across competing title patterns.
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
  <STopBar :title="t('trendspage.topBarTitle', { place: placeLabel })" :show-back="true" />
  <STrendsView v-if="data" :data="data" />
</template>
