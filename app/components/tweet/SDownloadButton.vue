<script setup lang="ts">
/*
 * Tweet media download button. Visible only for tweets that have media
 * entities. On click:
 *   - single media → fetch → blob → anchor[download] click (keeps cross-
 *     origin Twitter CDN URLs working without a server proxy, since
 *     Referer is already stripped by the document meta policy).
 *   - multiple media → dropdown listing each one with its own download.
 * Photo filename = last URL segment; video filename = MP4 variant name.
 */

import type { MediaEntity } from '~shared/types'

const props = defineProps<{
  media: MediaEntity[]
}>()

const toast = useToast()
const { t } = useI18n()
const open = ref(false)
const dropdown = ref<HTMLElement | null>(null)
onClickOutside(dropdown, () => { open.value = false })

function bestVideoUrl(m: MediaEntity): string | undefined {
  const variants = m.videoInfo?.variants?.filter(v => v.type === 'video/mp4') ?? []
  if (!variants.length) return undefined
  return variants.slice().sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]?.url
}

function filenameFromUrl(u: string): string {
  try {
    const p = new URL(u).pathname.split('/').pop() || 'download'
    return p.split('?')[0] || 'download'
  }
  catch {
    return 'download'
  }
}

async function downloadOne(m: MediaEntity) {
  open.value = false
  const url = m.type === 'photo' ? m.mediaURL : bestVideoUrl(m)
  if (!url) {
    toast.add({ title: t('tweet.nothingToDownload'), color: 'warning' })
    return
  }
  // Post the progress toast, remember its id, then dismiss it before
  // posting the success / error so they don't stack on screen.
  const progress = toast.add({
    title: t('tweet.downloading'),
    icon: 'i-lucide-loader-circle',
    duration: 0, // persist until we remove it
  })
  try {
    const res = await fetch(url, { referrerPolicy: 'no-referrer' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filenameFromUrl(url)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
    toast.remove(progress.id)
    toast.add({ title: t('tweet.downloadComplete'), icon: 'i-lucide-check' })
  }
  catch (e) {
    toast.remove(progress.id)
    toast.add({ title: t('tweet.downloadFailed'), description: (e as Error).message, color: 'error' })
  }
}

function click() {
  if (props.media.length === 1) {
    downloadOne(props.media[0]!)
  }
  else {
    open.value = !open.value
  }
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :aria-label="t('tweet.downloadMedia')"
      class="group inline-flex shrink-0 items-center gap-0.5 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 sm:gap-1 dark:text-twitter-slate-400"
      @click.stop="click"
    >
      <span class="inline-flex items-center justify-center rounded-full transition-colors sm:size-8 sm:group-hover:bg-twitter-blue-50 dark:sm:group-hover:bg-twitter-blue-950">
        <Icon name="i-lucide-download" class="size-4 sm:size-5" />
      </span>
    </button>
    <div
      v-if="open"
      ref="dropdown"
      class="absolute bottom-10 right-0 z-30 w-56 overflow-hidden rounded-2xl border border-twitter-slate-100 bg-white py-1 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
      @click.stop
    >
      <button
        v-for="(m, i) in media"
        :key="m.id"
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        @click="downloadOne(m)"
      >
        <Icon
          :name="m.type === 'photo' ? 'i-lucide-image' : 'i-lucide-video'"
          class="size-4"
        />
        <span>{{ t(m.type === 'photo' ? 'tweet.photo' : m.type === 'animated_gif' ? 'tweet.gif' : 'tweet.video') }} {{ i + 1 }}</span>
      </button>
    </div>
  </div>
</template>
