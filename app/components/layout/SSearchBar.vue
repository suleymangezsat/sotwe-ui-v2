<script setup lang="ts">
/*
 * Right-rail search. Mirrors v1's Toolbar search behaviour:
 *   - leading `#` → /hashtag/<rest>
 *   - leading `@` → /user/<rest>
 *   - anything else → /search/<term>
 * Ignored if the trimmed input is empty.
 */

const q = ref('')
const router = useRouter()
const { t } = useI18n()

function submit() {
  const term = q.value.trim()
  if (!term) return
  if (term.startsWith('#')) {
    router.push(`/hashtag/${encodeURIComponent(term.slice(1))}`)
  }
  else if (term.startsWith('@')) {
    // Root-level username — matches v1 `/:username`.
    router.push(`/${encodeURIComponent(term.slice(1))}`)
  }
  else {
    router.push(`/search/${encodeURIComponent(term)}`)
  }
}
</script>

<template>
  <form role="search" class="w-full" @submit.prevent="submit">
    <label class="sr-only" for="sotwe-search">{{ t('search.aria') }}</label>
    <div
      class="flex items-center gap-2 rounded-full border border-transparent bg-twitter-slate-50 px-4 py-2 transition-colors focus-within:border-twitter-blue-500 focus-within:bg-white dark:bg-twitter-slate-900 dark:focus-within:bg-black"
    >
      <Icon name="i-lucide-search" class="size-5 text-twitter-slate-500" />
      <input
        id="sotwe-search"
        v-model="q"
        type="search"
        autocomplete="off"
        :placeholder="t('search.placeholder')"
        class="w-full bg-transparent text-base placeholder:text-twitter-slate-500 focus:outline-none"
      >
    </div>
  </form>
</template>
