<script setup lang="ts">
defineProps<{
  /** Vertical divider (defaults to horizontal). */
  vertical?: boolean
}>()
</script>

<template>
  <div
    v-if="vertical"
    class="w-px self-stretch bg-twitter-slate-100 dark:bg-twitter-slate-700"
    role="separator"
    aria-orientation="vertical"
  />
  <div
    v-else
    class="h-px w-full bg-twitter-slate-100 dark:bg-twitter-slate-700"
    role="separator"
  />
</template>
