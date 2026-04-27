<script setup lang="ts">
/*
 * Top-level error component — Nuxt 4 picks this up from `app/error.vue`
 * (NOT `app/layouts/error.vue`, which is a regular named layout that
 * pages would have to opt into). Rendered for 404 / 410 / 500 / fatal
 * `createError` calls.
 *
 * The error.vue is rendered in isolation — Nuxt does not wrap it in the
 * default layout, plugins are not re-run, and we cannot rely on the
 * full app shell being available. Specifically Nuxt UI v4's internal
 * Tooltip throws "Cannot read properties of undefined (reading
 * 'disabled')" during SSR when called outside the normal app context,
 * which crashes the error renderer and forces the dev server to fall
 * back to its default error template — losing our translations + brand.
 *
 * Keep this template intentionally minimal: no SSidebar, no SThemeToggle,
 * no SBottomNav. Brand link, error code, message, single CTA. We still
 * hit `useI18n()` + `useLocaleHead()` so the right `<html lang>` is
 * emitted and the message text matches the visitor's locale.
 */

import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const status = computed(() => props.error?.statusCode ?? 500)
const isNotFound = computed(() => status.value === 404)

const { t } = useI18n()
const localeHead = useLocaleHead({ dir: true, lang: true, seo: false })

useHead(computed(() => ({
  htmlAttrs: { ...(localeHead.value.htmlAttrs || {}) },
})))

useSeoMeta({
  title: isNotFound.value ? t('errorpage.metaTitleNotFound') : t('errorpage.metaTitleError'),
  robots: 'noindex',
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-twitter-slate-900 dark:bg-black dark:text-twitter-slate-100">
    <NuxtLink to="/" class="mb-8 inline-flex items-center gap-2 text-twitter-slate-950 dark:text-twitter-slate-100" @click.prevent="goHome">
      <svg height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span class="text-xl font-bold">Sotwe</span>
    </NuxtLink>

    <div class="flex max-w-md flex-col items-center gap-4 text-center">
      <span class="text-sm font-mono text-twitter-slate-400">{{ status }}</span>
      <h1 class="text-3xl font-bold">
        {{ isNotFound ? t('errorpage.metaTitleNotFound').replace(/ ?· ?Sotwe$/, '') : t('errorpage.metaTitleError').replace(/ ?· ?Sotwe$/, '') }}
      </h1>
      <p class="text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ isNotFound ? t('errorpage.notFoundDesc') : t('errorpage.genericDesc') }}
      </p>
      <button
        type="button"
        class="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-twitter-blue-500 px-6 font-semibold text-white transition-colors hover:bg-twitter-blue-600"
        @click="goHome"
      >
        {{ t('errorpage.backHome') }}
      </button>
    </div>
  </main>
</template>
