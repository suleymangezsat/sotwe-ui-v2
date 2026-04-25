<script setup lang="ts">
/*
 * Compact user row for the right-rail widgets (popular users,
 * last-seen users, who-to-follow). Avatar + name/handle, whole
 * row links to the user's profile.
 */

import type { User, UserSummary } from '~shared/types'

defineProps<{
  user: Pick<User, 'name' | 'screenName' | 'profileImageMedium' | 'profileImageOriginal' | 'verified'> | UserSummary
  /** Secondary text under the name/handle row (e.g. follower count, country). */
  subtitle?: string
}>()
</script>

<template>
  <NuxtLink
    :to="`/${user.screenName}`"
    class="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
  >
    <SAvatar :user="user" size="sm" :verified="false" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1 text-sm">
        <span class="truncate font-bold text-twitter-slate-950 dark:text-twitter-slate-100">
          {{ user.name }}
        </span>
        <SVerifiedBadge v-if="user.verified" class="size-3.5 shrink-0 text-twitter-blue-500" />
      </div>
      <div class="truncate text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
        @{{ user.screenName }}
        <span v-if="subtitle"> · {{ subtitle }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
