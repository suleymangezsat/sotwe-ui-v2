/*
 * Single tweet detail (keyed by id). Used by /tweet/[id] plus anywhere we
 * need the full tweet object (quote-tweet expansion, share modal, etc.).
 */

import type { Tweet } from '~shared/types'
import { createResourceStore } from '~/utils/createResourceStore'

export const useTweetStore = createResourceStore<Tweet>({
  id: 'tweet',
  keyed: true,
  timeout: 10 * 60 * 1000,
  fetcher: async (id) => {
    if (!id) return undefined
    return useApi().tweet.get(id)
  },
})
