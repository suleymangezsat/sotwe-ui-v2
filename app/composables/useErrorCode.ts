/*
 * ErrorCode → translated `{ title, message }` lookup.
 *
 * Mirrors v1's `js/constants/ErrorMessage.js` + the `errors.<CODE>.*` keys
 * in each locale (`i18n/locales/{en,tr,id}.json`). Every backend
 * `SotweApiError` carries a `code: ErrorCode`; this composable resolves
 * that to localized title/message strings via vue-i18n's `$t()`.
 *
 * Usage in a component:
 *   const { title, message } = useErrorCode(err)
 *
 * Falls back to UNEXPECTED when the error is not a recognized
 * `SotweApiError`. When called outside a vue-i18n context (Vitest unit
 * tests, server routes) the title/message stay as their i18n keys —
 * still useful for log messages and tests can assert against them
 * without bootstrapping the full i18n instance.
 */

import { ErrorCode, type SotweApiError } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

export interface ErrorDisplay {
  title: string
  message: string
  code: ErrorCode
  status: number | undefined
}

/**
 * Best-effort `t()` helper. When useI18n() throws (e.g. test context with
 * no Nuxt app), we return the key as-is so callers still get a meaningful
 * non-empty string.
 */
function translate(key: string): string {
  try {
    const { t } = useI18n()
    return t(key)
  }
  catch {
    return key
  }
}

export function useErrorCode(err: unknown): ErrorDisplay {
  const resolve = (code: ErrorCode, status: number | undefined): ErrorDisplay => ({
    code,
    status,
    title: translate(`errors.${code}.title`),
    message: translate(`errors.${code}.message`),
  })
  if (isSotweApiError(err)) return resolve(err.code, err.status)
  return resolve(ErrorCode.UNEXPECTED, undefined)
}

export function errorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400: return ErrorCode.BAD_REQUEST
    case 401: return ErrorCode.BAD_CREDENTIALS
    case 403: return ErrorCode.INSUFFICIENT_SUBSCRIPTION
    case 404: return ErrorCode.NOT_FOUND
    case 410: return ErrorCode.SUSPENDED_USER
    case 503: return ErrorCode.NO_CONNECTION
    default: return ErrorCode.UNEXPECTED
  }
}

export type { SotweApiError }
