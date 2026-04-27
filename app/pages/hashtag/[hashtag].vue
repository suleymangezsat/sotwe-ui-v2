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

// `hashtagpage.meta.*` SEO keys; the `{firstTweet}` slot in v1's
// description gets the first tweet's text snippet when available so the
// snippet under the SERP listing is content-rich.
const { t } = useI18n()
const firstTweetSnippet = computed(() => {
  const text = data.value?.tweets?.[0]?.text?.slice(0, 200).trim()
  return text ? ` ${text}` : ''
})
useSotweMeta({
  title: t('hashtagpage.meta.title', { hashtag: tag.value }),
  description: t('hashtagpage.meta.description', {
    hashtag: tag.value,
    firstTweet: firstTweetSnippet.value,
  }),
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
      <STweet v-for="tw in items" :key="tw.id" :tweet="tw" />
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500">
        {{ t('hashtagpage.noTweetsForTag', { hashtag: tag }) }}
      </p>
    </template>
  </SInfiniteTimeline>
</template>
