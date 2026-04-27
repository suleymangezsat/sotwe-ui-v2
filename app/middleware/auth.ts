/*
 * Auth-required middleware. Redirects unauthenticated visitors to `/login`
 * (v1 URL scheme) with a `?redirect=<path>` query so they land back on the
 * protected route after signing in.
 *
 * Reads the access-token cookie via `useAccessTokenCookie()`; when present
 * we let the request through. This matches the contract that `/me/*`
 * endpoints enforce — pages handle backend 401s via their own error branch.
 *
 * Faz 7 will swap this for `@sidebase/nuxt-auth`'s `auth: true` page-meta
 * shortcut once the module is wired into `nuxt.config.ts`.
 */

export default defineNuxtRouteMiddleware((to) => {
  const token = useAccessTokenCookie()
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
