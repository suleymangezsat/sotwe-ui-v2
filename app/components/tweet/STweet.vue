<script setup lang="ts">
/*
 * Full tweet component — replaces Faz 5's STweetRow placeholder with the
 * actual v1 Tweet.vue render tree:
 *
 *   [pinned badge]              — if tweet.pinned (outer tweet only)
 *   [retweet badge]             — if tweet.retweetedStatus (shows retweeter)
 *   avatar + name + @handle + verified tick + timeago + location
 *   tweet text with linkified url / mention / hashtag entities
 *   media grid (1..4 photos / video / animated gif)
 *   quoted tweet inline card
 *   action row: reply · retweet · like · views · bookmark · share
 *
 * When tweet.retweetedStatus exists, the main body swaps to that inner
 * tweet (matches v1 behaviour: retweets display the retweeted content,
 * with a small "@user retweeted" badge on top).
 */

import type { Tweet } from '~shared/types'
import { formatCreatedAt, formatCreatedAtAbsolute } from '~/utils/timeago'

const props = defineProps<{
  tweet: Tweet
}>()

// Retweet: swap body to retweetedStatus, keep the outer tweet as the retweeter.
const body = computed<Tweet>(() => props.tweet.retweetedStatus ?? props.tweet)
const retweeter = computed(() => props.tweet.retweetedStatus ? props.tweet.user : undefined)

const created = computed(() => formatCreatedAt(body.value.createdAt))
const absolute = computed(() => formatCreatedAtAbsolute(body.value.createdAt))
const { t } = useI18n()

const ui = useUiStore()
function openMedia(index: number) {
  ui.mediaModal.props = {
    media: body.value.mediaEntities,
    index,
  } as unknown as Record<string, unknown>
  ui.mediaModal.display = true
}

// Whole-article click → tweet detail page. Skip clicks that originate on
// anything interactive (anchor, button, video, nested role=link) so they
// handle themselves — mention/hashtag/url anchors, the action row
// buttons, inline <video> controls, and the inner quote card all retain
// native behaviour. The article itself has role="link" too, so we
// exclude that match specifically.
function openTweet(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button, video')) return
  const nestedLink = target.closest('[role="link"]')
  if (nestedLink && nestedLink !== e.currentTarget) return
  // Respect middle-click / modifier-click defaults (browser opens new tab).
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  navigateTo(`/tweet/${body.value.id}`)
}
</script>

<template>
  <article
    class="cursor-pointer border-b border-twitter-slate-100 px-4 py-3 transition-colors hover:bg-twitter-slate-50/60 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900/60"
    role="link"
    :aria-label="t('tweet.openTweetBy', { name: body.user?.name || body.user?.screenName || '' })"
    @click="openTweet"
  >
    <!-- Pinned (outer tweet only, before the retweet swap) -->
    <p
      v-if="tweet.pinned && !tweet.retweetedStatus"
      class="mb-2 flex items-center gap-2 text-xs font-semibold text-twitter-slate-500 dark:text-twitter-slate-400"
    >
      <Icon name="i-lucide-pin" class="size-3.5" />
      {{ t('tweet.pinned') }}
    </p>

    <!-- Retweeted badge -->
    <p
      v-if="retweeter"
      class="mb-2 flex items-center gap-2 text-xs font-semibold text-twitter-slate-500 dark:text-twitter-slate-400"
    >
      <Icon name="i-lucide-repeat-2" class="size-3.5" />
      <NuxtLink v-if="retweeter.screenName" :to="`/${retweeter.screenName}`" class="hover:underline">
        @{{ retweeter.screenName }}
      </NuxtLink>
      <span>{{ t('common.retweeted') }}</span>
    </p>

    <div class="flex items-start gap-3">
      <!-- `:verified="false"` suppresses the on-avatar tick; the name row
           renders the canonical SVerifiedBadge next to the handle. -->
      <SAvatar :user="body.user" size="md" :link="true" :verified="false" />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1 text-sm">
          <NuxtLink
            v-if="body.user?.screenName"
            :to="`/${body.user.screenName}`"
            class="truncate font-bold text-twitter-slate-950 hover:underline dark:text-twitter-slate-100"
          >
            {{ body.user?.name || body.user?.screenName }}
          </NuxtLink>
          <SVerifiedBadge
            v-if="body.user?.verified"
            class="size-4 shrink-0 text-twitter-blue-500"
          />
          <span class="truncate text-twitter-slate-500 dark:text-twitter-slate-400">
            @{{ body.user?.screenName }}
          </span>
          <span class="text-twitter-slate-500 dark:text-twitter-slate-400">·</span>
          <NuxtLink
            :to="`/tweet/${body.id}`"
            class="shrink-0 text-twitter-slate-500 hover:underline dark:text-twitter-slate-400"
          >
            <time :datetime="new Date(body.createdAt).toISOString()" :title="absolute">
              {{ created }}
            </time>
          </NuxtLink>
          <template v-if="body.location">
            <span class="text-twitter-slate-500 dark:text-twitter-slate-400">·</span>
            <NuxtLink
              :to="`/location/${body.location.id}`"
              class="inline-flex items-center gap-1 text-twitter-slate-500 hover:underline dark:text-twitter-slate-400"
            >
              <Icon name="i-lucide-map-pin" class="size-3.5" />
              {{ body.location.name }}
            </NuxtLink>
          </template>
          <div class="ml-auto">
            <STweetMenu :tweet="body" />
          </div>
        </div>

        <!-- Text is NOT wrapped in a NuxtLink: the anchors emitted by
             STweetText (mention/hashtag/url) would be nested inside a
             parent <a>, which is invalid HTML and confuses event handling
             (e.g. inline <video> inside a neighbouring block). The time /
             @-handle links already lead to the tweet page. -->
        <STweetText
          v-if="body.text"
          :text="body.text"
          :url-entities="body.urlEntities"
          :user-mention-entities="body.userMentionEntities"
          :tag-entities="body.tagEntities"
          :media-entities="body.mediaEntities"
          class="mt-0.5"
        />

        <STweetMedia
          v-if="body.mediaEntities?.length"
          :media="body.mediaEntities"
          @open="openMedia"
        />

        <STweetQuote v-if="body.quotedStatus" :tweet="body.quotedStatus" />

        <div class="mt-2 flex max-w-md items-center justify-between text-twitter-slate-500 dark:text-twitter-slate-400">
          <SIconButton icon="i-lucide-message-circle" :label="t('tweet.reply')" :count="body.replyCount || null" />
          <SIconButton icon="i-lucide-repeat-2" :label="t('tweet.repost')" :count="body.retweetCount || null" />
          <SIconButton icon="i-lucide-heart" :label="t('tweet.like')" :count="body.favoriteCount || null" />
          <SIconButton icon="i-lucide-bar-chart-3" :label="t('tweet.views')" :count="body.viewCount || null" />
          <SBookmarkButton :tweet="body" />
          <SShareButton :tweet="body" />
          <SDownloadButton v-if="body.mediaEntities?.length" :media="body.mediaEntities" />
        </div>
      </div>
    </div>
  </article>
</template>
