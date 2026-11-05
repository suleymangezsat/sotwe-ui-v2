/*
 * Pure URL validation for the `/download` proxy. Pulled out of
 * `server/routes/download.ts` so unit tests can import it without
 * triggering Nitro's `defineEventHandler` auto-import (which is only
 * resolved at server build time).
 *
 * `*.twimg.com` is matched as a suffix — v1 used `String#includes`
 * which would have let `eviltwimg.com` through; this regex tightens
 * that contract.
 */

const ALLOWED_HOST_RE = /\.twimg\.com$/

export type DownloadValidationOk = { ok: true, url: URL, filename: string }
export type DownloadValidationErr = { ok: false, reason: 'missing' | 'bad-url' | 'host-not-allowed' }
export type DownloadValidationResult = DownloadValidationOk | DownloadValidationErr

export function validateDownloadUrl(input: unknown): DownloadValidationResult {
  if (!input || typeof input !== 'string') return { ok: false, reason: 'missing' }
  let url: URL
  try {
    url = new URL(input)
  }
  catch {
    return { ok: false, reason: 'bad-url' }
  }
  if (!ALLOWED_HOST_RE.test(url.hostname)) return { ok: false, reason: 'host-not-allowed' }
  // Last path segment as filename. `?format=jpg`-style query strings on
  // photo URLs are intentionally dropped — Twitter's CDN ignores them
  // when we proxy server-side, and a `*.jpg` extension on the download
  // is what users actually want.
  const segments = url.pathname.split('/').filter(Boolean)
  const filename = segments[segments.length - 1] || 'download'
  return { ok: true, url, filename }
}
