/*
 * Search results — keyword mode. Keyed by search term, cursor-paginated.
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useSearchTimelineStore = createPaginatedStore<Tweet>({
  id: 'search/timeline',
  keyed: true,
  timeout: 5 * 60 * 1000,
  fetcher: async (q) => {
    if (!q) return { data: [] }
    const res = await useApi().search.tweet(q)
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (q, after) => {
    if (!q) return { data: [] }
    const res = await useApi().search.tweet(q, { after: after as string })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
