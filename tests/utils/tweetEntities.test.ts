import { describe, expect, it } from 'vitest'
import { parseTweetText } from '~/utils/tweetEntities'

describe('parseTweetText', () => {
  it('returns a single text segment when there are no entities', () => {
    const segs = parseTweetText({ text: 'Hello world' })
    expect(segs).toEqual([{ kind: 'text', text: 'Hello world' }])
  })

  it('linkifies a single hashtag', () => {
    const segs = parseTweetText({
      text: 'I love #Sotwe app',
      tagEntities: [{ text: 'Sotwe', start: 7, end: 13 }],
    })
    expect(segs).toEqual([
      { kind: 'text', text: 'I love ' },
      { kind: 'hashtag', text: '#Sotwe', tag: 'Sotwe' },
      { kind: 'text', text: ' app' },
    ])
  })

  it('linkifies a single mention', () => {
    const segs = parseTweetText({
      text: 'hey @elonmusk check',
      userMentionEntities: [{
        text: 'elonmusk',
        name: 'Elon Musk',
        screenName: 'elonmusk',
        id: '44196397',
        start: 4,
        end: 13,
      }],
    })
    expect(segs[1]).toEqual({ kind: 'mention', text: '@elonmusk', screenName: 'elonmusk' })
  })

  it('replaces t.co url with expanded displayURL', () => {
    const segs = parseTweetText({
      text: 'visit https://t.co/abc',
      urlEntities: [{
        text: 'https://t.co/abc',
        url: 'https://t.co/abc',
        expandedURL: 'https://example.com/path',
        displayURL: 'example.com/path',
        start: 6,
        end: 22,
      }],
    })
    expect(segs[1]).toEqual({
      kind: 'url',
      text: 'example.com/path',
      href: 'https://example.com/path',
      title: 'https://example.com/path',
    })
  })

  it('removes media url from the rendered text', () => {
    const segs = parseTweetText({
      text: 'Pic https://t.co/xyz',
      urlEntities: [{
        text: 'https://t.co/xyz',
        url: 'https://t.co/xyz',
        expandedURL: 'https://x.com/i/photo/1',
        displayURL: 'pic.x.com/xyz',
        start: 4,
        end: 20,
      }],
      mediaEntities: [{
        id: '1',
        url: 'https://t.co/xyz',
        mediaURL: 'https://pbs.twimg.com/media/X.jpg',
        expandedURL: 'https://x.com/i/photo/1',
        displayURL: 'pic.x.com/xyz',
        type: 'photo',
        text: 'https://t.co/xyz',
      }],
    })
    // Media url is stripped — only the "Pic " prefix remains.
    expect(segs).toEqual([{ kind: 'text', text: 'Pic ' }])
  })

  it('skips overlapping entities (keeps the first)', () => {
    const segs = parseTweetText({
      text: '#foo bar',
      tagEntities: [
        { text: 'foo', start: 0, end: 4 },
        { text: 'foo', start: 2, end: 4 }, // overlaps with first
      ],
    })
    expect(segs.filter(s => s.kind === 'hashtag')).toHaveLength(1)
  })

  it('handles multi-byte codepoints in entity offsets', () => {
    // U+1F680 🚀 is 2 UTF-16 units but 1 codepoint
    const segs = parseTweetText({
      text: '🚀 #moon today',
      tagEntities: [{ text: 'moon', start: 2, end: 7 }],
    })
    expect(segs).toEqual([
      { kind: 'text', text: '🚀 ' },
      { kind: 'hashtag', text: '#moon', tag: 'moon' },
      { kind: 'text', text: ' today' },
    ])
  })
})
