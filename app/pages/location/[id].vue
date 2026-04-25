<script setup lang="ts">
/*
 * Location timeline — /location/<placeId>. Place metadata comes from the
 * response `info` field (Location DTO).
 */

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data } = await useAsyncData(
  () => `location-${id.value}`,
  async () => {
    const res = await useApi().location.get(id.value)
    return { tweets: res.data, info: res.info, after: res.after, sensitive: res.sensitive }
  },
)

if (!data.value?.tweets?.length && !data.value?.info) {
  throw createError({ statusCode: 404, statusMessage: 'Location not found', fatal: true })
}

const place = computed(() => (data.value?.info as unknown as { name?: string, fullName?: string, country?: string }) || {})
const titleText = computed(() => place.value.fullName || place.value.name || 'Location')

async function loadMore(after: string) {
  const res = await useApi().location.get(id.value, { after })
  return { items: res.data, after: res.after }
}

useSotweMeta({
  title: `${titleText.value} · Sotwe`,
  description: `Tweets posted in ${titleText.value}.`,
  isSensitive: data.value?.sensitive,
})
</script>

<template>
  <STopBar :title="titleText" :show-back="true" />
  <header v-if="place.name" class="border-b border-twitter-slate-100 px-4 py-4 dark:border-twitter-slate-700">
    <h1 class="text-xl font-bold">{{ place.fullName || place.name }}</h1>
    <p v-if="place.country" class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ place.country }}
    </p>
  </header>
  <SInfiniteTimeline
    :initial-items="data?.tweets || []"
    :initial-after="data?.after"
    :load-more="loadMore"
  >
    <template #default="{ items }">
      <STweet v-for="t in items" :key="t.id" :tweet="t" />
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500">
        No tweets posted here yet.
      </p>
    </template>
  </SInfiniteTimeline>
</template>
