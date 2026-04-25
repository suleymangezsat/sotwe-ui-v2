import { describe, expect, it } from 'vitest'
import { mapTweet, mapTweets, mapTweetResponse } from '~/utils/mappers'

const baseTweet = {
  id: '1',
  createdAt: 1,
  text: 't',
  favoriteCount: 0,
  retweetCount: 0,
  quoteCount: 0,
  replyCount: 0,
  bookmarkCount: 0,
  viewCount: 0,
  pinned: false,
  possiblySensitive: false,
  truncated: false,
} as const

describe('mapTweet', () => {
  it('renames the wire `ibookmarked` to `iBookmarked`', () => {
    const mapped = mapTweet({ ...baseTweet, ibookmarked: true })!
    expect(mapped.iBookmarked).toBe(true)
    expect((mapped as unknown as Record<string, unknown>).ibookmarked).toBeUndefined()
  })

  it('defaults iBookmarked to false when the wire field is missing', () => {
    const mapped = mapTweet({ ...baseTweet })!
    expect(mapped.iBookmarked).toBe(false)
  })

  it('walks nested retweetedStatus / quotedStatus / conversation', () => {
    const mapped = mapTweet({
      ...baseTweet,
      id: 'outer',
      retweetedStatus: { ...baseTweet, id: 'rt', ibookmarked: true },
      quotedStatus: { ...baseTweet, id: 'qt' },
      conversation: [{ ...baseTweet, id: 'c1', ibookmarked: true }],
    })!

    expect(mapped.retweetedStatus?.id).toBe('rt')
    expect(mapped.retweetedStatus?.iBookmarked).toBe(true)
    expect(mapped.quotedStatus?.iBookmarked).toBe(false)
    expect(mapped.conversation?.[0]?.iBookmarked).toBe(true)
  })

  it('returns undefined when wire is undefined', () => {
    expect(mapTweet(undefined)).toBeUndefined()
  })
})

describe('mapTweets', () => {
  it('returns [] for empty / missing arrays', () => {
    expect(mapTweets(undefined)).toEqual([])
    expect(mapTweets([])).toEqual([])
  })

  it('maps each element through mapTweet', () => {
    const out = mapTweets([
      { ...baseTweet, id: '1', ibookmarked: true },
      { ...baseTweet, id: '2' },
    ])
    expect(out).toHaveLength(2)
    expect(out[0]?.iBookmarked).toBe(true)
    expect(out[1]?.iBookmarked).toBe(false)
  })
})

describe('mapTweetResponse', () => {
  it('preserves the wrapper fields and maps the tweet array', () => {
    const res = mapTweetResponse({
      key: 'elonmusk',
      after: '12345',
      sensitive: true,
      cached: false,
      data: [{ ...baseTweet, id: 'a', ibookmarked: true }],
    })
    expect(res.key).toBe('elonmusk')
    expect(res.after).toBe('12345')
    expect(res.sensitive).toBe(true)
    expect(res.cached).toBe(false)
    expect(res.data).toHaveLength(1)
    expect(res.data[0]?.iBookmarked).toBe(true)
  })
})
