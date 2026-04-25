/// <reference types="@nuxt/test-utils" />

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPaginatedStore } from '~/utils/createPaginatedStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('createPaginatedStore — keyed + paginated + timeout', () => {
  it('fetches on first call and skips refetch while fresh', async () => {
    const fetcher = vi.fn(async (key: string | undefined) => ({
      data: [{ id: `${key}-1` }],
      after: 'cursor-1',
    }))

    const useStore = createPaginatedStore<{ id: string }>({
      id: 'test/a',
      keyed: true,
      timeout: 10_000,
      fetcher,
    })

    const store = useStore()
    await store.fetch('elonmusk')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(store.entry('elonmusk').data).toEqual([{ id: 'elonmusk-1' }])
    expect(store.entry('elonmusk').after).toBe('cursor-1')

    await store.fetch('elonmusk')
    expect(fetcher).toHaveBeenCalledTimes(1)

    store.invalidate('elonmusk')
    await store.fetch('elonmusk')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('lowercases the key so caching is case-insensitive', async () => {
    const fetcher = vi.fn(async () => ({ data: [{ id: 'x' }], after: 'c' }))
    const useStore = createPaginatedStore<{ id: string }>({
      id: 'test/b', keyed: true, timeout: 60_000, fetcher,
    })
    const store = useStore()
    await store.fetch('ElonMusk')
    await store.fetch('elonmusk')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('loadMore appends pages and stops when after is missing', async () => {
    const pages = [
      { data: [{ id: 1 }], after: 'a1' },
      { data: [{ id: 2 }], after: 'a2' },
      { data: [{ id: 3 }], after: undefined },
    ]
    const fetcher = vi.fn(async () => pages[0]!)
    const paginator = vi.fn(async (_key: string | undefined, after: string) => {
      return after === 'a1' ? pages[1]! : pages[2]!
    })

    const useStore = createPaginatedStore<{ id: number }>({
      id: 'test/c', keyed: true, fetcher, paginator,
    })
    const store = useStore()
    await store.fetch('key')
    expect(store.entry('key').data.map(d => d.id)).toEqual([1])

    await store.loadMore('key')
    expect(store.entry('key').data.map(d => d.id)).toEqual([1, 2])
    expect(store.entry('key').exhausted).toBe(false)

    await store.loadMore('key')
    expect(store.entry('key').data.map(d => d.id)).toEqual([1, 2, 3])
    expect(store.entry('key').exhausted).toBe(true)

    // Subsequent loadMore calls are a no-op when exhausted.
    await store.loadMore('key')
    expect(paginator).toHaveBeenCalledTimes(2)
  })

  it('captures SotweApiError into entry.error', async () => {
    const err = Object.assign(new Error('boom'), {
      name: 'SotweApiError',
      status: 404,
      code: 'NOT_FOUND' as const,
    })
    const fetcher = vi.fn(async () => { throw err })

    const useStore = createPaginatedStore<{ id: string }>({
      id: 'test/d', keyed: true, fetcher,
    })
    const store = useStore()
    await store.fetch('missing')
    expect(store.entry('missing').error).toEqual({
      statusCode: 404, code: 'NOT_FOUND', message: 'boom',
    })
    expect(store.entry('missing').loading).toBe(false)
  })
})

describe('createPaginatedStore — non-keyed', () => {
  it('shares a single entry regardless of the argument', async () => {
    const fetcher = vi.fn(async () => ({ data: [1, 2, 3], after: undefined }))
    const useStore = createPaginatedStore<number>({
      id: 'test/e', keyed: false, fetcher,
    })
    const store = useStore()
    await store.fetch('anything')
    await store.fetch('else')
    expect(fetcher).toHaveBeenCalledTimes(2) // no timeout → always refetch
    expect(store.entry().data).toEqual([1, 2, 3])
  })
})
