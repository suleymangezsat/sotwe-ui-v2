/*
 * Pure decision helper for the `?lang=XX` middleware.
 *
 * The middleware itself wires Nuxt globals (`useNuxtApp().$i18n`,
 * `useCookie`) — but the actual rules ("normalize, validate against the
 * supported set, only act when the locale is changing") are best
 * tested in isolation. This helper returns the resolved action; the
 * middleware translates that into `$i18n.setLocale()` + cookie writes.
 *
 * Detection priority (matches v1's `middleware/i18n.js`):
 *   1. ?lang query param  → `applyOverride()`
 *   2. i18n_redirected cookie     (resolved upstream by @nuxtjs/i18n)
 *   3. Accept-Language header     (resolved upstream by @nuxtjs/i18n)
 *   4. defaultLocale = 'en'       (resolved upstream by @nuxtjs/i18n)
 */

export type LangOverrideAction
  = { kind: 'noop' }
    | { kind: 'apply', locale: string }

export function resolveLangOverride(input: {
  /** Raw value from `route.query.lang`. May be undefined / array / string. */
  query: string | string[] | undefined
  /** ISO codes the i18n module advertises as supported. */
  supported: readonly string[]
  /** Currently resolved locale (already applied via cookie / Accept-Language). */
  current: string
}): LangOverrideAction {
  // Vue Router can deliver array values for repeated query keys
  // (`?lang=tr&lang=id`). Take the first; ignore everything else.
  const raw = Array.isArray(input.query) ? input.query[0] : input.query
  if (!raw || typeof raw !== 'string') return { kind: 'noop' }

  const lang = raw.toLowerCase()
  if (!input.supported.includes(lang)) return { kind: 'noop' }

  // Already on the requested locale — no setLocale call, no cookie
  // write. Lets the middleware skip the async setLocale + the cookie
  // round-trip on the common case where the cookie already pins the
  // locale and the user just bookmarked a `?lang=` link.
  if (input.current === lang) return { kind: 'noop' }

  return { kind: 'apply', locale: lang }
}
