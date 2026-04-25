/*
 * Tweet text linkification — splits `tweet.text` into an ordered list of
 * plain-text and entity segments so the renderer can emit `<NuxtLink>` /
 * `<a>` elements instead of raw text.
 *
 * Reproduces the behaviour of sotwe-ui/components/common/DynamicLink.vue:
 *   - mentions   (@user)  → internal link to `/:username`
 *   - hashtags   (#tag)   → internal link to `/hashtag/:name`
 *   - urls       (t.co)   → external <a>, shown as `displayURL`
 *   - medias     (t.co)   → stripped from the rendered text (rendered
 *                           separately in the media grid)
 *
 * Character indexing follows the X text spec: `start` / `end` are code
 * *point* offsets, not UTF-16 code units. A regular `.slice()` on a
 * JavaScript string would split emoji / surrogate pairs incorrectly, so we
 * index into the code-point array via `Array.from(text)`.
 */

import type {
  HashtagEntity,
  MediaEntity,
  UrlEntity,
  UserMentionEntity,
} from '~shared/types'

export type TweetSegment =
  | { kind: 'text', text: string }
  | { kind: 'mention', text: string, screenName: string }
  | { kind: 'hashtag', text: string, tag: string }
  | { kind: 'url', text: string, href: string, title?: string }

interface BoundedEntity {
  start: number
  end: number
  kind: 'mention' | 'hashtag' | 'url' | 'media'
  payload: UrlEntity | HashtagEntity | UserMentionEntity | MediaEntity
}

export interface ParseInput {
  text: string
  urlEntities?: UrlEntity[]
  userMentionEntities?: UserMentionEntity[]
  tagEntities?: HashtagEntity[]
  mediaEntities?: MediaEntity[]
}

export function parseTweetText(input: ParseInput): TweetSegment[] {
  const chars = Array.from(input.text ?? '')
  const raw: BoundedEntity[] = []

  for (const m of input.userMentionEntities ?? []) {
    if (m.start != null && m.end != null) raw.push({ start: m.start, end: m.end, kind: 'mention', payload: m })
  }
  for (const h of input.tagEntities ?? []) {
    if (h.start != null && h.end != null) raw.push({ start: h.start, end: h.end, kind: 'hashtag', payload: h })
  }
  // Media entities share a URL with one of the `urlEntities` items; that
  // item would otherwise render as a plain text link. Flag those as
  // `media` so they get stripped from the rendered text (they'll render
  // separately in the media grid).
  const mediaUrls = new Set((input.mediaEntities ?? []).map(m => m.url))
  for (const u of input.urlEntities ?? []) {
    if (u.start == null || u.end == null) continue
    if (mediaUrls.has(u.url)) {
      raw.push({ start: u.start, end: u.end, kind: 'media', payload: u })
    }
    else {
      raw.push({ start: u.start, end: u.end, kind: 'url', payload: u })
    }
  }

  // Sort ascending by `start`, drop overlaps (keep the one that starts first).
  raw.sort((a, b) => a.start - b.start)
  const merged: BoundedEntity[] = []
  for (const e of raw) {
    const last = merged[merged.length - 1]
    if (last && e.start < last.end) continue // skip overlap
    merged.push(e)
  }

  // Remove media-kind entries by marking their slots as "skip" and splicing.
  const entitiesToRender = merged.filter(e => e.kind !== 'media')
  const skipRanges = merged.filter(e => e.kind === 'media').map(e => [e.start, e.end] as const)

  function sliceChars(from: number, to: number): string {
    return chars.slice(from, to).join('')
  }

  function takeTextWithSkips(from: number, to: number): string {
    let out = ''
    let cursor = from
    for (const [s, e] of skipRanges) {
      if (e <= cursor || s >= to) continue
      if (s > cursor) out += sliceChars(cursor, s)
      cursor = Math.max(cursor, e)
    }
    if (cursor < to) out += sliceChars(cursor, to)
    return out
  }

  const segments: TweetSegment[] = []
  let pos = 0

  for (const e of entitiesToRender) {
    if (e.start > pos) {
      const chunk = takeTextWithSkips(pos, e.start)
      if (chunk) segments.push({ kind: 'text', text: chunk })
    }
    if (e.kind === 'mention') {
      const m = e.payload as UserMentionEntity
      segments.push({ kind: 'mention', text: sliceChars(e.start, e.end), screenName: m.screenName })
    }
    else if (e.kind === 'hashtag') {
      const h = e.payload as HashtagEntity
      segments.push({ kind: 'hashtag', text: sliceChars(e.start, e.end), tag: h.text })
    }
    else if (e.kind === 'url') {
      const u = e.payload as UrlEntity
      segments.push({
        kind: 'url',
        text: u.displayURL || sliceChars(e.start, e.end),
        href: u.expandedURL || u.url,
        title: u.expandedURL,
      })
    }
    pos = e.end
  }

  const tail = takeTextWithSkips(pos, chars.length)
  if (tail) segments.push({ kind: 'text', text: tail })

  return segments
}
