/*
 * User profile — the `info` field of /v3/user/<screenName>. Populated
 * alongside `user/timeline` via its own composable `fetchProfileAndTimeline`
 * rather than its own HTTP request, so Faz 5's user page only hits the
 * backend once.
 */

import type { User } from '~shared/types'
import { createResourceStore } from '~/utils/createResourceStore'

const store = createResourceStore<User>({
  id: 'user/profile',
  keyed: true,
  timeout: 10 * 60 * 1000,
  fetcher: async (screenName) => {
    if (!screenName) return undefined
    const res = await useApi().user.get(screenName)
    return res.info
  },
})

export const useUserProfileStore = store
