/*
 * Tweets for a hashtag. Keyed by tag text (without the leading `#`).
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useHashtagTimelineStore = createPaginatedStore<Tweet>({
  id: 'hashtag/timeline',
  keyed: true,
  timeout: 10 * 60 * 1000,
  fetcher: async (tag) => {
    if (!tag) return { data: [] }
    const res = await useApi().tag.get(tag)
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (tag, after) => {
    if (!tag) return { data: [] }
    const res = await useApi().tag.get(tag, { after: after as string })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
