/*
 * Client-side tracking of bookmarked tweet ids so the BookmarkButton stays
 * in sync when the user toggles it from inside a Tweet component. Also
 * tracks removed ids so the bookmark timeline list fades out locally before
 * the next backend refresh.
 */

export const useBookmarkIdsStore = defineStore('bookmark/ids', () => {
  const bookmarkedIds = ref<Set<string>>(new Set())
  const removedIds = ref<Set<string>>(new Set())
  const loading = ref(false)
  const error = ref<{ statusCode: number, code?: string } | undefined>(undefined)

  function isBookmarked(id: string) {
    if (removedIds.value.has(id)) return false
    return bookmarkedIds.value.has(id)
  }

  async function add(tweetId: string) {
    loading.value = true
    error.value = undefined
    try {
      await useApi().me.bookmark(tweetId)
      bookmarkedIds.value.add(tweetId)
      removedIds.value.delete(tweetId)
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function remove(tweetId: string) {
    loading.value = true
    error.value = undefined
    try {
      await useApi().me.unbookmark(tweetId)
      bookmarkedIds.value.delete(tweetId)
      removedIds.value.add(tweetId)
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally {
      loading.value = false
    }
  }

  return { bookmarkedIds, removedIds, loading, error, isBookmarked, add, remove }
})
