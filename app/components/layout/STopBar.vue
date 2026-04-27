<script setup lang="ts">
/*
 * Per-page sticky header strip — shows the current section title, a back
 * button when on a nested route, and keeps the sidebar hidden on mobile
 * where the logo + theme toggle live here instead.
 *
 * The title renders as an `<h1>` by default since for most simple pages
 * (Bookmarks, About, Profile, …) the topbar text IS the page subject and
 * those pages don't render any other heading. Pages that DO have their
 * own content-level h1 — login, signup, pricing, location, the home
 * page hero — should pass `:as="'h2'"` so the page keeps a single h1
 * (Google's SEO heuristic + accessibility tree expect exactly one).
 */

withDefaults(defineProps<{
  title?: string
  /** Heading level for the title element. */
  as?: 'h1' | 'h2'
  /** When true, show a back arrow that calls router.back(). */
  showBack?: boolean
}>(), {
  as: 'h1',
  showBack: false,
})

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

    <component
      :is="as"
      v-if="title"
      class="flex-1 truncate text-lg font-bold"
    >
      {{ title }}
    </component>
    <div v-else class="flex-1" />

    <SThemeToggle class="md:hidden" />
  </header>
</template>
