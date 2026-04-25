<script setup lang="ts">
/*
 * Small footer nav in the right rail — legal + copyright. Mirrors the
 * <v-footer> block from sotwe-ui/layouts/default.vue.
 */

const year = new Date().getFullYear()
</script>

<template>
  <footer class="flex flex-col gap-2 pb-6 text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
    <div class="flex flex-wrap gap-x-3 gap-y-1">
      <NuxtLink to="/terms-of-service" class="hover:underline">Terms</NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline">Privacy</NuxtLink>
      <NuxtLink to="/delivery-refund-terms" class="hover:underline">Refunds</NuxtLink>
      <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
    </div>
    <p>&copy; {{ year }} Sotwe.</p>
  </footer>
</template>
