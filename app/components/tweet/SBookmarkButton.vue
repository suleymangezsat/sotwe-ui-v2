<script setup lang="ts">
/*
 * Tweet bookmark toggle — writes through `useBookmarkIdsStore` which wraps
 * POST/DELETE `/me/bookmark/:id`. Icon flips between outline (`ri-bookmark-
 * line`) and filled (`ri-bookmark-fill`) to match v1; we deliberately
 * switch icon names rather than apply `fill-current` because Lucide icons
 * bake `fill="none"` into the SVG and ignore Tailwind fill utilities.
 * Auth-gated: an unauthed click opens the login dialog.
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
const { t } = useI18n()

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
      toast.add({ title: t('tweet.bookmarkRemoved'), icon: 'i-lucide-bookmark' })
    }
    else {
      await bookmarks.add(props.tweet.id)
      toast.add({ title: t('tweet.bookmarkAdded'), icon: 'i-lucide-bookmark' })
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
    toast.add({ title: t('tweet.bookmarkFailed'), description: err.message, color: 'error' })
  }
}
</script>

<template>
  <!-- Mobile sizing matches SIconButton: 28px circle / 16px icon / text-xs
       count. The bookmark button is interactive (not read-only) but
       shares the same visual language as its read-only neighbours so the
       row stays cohesive. -->
  <button
    type="button"
    :aria-label="isBookmarked ? t('tweet.removeBookmark') : t('tweet.addBookmark')"
    :aria-pressed="isBookmarked"
    class="group inline-flex shrink-0 items-center gap-1 rounded-full text-twitter-slate-500 transition-colors hover:text-twitter-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-twitter-blue-500 dark:text-twitter-slate-400"
    :class="{ 'text-twitter-blue-500': isBookmarked }"
    @click.stop="toggle"
  >
    <span
      class="inline-flex items-center justify-center rounded-full transition-colors sm:size-8 sm:group-hover:bg-twitter-blue-50 dark:sm:group-hover:bg-twitter-blue-950"
    >
      <Icon
        :name="isBookmarked ? 'i-ri-bookmark-fill' : 'i-ri-bookmark-line'"
        class="size-4 sm:size-5"
      />
    </span>
    <span v-if="optimisticCount > 0" class="text-xs tabular-nums sm:text-sm">{{ formatCount(optimisticCount) }}</span>
  </button>
</template>
