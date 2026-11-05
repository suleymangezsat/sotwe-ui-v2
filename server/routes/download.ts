import { validateDownloadUrl } from '../utils/download'

/*
 * Tweet media proxy — port of v1 `server/api/download.js`. Single-file
 * downloader for individual photo / video URLs hosted on Twitter's CDN.
 * Bypasses the X CDN's `Referer: x.com` requirement that 403s us when
 * the visitor right-click-saves directly from the page.
 *
 * Path: lives under `server/routes/` (NOT `server/api/`) so the route
 * mounts at `/download` rather than `/api/download`. The `/api/*`
 * namespace is reserved for the Nitro `devProxy` that forwards to the
 * Sotwebe backend — putting this here would shadow the proxy and 404.
 *
 * Usage:
 *   GET /download?url=https://video.twimg.com/.../sample.mp4
 *
 * Responds with the upstream bytes plus a `Content-Disposition:
 * attachment` header so the browser triggers a download instead of an
 * inline preview. The filename is the last path segment of the upstream
 * URL.
 *
 * Security: we only proxy hosts under `*.twimg.com` to keep this from
 * being a generic open relay. Anything else returns 400.
 *
 * NOTE: the timeline-wide "Download all media" zip flow lives client-side
 * in `app/components/user/SDownloadAllButton.vue` and uses `client-zip`
 * — it never hits this endpoint. This proxy is only for the per-media
 * "Download" affordance on a single tweet.
 */

export default defineEventHandler(async (event) => {
  // v1 mounted via Express `app.get(...)`; we keep parity by 405-ing
  // POST / PUT / DELETE etc. — proxy is a read-only fetch helper.
  // (`server/routes/download.get.ts` would be cleaner but the `.get.ts`
  // method suffix is only honoured under `server/api/`.)
  assertMethod(event, ['GET', 'HEAD'])

  const { url: urlParam } = getQuery<{ url?: string }>(event)
  const validated = validateDownloadUrl(urlParam)
  if (!validated.ok) {
    const message = validated.reason === 'missing'
      ? 'Missing url query param'
      : validated.reason === 'bad-url'
        ? 'Bad url'
        : 'Host not allowed'
    throw createError({ statusCode: 400, statusMessage: message })
  }
  const { url, filename } = validated

  // Fetch the upstream blob with no Referer (the entire reason this
  // proxy exists — Twitter's CDN 403s requests with `referer: x.com` on
  // some endpoints, but happily serves anonymous server-side fetches).
  const upstream = await fetch(url.toString(), {
    headers: { 'User-Agent': 'sotwe-bot/1.0' },
  })

  if (!upstream.ok || !upstream.body) {
    throw createError({
      statusCode: upstream.status || 502,
      statusMessage: `Upstream fetch failed: ${upstream.statusText || 'no body'}`,
    })
  }

  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  // Pass the upstream Content-Type through so video/mp4, image/jpeg,
  // image/png all decode correctly browser-side.
  const contentType = upstream.headers.get('content-type')
  if (contentType) setHeader(event, 'Content-Type', contentType)
  // Don't propagate Content-Length: h3 expects a number and we'd have to
  // parseInt the upstream string, with the risk of a wrong value
  // breaking the download. Chunked transfer (no length) is fine for the
  // browser — it just keeps reading until the stream ends.
  // Don't let CF or browsers cache the proxy response under our origin —
  // these blobs are sized in MB and would balloon edge cache for no
  // benefit (the user-facing URL is opaque).
  setHeader(event, 'Cache-Control', 'no-store')

  // Web ReadableStream → Node.js consumer. h3's `sendStream` works with
  // either; passing the raw Web stream is fine on Nitro 2.x.
  return sendStream(event, upstream.body)
})
