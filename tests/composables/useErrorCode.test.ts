import { describe, expect, it } from 'vitest'
import { ErrorCode } from '~shared/types'
import { errorCodeFromStatus, useErrorCode } from '~/composables/useErrorCode'

describe('errorCodeFromStatus', () => {
  it.each([
    [400, ErrorCode.BAD_REQUEST],
    [401, ErrorCode.BAD_CREDENTIALS],
    [403, ErrorCode.INSUFFICIENT_SUBSCRIPTION],
    [404, ErrorCode.NOT_FOUND],
    [410, ErrorCode.SUSPENDED_USER],
    [503, ErrorCode.NO_CONNECTION],
    [418, ErrorCode.UNEXPECTED],
    [500, ErrorCode.UNEXPECTED],
  ])('maps %d → %s', (status, code) => {
    expect(errorCodeFromStatus(status)).toBe(code)
  })
})

describe('useErrorCode', () => {
  it('falls back to UNEXPECTED for non-SotweApiError inputs', () => {
    expect(useErrorCode(new Error('nope')).code).toBe(ErrorCode.UNEXPECTED)
    expect(useErrorCode(undefined).code).toBe(ErrorCode.UNEXPECTED)
  })

  it('produces i18n keys based on the error code', () => {
    const e = Object.assign(new Error('x'), {
      name: 'SotweApiError',
      code: ErrorCode.BOOKMARK_SIZE_EXCEEDED,
      status: 403,
    })
    const display = useErrorCode(e)
    expect(display.code).toBe(ErrorCode.BOOKMARK_SIZE_EXCEEDED)
    expect(display.title).toBe('errors.BOOKMARK_SIZE_EXCEEDED.title')
    expect(display.message).toBe('errors.BOOKMARK_SIZE_EXCEEDED.message')
    expect(display.status).toBe(403)
  })
})
