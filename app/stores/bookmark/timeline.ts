/*
 * Saved tweets on /bookmark. Auth-required. Uses integer `page`
 * pagination instead of a string cursor — /me/bookmark/content returns
 * `{ data: Tweet[], after: number }` where `after` is the next page.
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useBookmarkTimelineStore = createPaginatedStore<Tweet, number>({
  id: 'bookmark/timeline',
  keyed: false,
  timeout: 0, // always fresh — user can add / remove outside this store
  fetcher: async () => {
    const res = await useApi().me.bookmarks(0)
    return { data: res.data, after: res.after }
  },
  paginator: async (_key, after) => {
    const res = await useApi().me.bookmarks(after as number)
    return { data: res.data, after: res.after }
  },
})
