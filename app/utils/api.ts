import type { FetchOptions } from 'ofetch'
import {
  ErrorCode,
  type AuthTokens,
  type BackendErrorBody,
  type SotweApiError,
} from '~shared/types'

type ApiClient = ReturnType<typeof $fetch.create>

const ACCESS_COOKIE = 'sotwe-access-token'
const REFRESH_COOKIE = 'sotwe-refresh-token'

/**
 * Single-flight refresh. If a 401 lands on the client we exchange the
 * refresh-cookie for a new pair of tokens once and replay every concurrent
 * request that arrived during the window. Without de-duplication a page
 * with five parallel `useApi().me.*` calls would burn five refresh-token
 * requests, and the backend revokes the refresh token on each rotation —
 * so only the first call would succeed, the rest would log the user out.
 */
let inflightRefresh: Promise<AuthTokens | null> | null = null


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
    onRequest({ request, options }) {
      const headers = new Headers(options.headers)

      // Bearer token, only on the `/me/*` paths that actually require it.
      // Public endpoints (`/v3/*`, `/v2/*`) are explicitly skipped — some
      // backends (notably the dev sotwebe instance) reject an *invalid*
      // JWT with 401 even on otherwise-public endpoints, so attaching a
      // stale prod token to a public listing request paradoxically breaks
      // it. Auth endpoints (`/v3/auth/*`) also never get a token —
      // they're how you mint one.
      const url = typeof request === 'string' ? request : request.toString()
      const needsAuth = url.includes('/me/')
      if (needsAuth) {
        const token = readAccessToken()
        if (token) headers.set('Authorization', `Bearer ${token}`)
      }

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
 * Read the access-token cookie WITHOUT going through Nuxt's `useCookie`
 * helper. `useCookie` requires a Nuxt instance bound to the call (it reads
 * from `useNuxtApp()` synchronously) which isn't available inside `ofetch`
 * interceptors on the client. We read the cookie directly to stay
 * framework-shaped without leaking it into the api factory's signature.
 */
function readAccessToken(): string | null {
  if (import.meta.server) {
    const evt = useRequestEvent()
    const cookieHeader = evt?.node.req.headers.cookie
    if (!cookieHeader) return null
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`))
    return m && m[1] ? decodeURIComponent(m[1]) : null
  }
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`))
  return m && m[1] ? decodeURIComponent(m[1]) : null
}

/**
 * Refresh helper exposed for the auth composable. Hits `/v3/auth/refreshToken`
 * exactly once even when several callers race for it, then resolves every
 * waiter with the result. Callers are responsible for writing the new
 * tokens back into the cookies (see `useAuth().refresh()`).
 */
export async function refreshTokensOnce(refreshToken: string): Promise<AuthTokens | null> {
  if (inflightRefresh) return inflightRefresh
  inflightRefresh = (async () => {
    try {
      const client = useApiClient()
      return await client<AuthTokens>('/v3/auth/refreshToken', {
        method: 'POST',
        body: { refreshToken },
      })
    }
    catch {
      return null
    }
    finally {
      inflightRefresh = null
    }
  })()
  return inflightRefresh
}

export const AUTH_COOKIES = { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE } as const

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
