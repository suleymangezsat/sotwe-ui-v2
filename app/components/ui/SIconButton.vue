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
  <button
    type="button"
    :aria-label="label"
    class="group inline-flex items-center gap-1 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 dark:text-twitter-slate-400"
  >
    <span
      class="inline-flex size-8 items-center justify-center rounded-full transition-colors group-hover:bg-twitter-blue-50 dark:group-hover:bg-twitter-blue-950"
    >
      <Icon :name="icon" class="size-5" />
    </span>
    <span v-if="countLabel" class="text-sm tabular-nums">{{ countLabel }}</span>
  </button>
</template>
