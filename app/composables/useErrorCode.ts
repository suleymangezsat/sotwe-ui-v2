/*
 * ErrorCode → user-facing i18n key mapping.
 *
 * Mirrors sotwe-ui/js/constants/ErrorMessage.js and the `errors.*` section
 * of each locale (app/locales/{en,tr,id}.js). Every ErrorCode has a matching
 * `errors.<CODE>.title` and `errors.<CODE>.message` translation.
 *
 * Usage in a component:
 *   const { title, message } = useErrorCode(err.code)
 *
 * Faz 7 wires this up to @nuxtjs/i18n's $t; for now the keys are plain
 * strings so tests can assert on them.
 */

import { ErrorCode, type SotweApiError } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

export interface ErrorDisplay {
  title: string
  message: string
  code: ErrorCode
  status: number | undefined
}

export function useErrorCode(err: unknown): ErrorDisplay {
  if (isSotweApiError(err)) {
    return {
      code: err.code,
      status: err.status,
      title: `errors.${err.code}.title`,
      message: `errors.${err.code}.message`,
    }
  }

  const fallback: ErrorCode = ErrorCode.UNEXPECTED
  return {
    code: fallback,
    status: undefined,
    title: `errors.${fallback}.title`,
    message: `errors.${fallback}.message`,
  }
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
