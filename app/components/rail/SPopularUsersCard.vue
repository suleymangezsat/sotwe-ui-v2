<script setup lang="ts">
/*
 * "Who to follow" / popular users — right-rail widget. Replaces v1's
 * `components/user/popular/PopularContainer.vue` + `PopularUserItem.vue`.
 *
 * Fetches `/v3/user/popular?size=5` on client mount (the right rail is
 * below the fold; no need to SSR-delay the page for this). Falls back
 * silently on error.
 */

import type { User } from '~shared/types'
import { formatCount } from '~/utils/formatCount'

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | undefined>(undefined)
const { t } = useI18n()

async function load() {
  loading.value = true
  error.value = undefined
  try {
    const res = await useApi().user.popular({ size: 5 })
    users.value = res.data
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <SCard padded>
    <h2 class="mb-3 text-xl font-bold">{{ t('rail.whoToFollow') }}</h2>

    <div v-if="loading" class="flex items-center justify-center py-4">
      <Icon name="i-lucide-loader-circle" class="size-5 animate-spin text-twitter-slate-400" />
    </div>
    <p v-else-if="error" class="py-2 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('rail.couldntLoadSuggestions') }}
    </p>
    <p v-else-if="!users.length" class="py-2 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('rail.noSuggestions') }}
    </p>
    <ul v-else class="-mx-2">
      <li v-for="u in users" :key="u.id">
        <SUserRow :user="u" :subtitle="u.followerCount ? t('rail.followersCount', { count: formatCount(u.followerCount) }) : undefined" />
      </li>
    </ul>
  </SCard>
</template>
