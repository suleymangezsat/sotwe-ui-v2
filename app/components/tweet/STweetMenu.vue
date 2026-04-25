<script setup lang="ts">
/*
 * Tweet 3-dot menu. V1 had a single "Report" item; v2 adds "Copy link"
 * and "View on X" since they're trivial and match the modern X menu.
 *
 * The menu uses a plain absolute-positioned list (Nuxt UI's UDropdownMenu
 * portal would escape the article and confuse the overlay's click-
 * outside tracking when nested inside our role="link" article).
 */

import type { Tweet } from '~shared/types'

const props = defineProps<{
  tweet: Tweet
}>()

const toast = useToast()
const ui = useUiStore()
const config = useRuntimeConfig()
const open = ref(false)
const menuEl = ref<HTMLElement | null>(null)
onClickOutside(menuEl, () => { open.value = false })

async function copyLink() {
  open.value = false
  const url = `${config.public.siteUrl.replace(/\/+$/, '')}/tweet/${props.tweet.id}`
  try {
    await navigator.clipboard.writeText(url)
    toast.add({ title: 'Link copied', icon: 'i-lucide-link' })
  }
  catch {
    toast.add({ title: 'Copy failed', color: 'error' })
  }
}

function viewOnX() {
  open.value = false
  const handle = props.tweet.user?.screenName ?? 'i'
  window.open(`https://x.com/${handle}/status/${props.tweet.id}`, '_blank', 'noopener')
}

function openReport() {
  open.value = false
  ui.reportDialog.display = true
  ui.reportDialog.props = { type: 'TWEET', name: props.tweet.id }
}
</script>

<template>
  <div ref="menuEl" class="relative">
    <button
      type="button"
      aria-label="More"
      class="inline-flex size-8 items-center justify-center rounded-full text-twitter-slate-500 transition-colors hover:bg-twitter-blue-50 hover:text-twitter-blue-500 dark:text-twitter-slate-400 dark:hover:bg-twitter-blue-950"
      @click.stop="open = !open"
    >
      <Icon name="i-lucide-ellipsis" class="size-5" />
    </button>
    <div
      v-if="open"
      class="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-2xl border border-twitter-slate-100 bg-white py-1 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
      @click.stop
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="copyLink"
      >
        <Icon name="i-lucide-link" class="size-4" /> Copy link
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="viewOnX"
      >
        <Icon name="i-simple-icons-x" class="size-4" /> View on X
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        @click="openReport"
      >
        <Icon name="i-lucide-flag" class="size-4" /> Report
      </button>
    </div>
  </div>
</template>
