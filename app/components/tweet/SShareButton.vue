<script setup lang="ts">
/*
 * Tweet share button — mirrors v1 `displayShareModal()`:
 *   1. If `navigator.share` is available (mobile + most modern browsers),
 *      use the native share sheet.
 *   2. Otherwise pop a Nuxt UI dropdown with the classic Sotwe share
 *      targets: X / Facebook / WhatsApp / Telegram / Copy link.
 * The copy-link action writes to the clipboard + fires a toast.
 */

import type { Tweet } from '~shared/types'

const props = defineProps<{
  tweet: Tweet
}>()

const toast = useToast()
const config = useRuntimeConfig()
const { t } = useI18n()
const open = ref(false)
const dropdown = ref<HTMLElement | null>(null)
onClickOutside(dropdown, () => { open.value = false })

const absoluteUrl = computed(() =>
  `${config.public.siteUrl.replace(/\/+$/, '')}/tweet/${props.tweet.id}`,
)

const shareTitle = computed(() => {
  const user = props.tweet.user
  return user?.name ? t('tweet.shareTitleNamed', { name: user.name }) : t('tweet.shareTitleGeneric')
})

async function share() {
  // If the browser exposes the Web Share API we use ONLY that. Opening
  // our custom dropdown after a cancelled native sheet creates confusing
  // double-prompts (user said "no", we show another menu anyway). When
  // the API is missing entirely we fall back to the dropdown.
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await (navigator as unknown as { share: (_d: ShareData) => Promise<void> }).share({
        title: shareTitle.value,
        text: (props.tweet.text || '').slice(0, 280),
        url: absoluteUrl.value,
      })
    }
    catch {
      // Cancelled / failed → do nothing.
    }
    return
  }
  open.value = !open.value
}

async function copyLink() {
  open.value = false
  try {
    await navigator.clipboard.writeText(absoluteUrl.value)
    toast.add({ title: t('tweet.linkCopied'), icon: 'i-lucide-link' })
  }
  catch {
    toast.add({ title: t('tweet.copyFailed'), color: 'error' })
  }
}

function socialHref(network: 'x' | 'facebook' | 'whatsapp' | 'telegram') {
  const u = encodeURIComponent(absoluteUrl.value)
  const txt = encodeURIComponent(props.tweet.text || '')
  switch (network) {
    case 'x': return `https://twitter.com/intent/tweet?url=${u}&text=${txt}`
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    case 'whatsapp': return `https://api.whatsapp.com/send?text=${txt}%20${u}`
    case 'telegram': return `https://t.me/share/url?url=${u}&text=${txt}`
  }
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :aria-label="t('tweet.share')"
      class="group inline-flex shrink-0 items-center gap-0.5 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 sm:gap-1 dark:text-twitter-slate-400"
      @click.stop="share"
    >
      <span class="inline-flex items-center justify-center rounded-full transition-colors sm:size-8 sm:group-hover:bg-twitter-blue-50 dark:sm:group-hover:bg-twitter-blue-950">
        <Icon name="i-lucide-share" class="size-4 sm:size-5" />
      </span>
    </button>

    <!--
      Fallback dropdown (shown when navigator.share is unavailable and on
      desktop). Click-outside closes it; each row stops propagation so it
      doesn't bubble up to the article click handler.
    -->
    <div
      v-if="open"
      ref="dropdown"
      class="absolute bottom-10 right-0 z-30 w-52 overflow-hidden rounded-2xl border border-twitter-slate-100 bg-white py-1 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
      @click.stop
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="copyLink"
      >
        <Icon name="i-lucide-link" class="size-4" />
        {{ t('tweet.copyLink') }}
      </button>
      <a
        :href="socialHref('x')"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
      >
        <Icon name="i-simple-icons-x" class="size-4" />
        {{ t('tweet.shareOn', { network: 'X' }) }}
      </a>
      <a
        :href="socialHref('facebook')"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
      >
        <Icon name="i-simple-icons-facebook" class="size-4" />
        {{ t('tweet.shareOn', { network: 'Facebook' }) }}
      </a>
      <a
        :href="socialHref('whatsapp')"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
      >
        <Icon name="i-simple-icons-whatsapp" class="size-4" />
        {{ t('tweet.shareOn', { network: 'WhatsApp' }) }}
      </a>
      <a
        :href="socialHref('telegram')"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
      >
        <Icon name="i-simple-icons-telegram" class="size-4" />
        {{ t('tweet.shareOn', { network: 'Telegram' }) }}
      </a>
    </div>
  </div>
</template>
