<script setup lang="ts">
/*
 * Share-this-profile affordance — port of v1 `ShareProfileButton.vue`.
 * Mirrors the tweet-row SShareButton but routes to the SSocialShareDialog
 * via the global UI store (which carries the 12-network grid + copy
 * link). On mobile + browsers that expose `navigator.share` we use the
 * native share sheet; the dialog is the fallback.
 */

import type { User } from '~shared/types'

const props = defineProps<{ profile: User }>()
const ui = useUiStore()
const config = useRuntimeConfig()

const url = computed(() =>
  `${config.public.siteUrl.replace(/\/+$/, '')}/${props.profile.screenName}`,
)
const title = computed(() => `${props.profile.name} (@${props.profile.screenName}) on Sotwe`)

async function share() {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await (navigator as unknown as { share: (_d: ShareData) => Promise<void> }).share({
        title: title.value,
        text: props.profile.description?.slice(0, 200),
        url: url.value,
      })
      return
    }
    catch { /* fall through to the dialog */ }
  }
  ui.shareModal.props = {
    url: url.value,
    title: title.value,
    text: props.profile.description?.slice(0, 200),
  } as never
  ui.shareModal.display = true
}
</script>

<template>
  <button
    type="button"
    :aria-label="`Share profile`"
    class="inline-flex size-9 items-center justify-center rounded-full border border-twitter-slate-200 transition-colors hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900"
    @click="share"
  >
    <Icon name="i-lucide-share" class="size-5" />
  </button>
</template>
