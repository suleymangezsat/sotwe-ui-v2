<script setup lang="ts">
/*
 * Single tweet view — /tweet/<id>. SSR-critical: the tweet body must be in
 * the initial HTML so Google indexes the content. og:image from the first
 * media entity if present.
 */

import type { Tweet } from '~shared/types'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: tweet, error } = await useAsyncData<Tweet | undefined>(
  () => `tweet-${id.value}`,
  () => useApi().tweet.get(id.value),
)

if (error.value || !tweet.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tweet not found', fatal: true })
}

const t = tweet.value

useSotweMeta({
  title: `${t.user?.name || t.user?.screenName || 'Tweet'} on Sotwe`,
  description: t.text?.slice(0, 200) || 'Read this tweet without a Twitter account.',
  image: t.mediaEntities?.[0]?.mediaURL || t.user?.profileImageOriginal,
  isSensitive: t.possiblySensitive,
  ogType: 'article',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    'headline': t.text?.slice(0, 110),
    'datePublished': new Date(t.createdAt).toISOString(),
    'author': t.user
      ? { '@type': 'Person', 'name': t.user.name, 'alternateName': `@${t.user.screenName}` }
      : undefined,
    'interactionStatistic': [
      { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/LikeAction', 'userInteractionCount': t.favoriteCount },
      { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/ShareAction', 'userInteractionCount': t.retweetCount },
    ],
  },
})
</script>

<template>
  <STopBar title="Tweet" :show-back="true" />
  <STweetRow v-if="tweet" :tweet="tweet" />
  <section class="px-4 py-6 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
    Replies will load here in Faz 6.
  </section>
</template>
