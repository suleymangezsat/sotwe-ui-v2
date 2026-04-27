/*
 * Locale-detection middleware. `@nuxtjs/i18n` v9 already covers cookie +
 * Accept-Language detection out of the box; this middleware adds the
 * extra `?lang=<code>` query override that v1's `middleware/i18n.js`
 * supported. Visitors clicking a "switch language" deep-link
 * (e.g. `/elonmusk?lang=tr`) get the locale flipped + persisted before
 * the page resolves.
 *
 * Detection priority (matches v1 verbatim):
 *   1. ?lang query param (this middleware)
 *   2. i18n_redirected cookie     (handled by @nuxtjs/i18n)
 *   3. Accept-Language header     (handled by @nuxtjs/i18n)
 *   4. defaultLocale = 'en'       (handled by @nuxtjs/i18n)
 *
 * The cookie is updated server-side so a page refresh keeps the choice
 * even if the original `?lang` is dropped on a subsequent request.
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const lang = (to.query.lang as string | undefined)?.toLowerCase()
  if (!lang) return

  // Middleware runs outside a setup() scope, so `useI18n()` would crash.
  // Reach for the i18n instance via `useNuxtApp().$i18n` instead — same
  // shape, just bypasses the composable's setup-context guard.
  const { $i18n } = useNuxtApp()
  if (!$i18n) return
  type LocaleCode = typeof $i18n.locale.value
  const supported = $i18n.locales.value
    .map((l: unknown) => (typeof l === 'string' ? l : (l as { code: string }).code)) as LocaleCode[]
  if (!supported.includes(lang as LocaleCode)) return

  // `setLocale` is async — it lazy-loads the locale's message catalog and
  // flips `$i18n.locale.value` once that's resolved. We MUST await before
  // returning so the page renders against the new locale on this same
  // SSR pass; otherwise the rendered HTML reflects the previous (default)
  // locale and a client-side flicker re-renders everything.
  if ($i18n.locale.value !== lang) {
    await $i18n.setLocale(lang as LocaleCode)
  }

  // Persist to the same cookie name v1 used so returning visits stick
  // even when the `?lang` parameter is dropped from the URL.
  const cookie = useCookie<string>('i18n_redirected', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })
  cookie.value = lang
})
