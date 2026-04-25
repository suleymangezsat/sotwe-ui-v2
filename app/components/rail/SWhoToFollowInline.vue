<script setup lang="ts">
/*
 * Inline "Who to follow" block used INSIDE a timeline (not in the
 * right rail). Matches X's pattern: flat container with a header,
 * each suggestion on its own row with avatar + name + handle, and a
 * bottom link to see more. No SCard chrome — blends with the tweet
 * stream via the same border-b spacing as <STweet>.
 *
 * Right-rail usage should continue to use SWhoToFollowCard / the other
 * SCard-framed widgets.
 */

import type { User } from '~shared/types'
import { formatCount } from '~/utils/formatCount'

const props = defineProps<{
  users: User[]
  /** Shown at the bottom of the block. Links to a "Who to follow" page; hidden when empty. */
  seeMoreHref?: string
  title?: string
}>()

const visible = computed(() => props.users.slice(0, 3))
</script>

<template>
  <section
    v-if="users.length"
    class="border-b border-twitter-slate-100 bg-twitter-slate-50/40 dark:border-twitter-slate-700 dark:bg-twitter-slate-900/40"
    aria-labelledby="s-who-to-follow-title"
  >
    <h2
      id="s-who-to-follow-title"
      class="px-4 py-3 text-xl font-bold text-twitter-slate-950 dark:text-twitter-slate-100"
    >
      {{ title || 'Who to follow' }}
    </h2>

    <ul class="divide-y divide-twitter-slate-100 dark:divide-twitter-slate-700">
      <li v-for="u in visible" :key="u.id">
        <NuxtLink
          :to="`/${u.screenName}`"
          class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
        >
          <SAvatar :user="u" size="md" :verified="false" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 text-sm">
              <span class="truncate font-bold text-twitter-slate-950 dark:text-twitter-slate-100">
                {{ u.name }}
              </span>
              <SVerifiedBadge v-if="u.verified" class="size-4 shrink-0 text-twitter-blue-500" />
            </div>
            <div class="truncate text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
              @{{ u.screenName }}<span v-if="u.followerCount"> · {{ formatCount(u.followerCount) }} followers</span>
            </div>
            <p
              v-if="u.description"
              class="mt-1 line-clamp-2 text-sm text-twitter-slate-900 dark:text-twitter-slate-100"
            >
              {{ u.description }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink
      v-if="seeMoreHref"
      :to="seeMoreHref"
      class="block px-4 py-3 text-sm text-twitter-blue-500 hover:bg-twitter-slate-100 dark:hover:bg-twitter-slate-800"
    >
      Show more
    </NuxtLink>
  </section>
</template>
