<script setup lang="ts">
/*
 * Sotwe surface card — used by profile header, right-rail widgets
 * (Popular users, Highlight), pricing cards, etc. Replaces `v-sheet.v-card`
 * from Vuetify v1. Hover state is opt-in for interactive cards.
 */

defineProps<{
  hover?: boolean
  padded?: boolean
}>()
</script>

<template>
  <section
    :class="[
      'rounded-2xl border border-twitter-slate-100 bg-white dark:border-twitter-slate-700 dark:bg-twitter-slate-950',
      padded ? 'p-4' : '',
      hover ? 'transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900' : '',
    ]"
  >
    <slot />
  </section>
</template>
