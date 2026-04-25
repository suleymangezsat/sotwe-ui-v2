<script setup lang="ts">
/*
 * Per-page sticky header strip — shows the current section title, a back
 * button when on a nested route, and keeps the sidebar hidden on mobile
 * where the logo + theme toggle live here instead.
 */

defineProps<{
  title?: string
  /** When true, show a back arrow that calls router.back(). */
  showBack?: boolean
}>()

const router = useRouter()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center gap-4 border-b border-twitter-slate-100 bg-white/85 px-4 py-3 backdrop-blur dark:border-twitter-slate-700 dark:bg-black/85"
  >
    <button
      v-if="showBack"
      type="button"
      aria-label="Back"
      class="inline-flex size-9 items-center justify-center rounded-full hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
      @click="router.back()"
    >
      <Icon name="i-lucide-arrow-left" class="size-5" />
    </button>

    <!-- Mobile: show logo where the sidebar would have been -->
    <SLogo v-if="!showBack" :size="24" :compact="true" class="md:hidden" />

    <h1 v-if="title" class="flex-1 truncate text-lg font-bold">{{ title }}</h1>
    <div v-else class="flex-1" />

    <SThemeToggle class="md:hidden" />
  </header>
</template>
