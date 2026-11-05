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
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl.replace(/\/+$/, '')
const tweetUrl = `${siteUrl}/tweet/${tw.id}`

// `SocialMediaPosting` schema. Required by Google's article-rich-result
// guidelines:
//   - headline (≤110 chars)
//   - datePublished
//   - author (Person)
//   - mainEntityOfPage
// We add the full `articleBody`, `image` (when the tweet has media), and
// reply / quote / share / like InteractionCounters so Google's
// engagement-aware ranking sees the same numbers SERPs already show.
const tweetMediaImages = (tw.mediaEntities ?? [])
  .filter(m => m.type === 'photo' && m.mediaURL)
  .map(m => m.mediaURL!) || []

const tweetJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'SocialMediaPosting',
  'headline': (tw.text ?? '').slice(0, 110),
  'articleBody': tw.text ?? '',
  'datePublished': new Date(tw.createdAt).toISOString(),
  'inLanguage': tw.lang,
  'identifier': tw.id,
  'url': tweetUrl,
  'mainEntityOfPage': { '@type': 'WebPage', '@id': tweetUrl },
  'author': tw.user
    ? {
        '@type': 'Person',
        'name': tw.user.name,
        'alternateName': `@${tw.user.screenName}`,
        'url': `${siteUrl}/${tw.user.screenName}`,
        'image': tw.user.profileImageOriginal,
      }
    : undefined,
  'image': tweetMediaImages.length ? tweetMediaImages : undefined,
  'interactionStatistic': [
    { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/LikeAction', 'userInteractionCount': tw.favoriteCount ?? 0 },
    { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/ShareAction', 'userInteractionCount': tw.retweetCount ?? 0 },
    { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/CommentAction', 'userInteractionCount': tw.replyCount ?? 0 },
    { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/QuoteAction', 'userInteractionCount': tw.quoteCount ?? 0 },
  ],
}

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
  jsonLd: tweetJsonLd,
})
</script>

<template>
  <STopBar :title="$t('tweetpage.topBarTitle')" :show-back="true" />
  <STweetRow v-if="tweet" :tweet="tweet" />
  <section class="px-4 py-6 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
    {{ $t('tweetpage.repliesPlaceholder') }}
  </section>
</template>
