/*
 * Trending topics for a place (country or woeid). Keyed by country code
 * (e.g. "tr" → /v3/trend/topics/code/tr). `.data` is a list of Trend names
 * (with optional tweetVolume).
 */

import type { Trend } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useTrendTopicsStore = createPaginatedStore<Trend>({
  id: 'trend/topics',
  keyed: true,
  timeout: 5 * 60 * 1000,
  fetcher: async (code) => {
    if (!code) return { data: [] }
    const res = await useApi().trend.topicsByCode(code)
    return { data: res.data, after: undefined, sensitive: res.sensitive }
  },
})
