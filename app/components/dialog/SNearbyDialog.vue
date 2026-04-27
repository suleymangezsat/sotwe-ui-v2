<script setup lang="ts">
/*
 * Nearby preview — port of v1 `components/nearby/NearbyDialog.vue`. Pops
 * a teaser of the people-around-you feature: the first two users render
 * fully, the rest render with a privacy blur to show "there are people
 * here, sign in to see them".
 *
 * Triggered from anywhere via `useUiStore().displayNearbyDialog = true`
 * (e.g. an explore-nearby chip on the home page or right rail). On
 * mount it fires `/v3/location/nearby?country=<resolved>` once. The
 * primary CTA navigates to `/me/nearby`, which is auth-gated by the
 * existing `auth` middleware — so signed-out visitors land on /login
 * with a redirect, then back here.
 */

import type { NearbyUser } from '~shared/types'

const ui = useUiStore()
const app = useAppStore()
const { t } = useI18n()

const open = computed({
  get: () => ui.displayNearbyDialog,
  set: v => (ui.displayNearbyDialog = v),
})

const users = ref<NearbyUser[]>([])
const loading = ref(false)
const errored = ref(false)

async function load() {
  if (users.value.length) return
  loading.value = true
  errored.value = false
  try {
    const country = app.country || 'US'
    const result = await useApi().location.nearby({ country, random: 6 })
    users.value = result || []
  }
  catch {
    errored.value = true
  }
  finally {
    loading.value = false
  }
}

watch(open, (v) => { if (v) load() })

const visible = computed(() => users.value.slice(0, 6))
</script>

<template>
  <SDialog v-model="open" :title="t('nearby_dialog.title')">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('nearby_dialog.desc') }}
      </p>

      <div v-if="loading" class="flex justify-center py-6">
        <Icon name="i-lucide-loader-circle" class="size-6 animate-spin text-twitter-blue-500" />
      </div>

      <div
        v-else-if="errored"
        class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
      >
        {{ t('nearby_dialog.cantFetch') }}
      </div>

      <ul v-else-if="visible.length" class="grid grid-cols-3 gap-3">
        <!-- NearbyUser uses `username` / `fullname` / `profilePic`, NOT
             `screenName` / `name` / `profileImageMedium` (those are
             timeline `User` fields). Be careful to keep them aligned
             with the wire shape — see shared/types/domain.ts. -->
        <li
          v-for="(u, i) in visible"
          :key="u.username || i"
          class="flex flex-col items-center gap-1 text-center"
          :class="{ 'pointer-events-none select-none blur-md': i >= 2 }"
        >
          <UAvatar
            :src="u.profilePic || undefined"
            :alt="u.fullname || u.username || ''"
            size="lg"
            class="ring-1 ring-twitter-slate-100 dark:ring-twitter-slate-700"
          />
          <span class="line-clamp-1 text-xs font-semibold">
            {{ u.fullname || u.username }}
          </span>
          <span class="line-clamp-1 text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
            @{{ u.username }}
          </span>
        </li>
      </ul>

      <p
        v-else
        class="py-6 text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400"
      >
        {{ t('nearby_dialog.noUsers') }}
      </p>

      <div class="flex gap-2">
        <SButton block variant="ghost" @click="open = false">{{ t('nearby_dialog.maybeLater') }}</SButton>
        <SButton block to="/me/nearby" @click="open = false">{{ t('nearby_dialog.goToNearby') }}</SButton>
      </div>
    </div>
  </SDialog>
</template>
