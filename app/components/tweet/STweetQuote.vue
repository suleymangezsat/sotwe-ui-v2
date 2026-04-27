<script setup lang="ts">
/*
 * Inline quote-card: smaller than the parent tweet, no action row, links
 * to the quoted tweet's page on click.
 *
 * The card is NOT wrapped in an outer <NuxtLink> because the quoted
 * tweet can contain a playable <video>: a surrounding <a> would hijack
 * every click (including the video's own controls) and navigate to the
 * tweet page instead of playing. Instead we listen for clicks on the
 * card root and navigate only when the click originated from a
 * non-interactive region.
 */

import type { Tweet } from '~shared/types'
import { formatCreatedAt } from '~/utils/timeago'

const props = defineProps<{
  tweet: Tweet
}>()

const created = computed(() => formatCreatedAt(props.tweet.createdAt))
const tweetHref = computed(() => `/tweet/${props.tweet.id}`)
const { t } = useI18n()

const ui = useUiStore()
function openMedia(index: number) {
  ui.mediaModal.props = {
    media: props.tweet.mediaEntities,
    index,
  } as unknown as Record<string, unknown>
  ui.mediaModal.display = true
}

function handleCardClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  // Skip clicks that land on something interactive inside the card
  // (video controls, embedded anchor, button). Those handle themselves.
  if (target.closest('video, a, button')) return
  e.stopPropagation()
  navigateTo(tweetHref.value)
}
</script>

<template>
  <div
    class="mt-3 cursor-pointer overflow-hidden rounded-2xl border border-twitter-slate-100 transition-colors hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900"
    role="link"
    :aria-label="t('tweet.openQuotedTweetBy', { name: tweet.user?.name || tweet.user?.screenName || '' })"
    @click="handleCardClick"
  >
    <div class="flex items-center gap-2 px-3 pt-3 text-sm">
      <SAvatar :user="tweet.user" size="xs" :verified="false" />
      <NuxtLink
        v-if="tweet.user?.screenName"
        :to="`/${tweet.user.screenName}`"
        class="font-semibold hover:underline"
        @click.stop
      >
        {{ tweet.user?.name || tweet.user.screenName }}
      </NuxtLink>
      <SVerifiedBadge v-if="tweet.user?.verified" class="size-3.5 text-twitter-blue-500" />
      <span v-if="tweet.user?.screenName" class="text-twitter-slate-500 dark:text-twitter-slate-400">
        @{{ tweet.user.screenName }}
      </span>
      <span class="text-twitter-slate-500 dark:text-twitter-slate-400">·</span>
      <NuxtLink :to="tweetHref" class="text-twitter-slate-500 hover:underline dark:text-twitter-slate-400" @click.stop>
        {{ created }}
      </NuxtLink>
    </div>

    <STweetText
      v-if="tweet.text"
      :text="tweet.text"
      :url-entities="tweet.urlEntities"
      :user-mention-entities="tweet.userMentionEntities"
      :tag-entities="tweet.tagEntities"
      :media-entities="tweet.mediaEntities"
      class="px-3 pt-1 pb-3"
    />

    <STweetMedia
      v-if="tweet.mediaEntities?.length"
      :media="tweet.mediaEntities"
      class="mx-3 mb-3"
      @open="openMedia"
    />
  </div>
</template>
