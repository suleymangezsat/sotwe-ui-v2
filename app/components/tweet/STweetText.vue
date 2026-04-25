<script setup lang="ts">
/*
 * Render `tweet.text` with url / mention / hashtag linkification.
 * Parsing happens in `utils/tweetEntities.ts` so the template here is a
 * simple switch over the returned segment list.
 */

import { parseTweetText } from '~/utils/tweetEntities'
import type {
  HashtagEntity,
  MediaEntity,
  UrlEntity,
  UserMentionEntity,
} from '~shared/types'

const props = defineProps<{
  text: string
  urlEntities?: UrlEntity[]
  userMentionEntities?: UserMentionEntity[]
  tagEntities?: HashtagEntity[]
  mediaEntities?: MediaEntity[]
}>()

const segments = computed(() => parseTweetText({
  text: props.text,
  urlEntities: props.urlEntities,
  userMentionEntities: props.userMentionEntities,
  tagEntities: props.tagEntities,
  mediaEntities: props.mediaEntities,
}))
</script>

<template>
  <p class="whitespace-pre-wrap break-word text-[15px] text-twitter-slate-900 dark:text-twitter-slate-100">
    <template v-for="(seg, i) in segments" :key="i">
      <template v-if="seg.kind === 'text'">{{ seg.text }}</template>
      <NuxtLink
        v-else-if="seg.kind === 'mention'"
        :to="`/${seg.screenName}`"
        class="text-twitter-blue-500 hover:underline"
        @click.stop
      >{{ seg.text }}</NuxtLink>
      <NuxtLink
        v-else-if="seg.kind === 'hashtag'"
        :to="`/hashtag/${encodeURIComponent(seg.tag)}`"
        class="text-twitter-blue-500 hover:underline"
        @click.stop
      >{{ seg.text }}</NuxtLink>
      <a
        v-else-if="seg.kind === 'url'"
        :href="seg.href"
        :title="seg.title"
        target="_blank"
        rel="noopener noreferrer"
        class="text-twitter-blue-500 hover:underline"
        @click.stop
      >{{ seg.text }}</a>
    </template>
  </p>
</template>
