<script setup lang="ts">
/*
 * Hashtag timeline — /hashtag/<name> (no leading `#`). Cursor-paginated.
 */

const route = useRoute()
const tag = computed(() => decodeURIComponent(String(route.params.hashtag)))

const { data } = await useAsyncData(
  () => `tag-${tag.value}`,
  async () => {
    const res = await useApi().tag.get(tag.value)
    return { tweets: res.data, after: res.after, sensitive: res.sensitive }
  },
  { default: () => ({ tweets: [], after: undefined, sensitive: false }) },
)

async function loadMore(after: string) {
  const res = await useApi().tag.get(tag.value, { after })
  return { items: res.data, after: res.after }
}

useSotweMeta({
  title: `#${tag.value} · Sotwe`,
  description: `Tweets tagged #${tag.value}.`,
  isSensitive: data.value?.sensitive,
})
</script>

<template>
  <STopBar :title="`#${tag}`" :show-back="true" />
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
        No tweets for #{{ tag }}.
      </p>
    </template>
  </SInfiniteTimeline>
</template>
