<script setup lang="ts">
/*
 * Round, icon-only button (tweet action row, nav collapse toggle, etc).
 * Wraps SButton with icon sizing + circular shape.
 */

import { formatCount } from '~/utils/formatCount'

interface Props {
  icon: string
  label: string
  color?: 'primary' | 'neutral' | 'error' | 'success' | 'warning' | 'info'
  variant?: 'ghost' | 'solid' | 'outline' | 'soft' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show small numeric badge (tweet action counters). */
  count?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'ghost',
  size: 'sm',
  count: null,
})

const countLabel = computed(() => {
  if (props.count === null || props.count === undefined || props.count <= 0) return ''
  return formatCount(props.count)
})
</script>

<template>
  <!--
    Mobile-first sizing for the tweet action row. The row carries up to
    7 buttons (Reply / Repost / Like / Views / Bookmark / Share / Download).
    Reply/Repost/Like/Views are read-only display surfaces — they show the
    count but don't accept input — so dropping the circular hit-area on
    mobile in favour of an icon-only ribbon is honest, and saves the ~12px
    of padding per button that was forcing the row to overflow narrow phones.
    Counts are kept visible at every breakpoint (the user has no other
    place to read engagement numbers) but rendered at `text-xs` on mobile
    to stay inside a 360px viewport.
  -->
  <button
    type="button"
    :aria-label="label"
    class="group inline-flex shrink-0 items-center gap-1 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 dark:text-twitter-slate-400"
  >
    <!--
      Mobile: no fixed-size wrapper — the icon renders at its intrinsic 16px
      so all 7 buttons + their counts fit a 360px viewport.
      Desktop (sm+): 32px circular hit-area with hover ring, matching X.
    -->
    <span
      class="inline-flex items-center justify-center rounded-full transition-colors sm:size-8 sm:group-hover:bg-twitter-blue-50 dark:sm:group-hover:bg-twitter-blue-950"
    >
      <Icon :name="icon" class="size-4 sm:size-5" />
    </span>
    <span v-if="countLabel" class="text-xs tabular-nums sm:text-sm">{{ countLabel }}</span>
  </button>
</template>
