<script setup lang="ts">
/*
 * Light / dark toggle. One press swaps — no system tracking, per product
 * decision (site defaults to light, cookie persists the user's choice).
 *
 * No <ClientOnly> wrapper: @nuxtjs/color-mode with cookie storage reads the
 * visitor's preference on the server, so SSR already renders the correct
 * icon + class. Wrapping in <ClientOnly> caused a layout shift at hydration
 * because the fallback span didn't inherit the parent's `md:hidden` class.
 */

const color = useColorMode()
const isDark = computed(() => color.value === 'dark')
const { t } = useI18n()

function toggle() {
  color.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <STooltip :text="isDark ? t('common.lightMode') : t('common.darkMode')">
    <button
      type="button"
      :aria-label="isDark ? t('common.lightMode') : t('common.darkMode')"
      class="inline-flex size-9 items-center justify-center rounded-full text-twitter-slate-500 transition-colors hover:bg-twitter-slate-50 hover:text-twitter-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 dark:text-twitter-slate-400 dark:hover:bg-twitter-slate-900 dark:hover:text-twitter-slate-100"
      @click="toggle"
    >
      <Icon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" />
    </button>
  </STooltip>
</template>
