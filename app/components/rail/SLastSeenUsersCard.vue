<script setup lang="ts">
/*
 * "Recently viewed profiles" — right-rail widget. v1 had a
 * `components/user/last-seen/LastSeenUsers.vue` equivalent. Uses
 * `/v3/user/lastViewed` which returns a grouped `Visit<User>[]` array
 * (each entry has the visitor-country + the User payload).
 */

import type { User, Visit } from '~shared/types'

const visits = ref<Visit<User>[]>([])
const loading = ref(true)
const { t } = useI18n()

async function load() {
  try {
    visits.value = (await useApi().user.lastViewed(6)).slice(0, 6)
  }
  finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <SCard v-if="loading || visits.length" padded>
    <h2 class="mb-3 text-xl font-bold">{{ t('rail.recentlyViewed') }}</h2>
    <div v-if="loading" class="flex items-center justify-center py-4">
      <Icon name="i-lucide-loader-circle" class="size-5 animate-spin text-twitter-slate-400" />
    </div>
    <ul v-else class="-mx-2">
      <li v-for="v in visits" :key="`${v.country}-${v.data.id}`">
        <SUserRow :user="v.data" :subtitle="v.country" />
      </li>
    </ul>
  </SCard>
</template>
