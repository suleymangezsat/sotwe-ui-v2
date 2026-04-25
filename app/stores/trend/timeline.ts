/*
 * Popular tweets for a place. Keyed by country code; `after` cursor is a
 * tweet id. Feeds the right side of the Trends page.
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useTrendTimelineStore = createPaginatedStore<Tweet>({
  id: 'trend/timeline',
  keyed: true,
  timeout: 5 * 60 * 1000,
  fetcher: async (code) => {
    if (!code) return { data: [] }
    const res = await useApi().trend.tweetsByCode(code)
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (code, after) => {
    if (!code) return { data: [] }
    const res = await useApi().trend.tweetsByCode(code, { after: after as string })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
