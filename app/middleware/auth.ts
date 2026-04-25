/*
 * Auth-required middleware — placeholder until Faz 7 wires up sidebase/
 * nuxt-auth. Redirects unauthenticated visitors to `/login` (v1 URL
 * scheme) with a `?redirect=<path>` query so they land back on the
 * protected route after signing in.
 *
 * The check reads the access-token cookie; when present we let the request
 * through. This matches the contract /me/* endpoints enforce, and means the
 * server-side render may still 401 from the backend — pages handle that via
 * their `error` branch.
 */

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | undefined>('sotwe-access-token')
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
