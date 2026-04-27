<script setup lang="ts">
/*
 * Sotwe mark. SVG preserves v1's static/logo-desktop.svg silhouette but is
 * recolored from Tailwind tokens so dark/light flip works.
 */

defineProps<{
  /** Size in px (height). Width follows intrinsic aspect. */
  size?: number
  /** Hide the text wordmark and keep just the glyph — for the sidebar collapsed state. */
  compact?: boolean
}>()

const config = useRuntimeConfig()
const { t } = useI18n()
const brandName = config.public.siteName
const ariaLabel = computed(() => `${brandName} ${t('navigation.home')}`)
</script>

<template>
  <NuxtLink
    to="/"
    :aria-label="compact ? brandName : ariaLabel"
    class="inline-flex items-center gap-2 text-twitter-slate-950 dark:text-twitter-slate-100"
  >
    <svg
      :height="size ?? 28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
    <span v-if="!compact" class="text-xl font-bold">Sotwe</span>
  </NuxtLink>
</template>
