/*
 * Popular users — right-rail widget on the home page. Paginated by user id
 * string cursor. Keyed by `country-category` so different rails can coexist.
 */

import type { User } from '~shared/types'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

export const useUserPopularStore = createPaginatedStore<User>({
  id: 'user/popular',
  keyed: true,
  timeout: 10 * 60 * 1000,
  fetcher: async (key) => {
    const [country, category] = (key ?? '-').split(':')
    const res = await useApi().user.popular({
      country: country || undefined,
      category: category || undefined,
      size: 20,
    })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
  paginator: async (key, after) => {
    const [country, category] = (key ?? '-').split(':')
    const res = await useApi().user.popular({
      country: country || undefined,
      category: category || undefined,
      size: 20,
      after: after as string,
    })
    return { data: res.data, after: res.after, sensitive: res.sensitive }
  },
})
