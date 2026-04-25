import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createResourceStore } from '~/utils/createResourceStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('createResourceStore — keyed', () => {
  it('caches per-key within the timeout window', async () => {
    const fetcher = vi.fn(async (id: string | undefined) => ({ id, fetchedAt: Date.now() }))
    const useStore = createResourceStore<{ id: string | undefined, fetchedAt: number }>({
      id: 'res/a', keyed: true, timeout: 60_000, fetcher,
    })
    const store = useStore()
    await store.fetch('t1')
    const first = store.entry('t1').data
    await store.fetch('t1')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(store.entry('t1').data).toBe(first)

    await store.fetch('t2')
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(store.entry('t2').data?.id).toBe('t2')
  })

  it('captures errors without clearing prior data', async () => {
    let phase: 'ok' | 'fail' = 'ok'
    const fetcher = vi.fn(async () => {
      if (phase === 'fail') {
        throw Object.assign(new Error('nope'), {
          name: 'SotweApiError', status: 503, code: 'NO_CONNECTION' as const,
        })
      }
      return { id: 'tx' }
    })

    const useStore = createResourceStore<{ id: string }>({
      id: 'res/b', keyed: true, fetcher,
    })
    const store = useStore()
    await store.fetch('tx')
    expect(store.entry('tx').data).toEqual({ id: 'tx' })

    phase = 'fail'
    store.invalidate('tx')
    await store.fetch('tx')
    expect(store.entry('tx').error?.code).toBe('NO_CONNECTION')
    expect(store.entry('tx').data).toEqual({ id: 'tx' })
  })
})
