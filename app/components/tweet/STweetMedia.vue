<script setup lang="ts">
/*
 * Tweet media grid — Twitter-style layouts:
 *   1 photo  : single large image (intrinsic aspect ratio)
 *   2 photos : 2-column equal grid
 *   3 photos : left tall + right 2-row stack
 *   4 photos : 2×2 grid
 *
 * Photos open a lightbox (parent-owned) on click.
 * Videos / animated GIFs get a native <video> with HTML5 controls — they
 * are NOT wrapped in a <button> because <button> > interactive content is
 * invalid HTML and would swallow the video's own click-to-play handling.
 * GIFs auto-play looped + muted with no controls.
 */

import type { MediaEntity } from '~shared/types'

const props = defineProps<{
  media: MediaEntity[]
}>()

const emit = defineEmits<{
  open: [index: number]
}>()

function bestVideoUrl(m: MediaEntity): string | undefined {
  const variants = m.videoInfo?.variants?.filter(v => v.type === 'video/mp4') ?? []
  if (!variants.length) return undefined
  return variants.slice().sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]?.url
}

function aspectRatio(m: MediaEntity): string | undefined {
  if (!m.imageSize?.width || !m.imageSize?.height) return undefined
  return `${m.imageSize.width} / ${m.imageSize.height}`
}

function isVideo(m: MediaEntity) {
  return m.type === 'video' || m.type === 'animated_gif'
}

const layout = computed(() => {
  const n = props.media.length
  if (n === 1) return 'single'
  if (n === 2) return 'two'
  if (n === 3) return 'three'
  return 'four'
})
</script>

<template>
  <div v-if="media.length" class="mt-3 overflow-hidden rounded-2xl border border-twitter-slate-100 dark:border-twitter-slate-700">
    <!-- 1 item: full-bleed, intrinsic aspect ratio -->
    <div v-if="layout === 'single' && media[0]">
      <button
        v-if="!isVideo(media[0])"
        type="button"
        class="block w-full"
        @click.stop="emit('open', 0)"
      >
        <img
          :src="media[0].mediaURL"
          :alt="media[0].text || 'tweet image'"
          loading="lazy"
          class="w-full object-cover"
          :style="{ aspectRatio: aspectRatio(media[0]) || '16/9' }"
        >
      </button>
      <video
        v-else
        :src="bestVideoUrl(media[0])"
        :poster="media[0].mediaURL"
        :autoplay="media[0].type === 'animated_gif'"
        :loop="media[0].type === 'animated_gif'"
        :muted="media[0].type === 'animated_gif'"
        :controls="media[0].type !== 'animated_gif'"
        playsinline
        preload="metadata"
        referrerpolicy="no-referrer"
        class="block w-full bg-black"
        :style="{ aspectRatio: aspectRatio(media[0]) || '16/9' }"
      />
    </div>

    <!-- 2 items: side-by-side -->
    <div v-else-if="layout === 'two'" class="grid aspect-[16/9] grid-cols-2 gap-0.5">
      <template v-for="(m, i) in media" :key="m.id">
        <button
          v-if="!isVideo(m)"
          type="button"
          class="block h-full w-full"
          @click.stop="emit('open', i)"
        >
          <img :src="m.mediaURL" :alt="m.text || 'tweet image'" loading="lazy" class="h-full w-full object-cover">
        </button>
        <video
          v-else
          :src="bestVideoUrl(m)"
          :poster="m.mediaURL"
          :autoplay="m.type === 'animated_gif'"
          :loop="m.type === 'animated_gif'"
          :muted="m.type === 'animated_gif'"
          :controls="m.type !== 'animated_gif'"
          playsinline
          preload="metadata"
          class="h-full w-full bg-black object-cover"
        />
      </template>
    </div>

    <!-- 3 items: one tall on the left, two stacked on the right -->
    <div v-else-if="layout === 'three'" class="grid aspect-[16/9] grid-cols-2 gap-0.5">
      <template v-if="media[0]">
        <button
          v-if="!isVideo(media[0])"
          type="button"
          class="row-span-2 block h-full w-full"
          @click.stop="emit('open', 0)"
        >
          <img :src="media[0].mediaURL" :alt="media[0].text || 'tweet image'" loading="lazy" class="h-full w-full object-cover">
        </button>
        <video
          v-else
          :src="bestVideoUrl(media[0])"
          :poster="media[0].mediaURL"
          :autoplay="media[0].type === 'animated_gif'"
          :loop="media[0].type === 'animated_gif'"
          :muted="media[0].type === 'animated_gif'"
          :controls="media[0].type !== 'animated_gif'"
          playsinline
          preload="metadata"
          class="row-span-2 h-full w-full bg-black object-cover"
        />
      </template>
      <template v-for="(m, i) in media.slice(1, 3)" :key="m.id">
        <button
          v-if="!isVideo(m)"
          type="button"
          class="block h-full w-full"
          @click.stop="emit('open', i + 1)"
        >
          <img :src="m.mediaURL" :alt="m.text || 'tweet image'" loading="lazy" class="h-full w-full object-cover">
        </button>
        <video
          v-else
          :src="bestVideoUrl(m)"
          :poster="m.mediaURL"
          :autoplay="m.type === 'animated_gif'"
          :loop="m.type === 'animated_gif'"
          :muted="m.type === 'animated_gif'"
          :controls="m.type !== 'animated_gif'"
          playsinline
          preload="metadata"
          class="h-full w-full bg-black object-cover"
        />
      </template>
    </div>

    <!-- 4 items: 2x2 grid -->
    <div v-else class="grid aspect-[16/9] grid-cols-2 grid-rows-2 gap-0.5">
      <template v-for="(m, i) in media.slice(0, 4)" :key="m.id">
        <button
          v-if="!isVideo(m)"
          type="button"
          class="block h-full w-full"
          @click.stop="emit('open', i)"
        >
          <img :src="m.mediaURL" :alt="m.text || 'tweet image'" loading="lazy" class="h-full w-full object-cover">
        </button>
        <video
          v-else
          :src="bestVideoUrl(m)"
          :poster="m.mediaURL"
          :autoplay="m.type === 'animated_gif'"
          :loop="m.type === 'animated_gif'"
          :muted="m.type === 'animated_gif'"
          :controls="m.type !== 'animated_gif'"
          playsinline
          preload="metadata"
          class="h-full w-full bg-black object-cover"
        />
      </template>
    </div>
  </div>
</template>
