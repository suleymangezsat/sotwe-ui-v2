import { describe, expect, it } from 'vitest'
import { validateDownloadUrl } from '../../server/utils/download'

/*
 * Open-relay protection. The `/download` proxy is a tempting amplifier
 * if it ever forwards to an arbitrary host — these tests pin the
 * `*.twimg.com` whitelist + the filename derivation that fills
 * Content-Disposition. v1 had the same allow-list (Express `if
 * (url.hostname.includes('twimg.com'))`); we tighten it to a hostname
 * suffix match so `eviltwimg.com` doesn't slip past `includes`.
 */

describe('validateDownloadUrl', () => {
  it('rejects missing or non-string input', () => {
    expect(validateDownloadUrl(undefined)).toEqual({ ok: false, reason: 'missing' })
    expect(validateDownloadUrl('')).toEqual({ ok: false, reason: 'missing' })
    expect(validateDownloadUrl(null)).toEqual({ ok: false, reason: 'missing' })
    expect(validateDownloadUrl(42)).toEqual({ ok: false, reason: 'missing' })
  })

  it('rejects unparseable URLs', () => {
    expect(validateDownloadUrl('not-a-url')).toEqual({ ok: false, reason: 'bad-url' })
    // schema-relative URLs need a base to parse — `new URL('//foo')` throws
    expect(validateDownloadUrl('//pbs.twimg.com/foo.jpg')).toEqual({ ok: false, reason: 'bad-url' })
  })

  it('rejects hosts outside *.twimg.com', () => {
    expect(validateDownloadUrl('https://example.com/foo.jpg')).toEqual({ ok: false, reason: 'host-not-allowed' })
    expect(validateDownloadUrl('https://twimg.com.evil.com/foo.jpg')).toEqual({ ok: false, reason: 'host-not-allowed' })
    // The `includes('twimg.com')` v1 check would have let this through;
    // our suffix regex catches it.
    expect(validateDownloadUrl('https://eviltwimg.com/foo.jpg')).toEqual({ ok: false, reason: 'host-not-allowed' })
  })

  it('accepts pbs.twimg.com photo URLs and extracts the filename', () => {
    const r = validateDownloadUrl('https://pbs.twimg.com/media/Abc123.jpg?format=jpg')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.filename).toBe('Abc123.jpg')
  })

  it('accepts video.twimg.com video URLs and extracts the filename', () => {
    const r = validateDownloadUrl('https://video.twimg.com/ext_tw_video/12345/pu/vid/1280x720/sample.mp4')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.filename).toBe('sample.mp4')
  })

  it('falls back to "download" when the path has no segments', () => {
    const r = validateDownloadUrl('https://pbs.twimg.com/')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.filename).toBe('download')
  })
})
