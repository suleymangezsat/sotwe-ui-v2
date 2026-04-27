<script setup lang="ts">
/*
 * Three-dot context menu for user profile pages — port of v1
 * `components/user/profile/ProfileMenuButton.vue`. The same trigger that
 * lives in the action button row to the right of the avatar.
 *
 * Items (v1 parity):
 *   - "Open on X" — external deep-link to the canonical X profile.
 *   - "Account ownership" — pops `SCampaignDialog` so the visitor can
 *     copy a profile link + email contact@sotwe.com to claim ownership.
 *   - "Report user" — pops `SReportDialog` with `type=USER, name=screen`.
 *
 * The menu portal closes on outside-click via VueUse's onClickOutside.
 */

import type { User } from '~shared/types'

const props = defineProps<{ profile: User }>()

const ui = useUiStore()
const menu = ref<HTMLElement | null>(null)
const open = ref(false)
onClickOutside(menu, () => { open.value = false })

const xUrl = computed(() => `https://x.com/${encodeURIComponent(props.profile.screenName)}`)

function openOwnership() {
  open.value = false
  ui.displayCampaignModal = true
}

function openReport() {
  open.value = false
  ui.reportDialog.props = { type: 'USER', name: props.profile.screenName } as never
  ui.reportDialog.display = true
}
</script>

<template>
  <div ref="menu" class="relative">
    <button
      type="button"
      :aria-label="`More actions for @${profile.screenName}`"
      :aria-expanded="open"
      class="inline-flex size-9 items-center justify-center rounded-full border border-twitter-slate-200 transition-colors hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900"
      @click.stop="open = !open"
    >
      <Icon name="i-lucide-more-horizontal" class="size-5" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-twitter-slate-100 bg-white py-1 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
      role="menu"
    >
      <a
        :href="xUrl"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="open = false"
      >
        <Icon name="i-simple-icons-x" class="size-4" />
        Open on X
      </a>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="openOwnership"
      >
        <Icon name="i-lucide-fingerprint" class="size-4" />
        Account ownership
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-twitter-slate-50 dark:text-red-400 dark:hover:bg-twitter-slate-900"
        @click="openReport"
      >
        <Icon name="i-lucide-flag" class="size-4" />
        Report user
      </button>
    </div>
  </div>
</template>
