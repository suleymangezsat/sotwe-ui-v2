/*
 * User timeline (tweets on /user/<screenName>) — keyed by screenName,
 * 10-min cache, cursor-paginated via `after`.
 *
 * Mirrors sotwe-ui/store/user/timeline/ (fetch + add actions).
 */

import type { Tweet } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useUserTimelineStore = createPaginatedStore<Tweet>({
  id: 'user/timeline',
  keyed: true,
  timeout: 10 * 60 * 1000,
  fetcher: async (screenName) => {
    if (!screenName) return { data: [] }
    const res = await useApi().user.get(screenName)
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (screenName, after) => {
    if (!screenName) return { data: [] }
    const res = await useApi().user.get(screenName, { after: after as string })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
