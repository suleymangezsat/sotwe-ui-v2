/*
 * Auth state + token plumbing.
 *
 * Until Faz 7 swaps in `@sidebase/nuxt-auth`, this is the single source of
 * truth for "is the visitor signed in?". It owns:
 *
 *   - the `sotwe-access-token` and `sotwe-refresh-token` cookies (90-day
 *     refresh, 30-min access — same horizons as v1's `@nuxtjs/auth-next`)
 *   - a reactive `user` ref that loads once from `/me/profile` and survives
 *     page transitions (kept on `useState` so SSR can hydrate it without a
 *     re-fetch flicker)
 *   - the `signIn` / `signOut` / `refresh` actions that pages call
 *
 * `app/utils/api.ts` reads the access-token cookie inside its `onRequest`
 * hook so authenticated calls automatically pick up `Authorization: Bearer
 * <jwt>`. That keeps page code framework-shaped (`useApi().me.profile()`)
 * even though the JWT lives outside the api client itself.
 *
 * The refresh path is deliberately client-only: SSR cannot rotate cookies
 * mid-request without breaking the response stream, and the access cookie
 * we receive from the visitor is good enough for the initial render.
 */

import type {
  AuthTokens,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  SocialLoginPayload,
  UserProfile,
} from '~shared/types'

const ACCESS_TOKEN_COOKIE = 'sotwe-access-token'
const REFRESH_TOKEN_COOKIE = 'sotwe-refresh-token'

// 30 minutes — matches the backend's JWT `exp` claim. The refresh cookie
// lasts 90 days so re-visits from a few weeks ago still authenticate
// silently.
const ACCESS_TOKEN_MAX_AGE = 60 * 30
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 90

export function useAccessTokenCookie() {
  return useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
    sameSite: 'lax',
    secure: import.meta.client ? location.protocol === 'https:' : true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  })
}

export function useRefreshTokenCookie() {
  return useCookie<string | null>(REFRESH_TOKEN_COOKIE, {
    sameSite: 'lax',
    secure: import.meta.client ? location.protocol === 'https:' : true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  })
}

export function useAuth() {
  const accessToken = useAccessTokenCookie()
  const refreshToken = useRefreshTokenCookie()

  // `useState` survives navigation + hydrates from the server payload, so
  // pages don't see a `null` flicker after `signIn()` resolves.
  const user = useState<UserProfile | null>('sotwe-auth-user', () => null)
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function applyTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  async function fetchUser(): Promise<UserProfile | null> {
    if (!accessToken.value) {
      user.value = null
      return null
    }
    try {
      const profile = await useApi().me.profile()
      user.value = profile
      return profile
    }
    catch (firstErr) {
      // The access token is rejected. Most often this is just a 30-minute
      // expiry — the refresh cookie is still valid, so try rotating once
      // before giving up. This matches what v1's `@nuxtjs/auth-next` does
      // transparently and is what the seeder relies on when an expired
      // JWT is pasted alongside a fresh refresh token.
      const refreshed = await refresh()
      if (refreshed) {
        try {
          const profile = await useApi().me.profile()
          user.value = profile
          return profile
        }
        catch { /* fall through to clearTokens below */ }
      }
      // Both the access AND refresh path are dead — clear cookies so the
      // UI can render the signed-out shell instead of looping on a stale
      // pair.
      // eslint-disable-next-line no-console
      console.warn('[auth] token rejected', firstErr)
      clearTokens()
      return null
    }
  }

  async function signIn(body: LoginPayload): Promise<UserProfile> {
    const tokens = await useApi().auth.login(body)
    applyTokens(tokens)
    const profile = await fetchUser()
    if (!profile) throw new Error('Sign-in succeeded but profile fetch failed')
    return profile
  }

  async function signInWithGoogle(body: SocialLoginPayload): Promise<UserProfile> {
    const tokens = await useApi().auth.google(body)
    applyTokens(tokens)
    const profile = await fetchUser()
    if (!profile) throw new Error('Google sign-in succeeded but profile fetch failed')
    return profile
  }

  async function completeSignup(body: SignupPayload): Promise<UserProfile> {
    const tokens = await useApi().auth.signup(body)
    applyTokens(tokens)
    const profile = await fetchUser()
    if (!profile) throw new Error('Signup completed but profile fetch failed')
    return profile
  }

  async function refresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const tokens = await useApi().auth.refresh({ refreshToken: refreshToken.value })
      applyTokens(tokens)
      return true
    }
    catch {
      clearTokens()
      return false
    }
  }

  async function resetPassword(payload: ResetPasswordPayload, step: 'init' | 'verify' | 'confirm') {
    const api = useApi().auth
    if (step === 'init') return api.forgotInit(payload)
    if (step === 'verify') return api.forgotVerify(payload)
    return api.forgotConfirm(payload)
  }

  function signOut(): void {
    clearTokens()
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    signIn,
    signInWithGoogle,
    completeSignup,
    signOut,
    refresh,
    fetchUser,
    applyTokens,
    resetPassword,
  }
}
