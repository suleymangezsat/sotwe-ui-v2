<script setup lang="ts">
/*
 * "Trending hashtags across countries" — right-rail widget. Replaces v1
 * `components/hashtag/last-seen/*`. Reads `/v3/tag/lastViewed` which
 * returns a grouped `Visit<string>[]` (hashtag text + the country it
 * was last viewed from).
 */

import type { Visit } from '~shared/types'

const visits = ref<Visit<string>[]>([])
const loading = ref(true)

async function load() {
  try {
    visits.value = (await useApi().tag.lastViewed(8)).slice(0, 8)
  }
  finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <SCard v-if="loading || visits.length" padded>
    <h2 class="mb-3 text-xl font-bold">Trending hashtags</h2>
    <div v-if="loading" class="flex items-center justify-center py-4">
      <Icon name="i-lucide-loader-circle" class="size-5 animate-spin text-twitter-slate-400" />
    </div>
    <ul v-else class="flex flex-wrap gap-2">
      <li v-for="v in visits" :key="`${v.country}-${v.data}`">
        <NuxtLink
          :to="`/hashtag/${encodeURIComponent(v.data)}`"
          class="inline-block rounded-full bg-twitter-slate-50 px-3 py-1 text-sm text-twitter-slate-900 hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:text-twitter-slate-100 dark:hover:bg-twitter-slate-800"
        >
          #{{ v.data }}
        </NuxtLink>
      </li>
    </ul>
  </SCard>
</template>
