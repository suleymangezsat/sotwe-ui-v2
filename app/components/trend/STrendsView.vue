<script setup lang="ts">
/*
 * Shared trends view — matches v1 `pages/trends.vue` composition:
 *   1. TrendFilter (country / city picker) + active place chip
 *   2. TopicsPanel (ranked list, tweet volume, see-more toggle)
 *   3. AdFree promo card (mobile-only; desktop version lives in right rail)
 *   4. "Tweets in {place}" subheader
 *   5. SInfiniteTimeline (popular tweets, cursor-paginated)
 *
 * Used by `/` (home, defaulted to worldwide / CF-IPCountry) and
 * `/trends/:country/:city?`.
 */

import type { TrendsPayload } from '~/composables/useTrendsData'
import { placeDisplayName } from '~/composables/useTrendsData'

const props = defineProps<{
  data: TrendsPayload
}>()

const placeLabel = computed(() => placeDisplayName(props.data.country, props.data.city))
const { t } = useI18n()

async function loadMoreTweets(after: string) {
  const res = await useApi().trend.tweetsByLocation({
    country: props.data.country,
    city: props.data.city,
    after,
  })
  return { items: res.data, after: res.after }
}
</script>

<template>
  <section class="border-b border-twitter-slate-100 px-4 py-3 dark:border-twitter-slate-700">
    <STrendFilter :place-label="placeLabel" />
  </section>

  <STopicsPanel :topics="data.topics" :place-label="placeLabel" />

  <!-- Mobile-only promo. Desktop shows the same card on the right rail. -->
  <section class="border-b border-twitter-slate-100 px-4 py-3 md:hidden dark:border-twitter-slate-700">
    <SAdFreePromoCard />
  </section>

  <header class="border-b border-twitter-slate-100 px-4 pb-1 pt-3 dark:border-twitter-slate-700">
    <h2 class="text-lg font-bold text-twitter-slate-950 dark:text-twitter-slate-100">
      {{ t('trendspage.tweets', { place: placeLabel }) }}
    </h2>
  </header>

  <SInfiniteTimeline
    :initial-items="data.tweets"
    :initial-after="data.after"
    :load-more="loadMoreTweets"
  >
    <template #default="{ items }">
      <STweet v-for="tw in items" :key="tw.id" :tweet="tw" />
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('common.noResults') }}
      </p>
    </template>
  </SInfiniteTimeline>
</template>
