<script setup lang="ts" generic="T, TAfter extends string | number = string">
/*
 * Generic SSR-hydrated infinite scroll for timelines.
 *
 * Usage:
 *   <SInfiniteTimeline
 *     :initial-items="data.tweets"
 *     :initial-after="data.after"
 *     :load-more="(after) => useApi().user.get(name, { after }).then(r => ({ items: r.data, after: r.after }))"
 *   >
 *     <template #default="{ items }">
 *       <STweet v-for="t in items" :key="t.id" :tweet="t" />
 *     </template>
 *   </SInfiniteTimeline>
 *
 * The first page arrives from the page's own useAsyncData (so it lives in
 * the SSR HTML for SEO). On the client, VueUse's useInfiniteScroll watches
 * a sentinel element below the list and invokes `loadMore(after)` when
 * the user gets within `distance` px of the bottom.
 *
 * The component stays out of page-level state / Pinia so each caller
 * can pick its own fetch strategy (API direct / through a store).
 */

import { useInfiniteScroll } from '@vueuse/core'

interface Props {
  initialItems: T[]
  initialAfter?: TAfter
  /**
   * Called each time we run out of rendered items. Return the next batch
   * and the cursor for the page after that. Return `after: undefined` to
   * signal exhaustion.
   */
  loadMore: (_after: TAfter) => Promise<{ items: T[], after?: TAfter }>
  /** px distance from viewport bottom that triggers the next page. */
  distance?: number
}

const props = withDefaults(defineProps<Props>(), {
  distance: 800,
  initialAfter: undefined,
})

const items = ref(props.initialItems) as Ref<T[]>
const after = ref(props.initialAfter) as Ref<TAfter | undefined>
const loading = ref(false)
const errored = ref<string | undefined>(undefined)
const exhausted = computed(() => !after.value)

const sentinel = ref<HTMLElement | null>(null)

async function next() {
  if (loading.value || exhausted.value) return
  loading.value = true
  errored.value = undefined
  try {
    const res = await props.loadMore(after.value!)
    if (res.items?.length) items.value.push(...res.items)
    after.value = res.after
  }
  catch (e) {
    errored.value = (e as Error).message || 'Failed to load more'
  }
  finally {
    loading.value = false
  }
}

useInfiniteScroll(
  sentinel,
  next,
  { distance: props.distance, interval: 300 },
)

function retry() {
  errored.value = undefined
  next()
}
</script>

<template>
  <div>
    <slot :items="items" />

    <div ref="sentinel" class="h-px w-full" aria-hidden="true" />

    <div v-if="loading" class="flex items-center justify-center py-6">
      <Icon name="i-lucide-loader-circle" class="size-6 animate-spin text-twitter-slate-400" />
    </div>

    <div
      v-else-if="errored"
      class="flex flex-col items-center gap-2 px-4 py-6 text-sm text-twitter-slate-500 dark:text-twitter-slate-400"
    >
      <p>Couldn't load more tweets.</p>
      <SButton size="sm" variant="outline" @click="retry">Try again</SButton>
    </div>

    <slot
      v-else-if="exhausted && items.length > 0"
      name="end"
    >
      <p class="px-4 py-6 text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        You've reached the end.
      </p>
    </slot>

    <slot v-else-if="!items.length" name="empty">
      <p class="px-4 py-10 text-center text-twitter-slate-500 dark:text-twitter-slate-400">
        No Results
      </p>
    </slot>
  </div>
</template>
