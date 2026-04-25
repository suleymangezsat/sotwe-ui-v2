/*
 * Tweets posted from a location. Keyed by placeId (Twitter geo place id).
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useLocationTimelineStore = createPaginatedStore<Tweet>({
  id: 'location/timeline',
  keyed: true,
  timeout: 5 * 60 * 1000,
  fetcher: async (placeId) => {
    if (!placeId) return { data: [] }
    const res = await useApi().location.get(placeId)
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (placeId, after) => {
    if (!placeId) return { data: [] }
    const res = await useApi().location.get(placeId, { after: after as string })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
