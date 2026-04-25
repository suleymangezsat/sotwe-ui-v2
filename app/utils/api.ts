import type { FetchOptions } from 'ofetch'
import {
  ErrorCode,
  type BackendErrorBody,
  type SotweApiError,
} from '~shared/types'

type ApiClient = ReturnType<typeof $fetch.create>


/**
 * Create an `$fetch` instance bound to the sotwebe backend.
 *
 * SSR:     hits `runtimeConfig.privateApiUrl` (internal network, no CDN), and
 *          forwards the visitor's `Cf-IPCountry` header + our canonical origin
 *          so the backend can localize ads / trends and apply CORS correctly.
 *
 * Client:  hits `runtimeConfig.public.apiUrl` (through Cloudflare) with
 *          credentials: 'include' so the refresh cookie rides along.
 *
 * Errors:  the backend serializes failures as `{ message, code, statusCode }`.
 *          This factory re-throws a `SotweApiError` with those fields set so
 *          pages/stores can branch on a well-typed `code`.
 */
export function createApiClient(): ApiClient {
  const config = useRuntimeConfig()

  const baseURL = import.meta.server
    ? config.privateApiUrl
    : config.public.apiUrl

  const options: FetchOptions = {
    baseURL,
    credentials: 'include',
    retry: 0,
    onRequest({ options }) {
      const headers = new Headers(options.headers)

      if (import.meta.server) {
        // Backend CORS + localization contract — match what sotwe-ui v1
        // set in plugins/axios.js. Without a User-Agent + origin the
        // backend treats the request as an anonymous bot and strips data.
        headers.set('origin', config.public.siteUrl)
        const evt = useRequestEvent()
        if (evt) {
          const incoming = evt.node.req.headers
          const userAgent = (incoming['user-agent'] as string | undefined)
            ?? 'Mozilla/5.0 (compatible; Sotwe/2.0)'
          headers.set('User-Agent', userAgent)
          const country = incoming['cf-ipcountry']
          if (typeof country === 'string') headers.set('Cf-IPCountry', country)
          const acceptLang = incoming['accept-language']
          if (typeof acceptLang === 'string') headers.set('Accept-Language', acceptLang)
        }
      }

      options.headers = headers
    },
    onResponseError({ response }) {
      throw toSotweApiError(response._data, response.status)
    },
  }

  return $fetch.create(options)
}

/**
 * Lazy singleton per request. On the server each request gets its own client
 * (so `origin` / `Cf-IPCountry` headers are tied to the right visitor). On
 * the client the same instance is reused for the session.
 */
export function useApiClient(): ApiClient {
  const nuxt = useNuxtApp()
  if (!nuxt._sotweApiClient) {
    nuxt._sotweApiClient = createApiClient()
  }
  return nuxt._sotweApiClient as ApiClient
}

// -------------------------------------------------------------------------
// Error mapping
// -------------------------------------------------------------------------

function toSotweApiError(
  body: BackendErrorBody | string | undefined,
  status: number,
): SotweApiError {
  let code: ErrorCode = ErrorCode.UNEXPECTED
  let message = 'Unexpected error'

  if (body && typeof body === 'object') {
    if (body.code && body.code in ErrorCode) code = body.code
    if (body.message) message = body.message
  }

  if (!body || typeof body === 'string') {
    if (status === 401) code = ErrorCode.BAD_CREDENTIALS
    else if (status === 404) code = ErrorCode.NOT_FOUND
    else if (status === 503) code = ErrorCode.NO_CONNECTION
  }

  const err = new Error(message) as SotweApiError
  err.name = 'SotweApiError'
  err.status = status
  err.code = code
  return err
}

export function isSotweApiError(e: unknown): e is SotweApiError {
  return (
    e instanceof Error
    && (e as SotweApiError).name === 'SotweApiError'
    && typeof (e as SotweApiError).code === 'string'
  )
}
