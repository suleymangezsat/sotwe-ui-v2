<script setup lang="ts">
/*
 * Tweet bookmark toggle — writes through `useBookmarkIdsStore` which wraps
 * POST/DELETE `/me/bookmark/:id`. Icon flips between outline and filled to
 * match v1. Auth-gated: an unauthed click opens the login dialog.
 * BOOKMARK_SIZE_EXCEEDED / INSUFFICIENT_SUBSCRIPTION errors route to
 * /pricing (v1 parity).
 */

import type { Tweet } from '~shared/types'
import { formatCount } from '~/utils/formatCount'

const props = defineProps<{
  tweet: Tweet
}>()

const bookmarks = useBookmarkIdsStore()
const ui = useUiStore()
const toast = useToast()
const router = useRouter()

const token = useCookie<string | undefined>('sotwe-access-token')

const isBookmarked = computed(() => {
  if (bookmarks.bookmarkedIds.has(props.tweet.id)) return !bookmarks.removedIds.has(props.tweet.id)
  if (bookmarks.removedIds.has(props.tweet.id)) return false
  return !!props.tweet.iBookmarked
})

const optimisticCount = computed(() => {
  const base = props.tweet.bookmarkCount ?? 0
  const wasServer = !!props.tweet.iBookmarked
  const isNow = isBookmarked.value
  return base + (isNow ? 1 : 0) - (wasServer ? 1 : 0)
})

async function toggle() {
  if (!token.value) {
    ui.loginDialog.display = true
    return
  }
  try {
    if (isBookmarked.value) {
      await bookmarks.remove(props.tweet.id)
      toast.add({ title: 'Bookmark removed', icon: 'i-lucide-bookmark' })
    }
    else {
      await bookmarks.add(props.tweet.id)
      toast.add({ title: 'Bookmark added', icon: 'i-lucide-bookmark' })
    }
  }
  catch (e) {
    const err = e as { code?: string, status?: number, message?: string }
    if (err.status === 401 || err.status === 403) {
      if (err.code === 'INSUFFICIENT_SUBSCRIPTION' || err.code === 'BOOKMARK_SIZE_EXCEEDED') {
        router.push('/pricing')
        return
      }
      ui.loginDialog.display = true
      return
    }
    toast.add({ title: 'Bookmark failed', description: err.message, color: 'error' })
  }
}
</script>

<template>
  <button
    type="button"
    :aria-label="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
    :aria-pressed="isBookmarked"
    class="group inline-flex items-center gap-1 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 dark:text-twitter-slate-400"
    :class="{ 'text-twitter-blue-500': isBookmarked }"
    @click.stop="toggle"
  >
    <span
      class="inline-flex size-8 items-center justify-center rounded-full transition-colors group-hover:bg-twitter-blue-50 dark:group-hover:bg-twitter-blue-950"
    >
      <Icon
        :name="isBookmarked ? 'i-lucide-bookmark' : 'i-lucide-bookmark'"
        class="size-5"
        :class="{ 'fill-current': isBookmarked }"
      />
    </span>
    <span v-if="optimisticCount > 0" class="text-sm tabular-nums">{{ formatCount(optimisticCount) }}</span>
  </button>
</template>
