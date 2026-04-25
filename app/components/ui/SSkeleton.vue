<script setup lang="ts">
/*
 * Skeleton loader — used by CardLoader / Timeline while data is pending.
 */

defineProps<{
  width?: string
  height?: string
  circle?: boolean
  rounded?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'animate-pulse bg-twitter-slate-100 dark:bg-twitter-slate-800',
      circle ? 'rounded-full' : rounded ? 'rounded-xl' : 'rounded',
    ]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
