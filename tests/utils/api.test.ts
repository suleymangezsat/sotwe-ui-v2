/// <reference types="@nuxt/test-utils" />

import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ErrorCode } from '~shared/types'

// createApiClient reads useRuntimeConfig() + calls useRequestEvent() on the
// server. We don't actually fire HTTP requests in these tests — we just want
// to assert base URL selection + error mapping shape.
mockNuxtImport('useRuntimeConfig', () => () => ({
  privateApiUrl: 'http://private.local/',
  public: {
    siteUrl: 'https://www.sotwe.com',
    apiUrl: 'https://www.sotwe.com/api',
  },
}))

mockNuxtImport('useRequestEvent', () => () => undefined)

// Stub the global `$fetch` that `$fetch.create()` reads from. We're not
// making a network call; we just need a callable with `.create`.
const captured: { baseURL?: string } = {}
;(globalThis as unknown as { $fetch: unknown }).$fetch = Object.assign(
  vi.fn(),
  {
    create: (opts: { baseURL?: string }) => {
      captured.baseURL = opts.baseURL
      return vi.fn()
    },
  },
)

const { createApiClient, isSotweApiError } = await import('~/utils/api')

describe('createApiClient', () => {
  it('selects the public apiUrl when running on the client', () => {
    createApiClient()
    expect(captured.baseURL).toBe('https://www.sotwe.com/api')
  })
})

describe('isSotweApiError', () => {
  it('is false for arbitrary errors', () => {
    expect(isSotweApiError(new Error('boom'))).toBe(false)
    expect(isSotweApiError('string')).toBe(false)
    expect(isSotweApiError(undefined)).toBe(false)
  })

  it('is true for errors tagged with name = SotweApiError and a code', () => {
    const e = Object.assign(new Error('x'), {
      name: 'SotweApiError',
      code: ErrorCode.BAD_CREDENTIALS,
      status: 401,
    })
    expect(isSotweApiError(e)).toBe(true)
  })
})
