<script setup lang="ts">
/*
 * Home hero — v1 `components/layout/MastHead.vue`. Shown only at `/`, not
 * on `/trends/:country/:city?`. Contains the site tagline + a prominent
 * search box that mirrors the right-rail SSearchBar but gets pride of
 * place on the landing experience.
 */

const q = ref('')
const router = useRouter()
const { t } = useI18n()

function submit() {
  const term = q.value.trim()
  if (!term) return
  if (term.startsWith('#')) router.push(`/hashtag/${encodeURIComponent(term.slice(1))}`)
  else if (term.startsWith('@')) router.push(`/${encodeURIComponent(term.slice(1))}`)
  else router.push(`/search/${encodeURIComponent(term)}`)
}
</script>

<template>
  <section class="border-b border-twitter-slate-100 px-6 py-10 dark:border-twitter-slate-700">
    <SLogo :size="44" class="mb-5" />
    <h1 class="text-3xl font-bold tracking-tight text-twitter-slate-950 dark:text-twitter-slate-100">
      {{ t('masthead.headline') }}
    </h1>
    <p class="mt-2 max-w-lg text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('masthead.tagline') }}
    </p>

    <form role="search" class="mt-5 max-w-md" @submit.prevent="submit">
      <label class="sr-only" for="sotwe-masthead-search">{{ t('masthead.searchAria') }}</label>
      <div
        class="flex items-center gap-2 rounded-full border border-transparent bg-twitter-slate-50 px-4 py-3 text-base transition-colors focus-within:border-twitter-blue-500 focus-within:bg-white dark:bg-twitter-slate-900 dark:focus-within:bg-black"
      >
        <Icon name="i-lucide-search" class="size-5 text-twitter-slate-500" />
        <input
          id="sotwe-masthead-search"
          v-model="q"
          type="search"
          autocomplete="off"
          :placeholder="t('masthead.searchPlaceholder')"
          class="w-full bg-transparent placeholder:text-twitter-slate-500 focus:outline-none"
        >
      </div>
    </form>
  </section>
</template>
