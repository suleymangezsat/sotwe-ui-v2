<script setup lang="ts">
/*
 * Full-screen media lightbox — opens when a user clicks a photo in the
 * media grid. Opened by setting `useUiStore().mediaModal.display = true`
 * with `{ tweetId, media, index }` in `.props`.
 *
 * UI:
 *   - Centered dark backdrop; click outside the media closes.
 *   - ESC key closes.
 *   - Prev / Next buttons for multi-media tweets.
 *   - Videos / GIFs play inside the modal with controls.
 */

import type { MediaEntity } from '~shared/types'

const ui = useUiStore()

const openProps = computed(() => ui.mediaModal.props as unknown as {
  media?: MediaEntity[]
  index?: number
} | undefined)

const open = computed({
  get: () => ui.mediaModal.display,
  set: (v) => { ui.mediaModal.display = v },
})

const media = computed(() => openProps.value?.media ?? [])
const current = ref(0)

watch(() => ui.mediaModal.props, () => {
  current.value = (ui.mediaModal.props as { index?: number })?.index ?? 0
})

function next() { current.value = (current.value + 1) % media.value.length }
function prev() { current.value = (current.value - 1 + media.value.length) % media.value.length }

function close() { open.value = false }

function bestVideoUrl(m: MediaEntity): string | undefined {
  const variants = m.videoInfo?.variants?.filter(v => v.type === 'video/mp4') ?? []
  if (!variants.length) return undefined
  return variants.slice().sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]?.url
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-if="open && media.length"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="close"
  >
    <button
      type="button"
      class="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-twitter-slate-800/70 text-white hover:bg-twitter-slate-700"
      aria-label="Close"
      @click.stop="close"
    >
      <Icon name="i-lucide-x" class="size-5" />
    </button>

    <button
      v-if="media.length > 1"
      type="button"
      class="absolute left-4 inline-flex size-10 items-center justify-center rounded-full bg-twitter-slate-800/70 text-white hover:bg-twitter-slate-700"
      aria-label="Previous"
      @click.stop="prev"
    >
      <Icon name="i-lucide-chevron-left" class="size-6" />
    </button>
    <button
      v-if="media.length > 1"
      type="button"
      class="absolute right-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-twitter-slate-800/70 text-white hover:bg-twitter-slate-700"
      aria-label="Next"
      @click.stop="next"
    >
      <Icon name="i-lucide-chevron-right" class="size-6" />
    </button>

    <div class="relative max-h-full max-w-5xl" @click.stop>
      <img
        v-if="media[current]?.type === 'photo'"
        :src="media[current]?.mediaURL"
        :alt="media[current]?.text || 'media'"
        class="max-h-[90vh] max-w-full object-contain"
      >
      <video
        v-else-if="media[current]"
        :src="bestVideoUrl(media[current]!)"
        :poster="media[current]?.mediaURL"
        :autoplay="media[current]?.type === 'animated_gif'"
        :loop="media[current]?.type === 'animated_gif'"
        :muted="media[current]?.type === 'animated_gif'"
        :controls="media[current]?.type !== 'animated_gif'"
        playsinline
        preload="auto"
        class="max-h-[90vh] max-w-full"
      />
    </div>
  </div>
</template>
