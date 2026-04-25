<script setup lang="ts" generic="T">
/*
 * SInfiniteScroll — replacement for vue-infinite-scroll used in the Nuxt 2
 * timeline containers. Wraps VueUse's `useInfiniteScroll` so container
 * components only provide: the items array, a load-more function, and a
 * flag for whether more data exists.
 *
 * SSR-safe: the observer is only attached on the client, so the first page
 * of results comes from useAsyncData and is present in the SSR HTML.
 */

import { useInfiniteScroll } from '@vueuse/core'

interface Props {
  items: T[]
  loadMore: () => Promise<void> | void
  hasMore: boolean
  loading?: boolean
  /** px distance from the bottom to trigger load. */
  distance?: number
}

const props = withDefaults(defineProps<Props>(), {
  distance: 600,
})

const sentinel = ref<HTMLElement | null>(null)

useInfiniteScroll(
  sentinel,
  async () => {
    if (!props.hasMore || props.loading) return
    await props.loadMore()
  },
  { distance: props.distance, interval: 300 },
)
</script>

<template>
  <div>
    <slot :items="items" />
    <div ref="sentinel" class="h-px w-full" aria-hidden="true" />
    <slot v-if="loading" name="loader">
      <div class="flex items-center justify-center py-6">
        <Icon name="i-lucide-loader-circle" class="size-6 animate-spin text-twitter-slate-400" />
      </div>
    </slot>
    <slot v-if="!hasMore && !loading" name="end" />
  </div>
</template>
