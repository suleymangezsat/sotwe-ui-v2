/*
 * Trailing-slash 301 — port of v1 `server/index.js` `handleRequest`
 * function. Sotwe's canonical URL form is the no-trailing-slash variant
 * (`/elonmusk` not `/elonmusk/`); without this redirect Google indexes
 * both, splits PageRank between them, and the duplicate flag costs us
 * crawl budget on a 1.5M-daily-visits site.
 *
 * Identical behaviour to v1: GET `/foo/?bar=1` → 301 `/foo?bar=1`.
 *   - Root `/` is preserved (not redirected).
 *   - Method-agnostic — applies to GET, HEAD, etc.; non-GET requests
 *     with trailing slashes are extremely rare so a 301 is fine.
 *   - Query string + hash are preserved in the destination URL.
 *
 * Runs before any page handler so the redirect lands at the network
 * edge rather than after page rendering.
 */

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // `/` itself is canonical — only act on deeper paths that end in `/`.
  if (path.length <= 1 || !path.endsWith('/')) return

  const target = path.slice(0, -1) + url.search + url.hash
  return sendRedirect(event, target, 301)
})
