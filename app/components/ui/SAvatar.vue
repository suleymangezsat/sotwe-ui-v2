<script setup lang="ts">
import type { User } from '~shared/types'

interface Props {
  /** A UserSummary / User / anything that exposes profile image + screen name. */
  user?: Pick<User, 'name' | 'screenName' | 'profileImageOriginal' | 'profileImageMedium' | 'profileImageThumbnail' | 'verified'> | null
  /** Explicit src — overrides the picture derived from `user`. */
  src?: string
  /** Nuxt UI sizing token. Matches the target pixel sizes in the X / Twitter spec. */
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Linkify to root-level /<screenName>. Off by default so callers that wrap in their own link don't double-wrap. */
  link?: boolean
  /** Show the Twitter-blue verified tick badge. Falls back to user.verified when omitted. */
  verified?: boolean
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  user: undefined,
  src: undefined,
  size: 'md',
  link: false,
  verified: undefined,
  alt: undefined,
})

const resolvedSrc = computed(() => {
  if (props.src) return props.src
  const u = props.user
  if (!u) return undefined
  return u.profileImageOriginal || u.profileImageMedium || u.profileImageThumbnail
})

const alt = computed(() => props.alt || props.user?.name || props.user?.screenName || 'avatar')
const showTick = computed(() => props.verified ?? props.user?.verified ?? false)

const wrapper = computed(() => (props.link && props.user?.screenName
  ? { is: resolveComponent('NuxtLink'), to: `/${props.user.screenName}` }
  : { is: 'span' as const, to: undefined }))
</script>

<template>
  <!--
    `rounded-full` on the wrapper so any `ring-*` class passed in from the
    caller (e.g. `ring-4 ring-white` on the profile banner avatar) renders
    as a circle, not a square box around the avatar.
  -->
  <component
    :is="wrapper.is"
    :to="wrapper.to"
    class="relative inline-flex shrink-0 rounded-full"
    :aria-label="alt"
  >
    <UAvatar
      :src="resolvedSrc"
      :alt="alt"
      :size="size"
    />
    <span
      v-if="showTick"
      class="absolute -right-0.5 -bottom-0.5 flex size-[45%] items-center justify-center rounded-full bg-white dark:bg-black"
    >
      <SVerifiedBadge class="size-full text-twitter-blue-500" />
    </span>
  </component>
</template>
