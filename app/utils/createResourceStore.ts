/*
 * Single-resource store factory.
 *
 * For endpoints that return one thing (tweet detail, user profile, current
 * subscription) rather than a paginated list. Supports both keyed and
 * non-keyed shapes, same timeout caching as createPaginatedStore.
 *
 *   createResourceStore<Tweet>({ id: 'tweet', keyed: true, timeout: 600_000,
 *     fetcher: (id) => useApi().tweet.get(id!) })
 */

import type { SotweApiError } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

export interface ResourceEntry<T> {
  data?: T
  loading: boolean
  error?: { statusCode?: number, code?: SotweApiError['code'], message?: string }
  lastUpdated: number
}

const DEFAULT_KEY = '__default__'

function toErr(err: unknown) {
  if (isSotweApiError(err)) return { statusCode: err.status, code: err.code, message: err.message }
  return { statusCode: 503 }
}

export interface ResourceStoreOptions<T> {
  id: string
  keyed?: boolean
  /** ms. Fresh entries within this window skip refetch. */
  timeout?: number
  fetcher: (_key: string | undefined) => Promise<T | undefined>
}

export function createResourceStore<T>(opts: ResourceStoreOptions<T>) {
  return defineStore(opts.id, () => {
    const entries = ref<Record<string, ResourceEntry<T>>>({})

    function resolveKey(key?: string) {
      return opts.keyed ? (key?.toLowerCase() || DEFAULT_KEY) : DEFAULT_KEY
    }

    function entry(key?: string): ResourceEntry<T> {
      const k = resolveKey(key)
      if (!entries.value[k]) entries.value[k] = { loading: false, lastUpdated: 0 }
      return entries.value[k]
    }

    function invalidate(key?: string) {
      entry(key).lastUpdated = 0
    }

    function isFresh(e: ResourceEntry<T>) {
      return !!opts.timeout && e.lastUpdated > 0
        && Date.now() - e.lastUpdated < opts.timeout
        && e.data !== undefined
    }

    async function fetch(key?: string) {
      const e = entry(key)
      if (isFresh(e)) return
      e.loading = true
      e.error = undefined
      try {
        const res = await opts.fetcher(opts.keyed ? key : undefined)
        e.data = res
        e.lastUpdated = Date.now()
      }
      catch (err) {
        e.error = toErr(err)
      }
      finally {
        e.loading = false
      }
    }

    return {
      entries,
      entry,
      fetch,
      invalidate,
    }
  })
}
