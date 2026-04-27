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

const tw = tweet.value

// v1 `tweetpage.meta.*` template — `{fullname} {username}` pattern is
// indexed by Google for tweet-detail SEO; param names match v1 exactly.
const { t: $t } = useI18n()
useSotweMeta({
  title: $t('tweetpage.meta.title', {
    fullname: tw.user?.name ?? '',
    username: tw.user?.screenName ? `@${tw.user.screenName}` : '',
  }),
  description: $t('tweetpage.meta.description', {
    likes: tw.favoriteCount ?? 0,
    retweets: tw.retweetCount ?? 0,
    text: tw.text?.slice(0, 200) ?? '',
  }),
  image: tw.mediaEntities?.[0]?.mediaURL || tw.user?.profileImageOriginal,
  isSensitive: tw.possiblySensitive,
  ogType: 'article',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    'headline': tw.text?.slice(0, 110),
    'datePublished': new Date(tw.createdAt).toISOString(),
    'author': tw.user
      ? { '@type': 'Person', 'name': tw.user.name, 'alternateName': `@${tw.user.screenName}` }
      : undefined,
    'interactionStatistic': [
      { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/LikeAction', 'userInteractionCount': tw.favoriteCount },
      { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/ShareAction', 'userInteractionCount': tw.retweetCount },
    ],
  },
})
</script>

<template>
  <STopBar :title="$t('tweetpage.topBarTitle')" :show-back="true" />
  <STweetRow v-if="tweet" :tweet="tweet" />
  <section class="px-4 py-6 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
    {{ $t('tweetpage.repliesPlaceholder') }}
  </section>
</template>
