<script setup lang="ts">
/*
 * Inline "Trend Topics" block rendered INSIDE the home / /trends timeline
 * (not in the right rail). Matches X's flat in-stream pattern — no SCard
 * chrome, same border-b spacing as <STweet> and the other inline blocks
 * (see SWhoToFollowInline for the sibling widget).
 *
 * Reproduces v1 `components/trend/topics/Topics.vue`:
 *   - numbered rank column (1..N)
 *   - topic name (links to /search/<name>, or /hashtag/<name> for `#…` tags)
 *   - tweet volume rendered via v1's pluralized string
 *     ("Under 10K tweets" for <10k, "{compact} tweets" otherwise)
 *   - 10 visible by default, "See more" toggles the rest
 *
 * Used by STrendsView (home + /trends/...).
 */

import type { Trend } from '~shared/types'
import { formatTrendVolume } from '~/utils/formatTrendVolume'

const props = withDefaults(defineProps<{
  topics: Trend[]
  placeLabel?: string
  /** Initial visible count before "See more" is clicked. */
  initialCount?: number
}>(), {
  placeLabel: undefined,
  initialCount: 10,
})

const expanded = ref(false)
const visibleTopics = computed(() =>
  expanded.value ? props.topics : props.topics.slice(0, props.initialCount),
)
const hasMore = computed(() => props.topics.length > props.initialCount)

function linkFor(name: string) {
  return name.startsWith('#')
    ? `/hashtag/${encodeURIComponent(name.slice(1))}`
    : `/search/${encodeURIComponent(name)}`
}

const { t } = useI18n()
</script>

<template>
  <section
    class="border-b border-twitter-slate-100 bg-twitter-slate-50/40 dark:border-twitter-slate-700 dark:bg-twitter-slate-900/40"
    aria-labelledby="s-trend-topics-title"
  >
    <header class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div class="flex items-center gap-2">
        <Icon name="i-lucide-flame" class="size-5 text-twitter-blue-500" />
        <h2
          id="s-trend-topics-title"
          class="text-xl font-bold text-twitter-slate-950 dark:text-twitter-slate-100"
        >
          <!--
            Two-line title (e.g. "Trend Topics" + greyed " in Worldwide").
            Vue's default `whitespace: 'condense'` collapses literal spaces
            between text mustaches and adjacent elements, so a leading
            space inside the `<span>` gets stripped — TR would otherwise
            render "Konularıiçinde". Embed the separator inside the
            mustache itself; Vue treats interpolation output verbatim.
          -->
          {{ t('trendspage.topicsTitle') }}<span v-if="placeLabel" class="font-normal text-twitter-slate-500 dark:text-twitter-slate-400">{{ ` ${t('common.in')} ${placeLabel}` }}</span>
        </h2>
      </div>
      <STopicsFilter />
    </header>

    <ol
      v-if="topics.length"
      class="divide-y divide-twitter-slate-100 dark:divide-twitter-slate-700"
    >
      <li v-for="(topic, i) in visibleTopics" :key="topic.name">
        <NuxtLink
          :to="linkFor(topic.name)"
          class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        >
          <span class="w-6 shrink-0 text-right text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
            {{ i + 1 }}
          </span>
          <span class="min-w-0 flex-1 truncate font-semibold text-twitter-slate-950 dark:text-twitter-slate-100">
            {{ topic.name }}
          </span>
          <span
            v-if="formatTrendVolume(topic.tweetVolume)"
            class="shrink-0 text-xs text-twitter-slate-500 dark:text-twitter-slate-400"
          >
            {{ formatTrendVolume(topic.tweetVolume) }}
          </span>
        </NuxtLink>
      </li>
    </ol>
    <p v-else class="px-4 py-6 text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('common.noResults') }}
    </p>

    <div v-if="hasMore" class="border-t border-twitter-slate-100 dark:border-twitter-slate-700">
      <button
        type="button"
        class="block w-full px-4 py-3 text-left text-sm text-twitter-blue-500 transition-colors hover:bg-twitter-slate-100 dark:hover:bg-twitter-slate-800"
        @click="expanded = !expanded"
      >
        {{ expanded ? t('trendspage.showLess') : t('trendspage.showMore') }}
      </button>
    </div>
  </section>
</template>
