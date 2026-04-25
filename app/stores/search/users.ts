/*
 * Search results — user mode. Backend returns a `Response<User, User>` with
 * no pagination; data is small so we store the full list.
 */

import type { User } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useSearchUsersStore = createPaginatedStore<User>({
  id: 'search/users',
  keyed: true,
  timeout: 5 * 60 * 1000,
  fetcher: async (q) => {
    if (!q) return { data: [] }
    const res = await useApi().search.user(q)
    return { data: res.data, after: undefined, sensitive: res.sensitive }
  },
})
