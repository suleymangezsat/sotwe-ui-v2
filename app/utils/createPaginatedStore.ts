/*
 * Keyed / non-keyed paginated collection store factory.
 *
 * Replaces the sotwe-ui v1 state/mutation/action helpers:
 *   sotwe-ui/js/helpers/vuex/stateHelper.js    (createInitialState)
 *   sotwe-ui/js/helpers/vuex/mutationHelper.js (set / setLoading / setFail / setSuccess / add* variants)
 *   sotwe-ui/js/helpers/vuex/GenericActionHelper.js (beforeFetch / onSuccess / onError)
 *
 * Behaviour preserved 1-1:
 *   - `timeout` ms cache per key — skip refetch when fresh
 *   - Keyed (user/timeline, hashtag/timeline, ...) store per-key: data, after, sensitive, lastUpdated
 *   - Non-keyed (bookmark/timeline, ...) store a single slot
 *   - `.fetch(key)` initializes + loads first page
 *   - `.loadMore(key)` appends next page using stored `after` cursor
 *   - Errors capture statusCode + code + message so the CardLoader can branch
 *
 * Pagination cursor is typed via the generic `TAfter` param so bookmarks
 * (integer page) and other endpoints (string cursor) both work.
 */

import type { SotweApiError } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

export interface FetchResult<T, TAfter extends string | number = string> {
  data: T[]
  after?: TAfter
  sensitive?: boolean
}

export interface StoreError {
  statusCode?: number
  code?: SotweApiError['code']
  message?: string
}

export interface Entry<T, TAfter extends string | number = string> {
  data: T[]
  after?: TAfter
  sensitive: boolean
  lastUpdated: number
  loading: boolean
  error?: StoreError
  pageLoading: boolean
  pageError?: StoreError
  exhausted: boolean
}

const DEFAULT_KEY = '__default__'

function emptyEntry<T, TAfter extends string | number>(): Entry<T, TAfter> {
  return {
    data: [],
    after: undefined,
    sensitive: false,
    lastUpdated: 0,
    loading: false,
    pageLoading: false,
    exhausted: false,
  }
}

function toStoreError(err: unknown): StoreError {
  if (isSotweApiError(err)) {
    return { statusCode: err.status, code: err.code, message: err.message }
  }
  return { statusCode: 503 }
}

export interface PaginatedStoreOptions<T, TAfter extends string | number = string> {
  id: string
  /** When true, keyed by the first argument to `fetch`/`loadMore`. */
  keyed?: boolean
  /** ms. When > 0, a key with fresh data skips refetch. */
  timeout?: number
  fetcher: (_key: string | undefined) => Promise<FetchResult<T, TAfter>>
  paginator?: (_key: string | undefined, _after: TAfter) => Promise<FetchResult<T, TAfter>>
}

/**
 * Create a Pinia store for a keyed / non-keyed paginated list.
 *
 * Returned store exposes:
 *   - `entry(key?)`  → reactive Entry for UI reads
 *   - `fetch(key?)`  → load first page (skips if cached)
 *   - `loadMore(key?)` → append next page (no-op if no cursor / exhausted)
 *   - `invalidate(key?)` → force next fetch to go over the wire
 */
export function createPaginatedStore<T, TAfter extends string | number = string>(
  opts: PaginatedStoreOptions<T, TAfter>,
) {
  return defineStore(opts.id, () => {
    const entries = ref<Record<string, Entry<T, TAfter>>>({})

    function resolveKey(key?: string) {
      return opts.keyed ? (key?.toLowerCase() || DEFAULT_KEY) : DEFAULT_KEY
    }

    function entry(key?: string): Entry<T, TAfter> {
      const k = resolveKey(key)
      if (!entries.value[k]) entries.value[k] = emptyEntry<T, TAfter>()
      return entries.value[k]
    }

    function invalidate(key?: string) {
      entry(key).lastUpdated = 0
    }

    function isFresh(e: Entry<T, TAfter>) {
      return !!opts.timeout && e.lastUpdated > 0
        && Date.now() - e.lastUpdated < opts.timeout
        && e.data.length > 0
    }

    async function fetch(key?: string) {
      const e = entry(key)
      if (isFresh(e)) return
      e.loading = true
      e.error = undefined
      try {
        const res = await opts.fetcher(opts.keyed ? key : undefined)
        e.data = res.data ?? []
        e.after = res.after
        e.sensitive = !!res.sensitive
        e.exhausted = !res.after || e.data.length === 0
        e.lastUpdated = Date.now()
      }
      catch (err) {
        e.error = toStoreError(err)
      }
      finally {
        e.loading = false
      }
    }

    async function loadMore(key?: string) {
      if (!opts.paginator) return
      const e = entry(key)
      if (e.pageLoading || e.exhausted || !e.after) return
      e.pageLoading = true
      e.pageError = undefined
      try {
        const res = await opts.paginator(opts.keyed ? key : undefined, e.after)
        const nextData = res.data ?? []
        e.data = [...e.data, ...nextData]
        e.after = res.after
        if (res.sensitive) e.sensitive = true
        e.exhausted = !res.after || nextData.length === 0
      }
      catch (err) {
        e.pageError = toStoreError(err)
      }
      finally {
        e.pageLoading = false
      }
    }

    return {
      entries,
      entry,
      fetch,
      loadMore,
      invalidate,
    }
  })
}
