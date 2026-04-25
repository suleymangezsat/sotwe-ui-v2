/*
 * Wire → domain transformations.
 *
 * The backend's JSON shape is mostly good, but two things need normalizing
 * on the way in:
 *   1. `ibookmarked` (lowercase b) → `iBookmarked`. Jackson lowercases the
 *      leading `i` when serializing `isIBookmarked`, so we rename here.
 *   2. Some endpoints return a bare array instead of a `Response<T>` wrapper
 *      (woeids, nearby). Callers of those endpoints don't need a mapper at
 *      all — `useApi` only runs mappers on response-wrapped results.
 *
 * Mirrors sotwe-ui/js/mappers/index.js semantics (who-to-follow handling,
 * timeline cursor, sensitive flag) but typed.
 */

import type {
  SotweResponse,
  Tweet,
  User,
} from '~shared/types'

interface WireTweet extends Omit<Tweet, 'iBookmarked' | 'retweetedStatus' | 'quotedStatus' | 'conversation'> {
  ibookmarked?: boolean
  retweetedStatus?: WireTweet
  quotedStatus?: WireTweet
  conversation?: WireTweet[]
}

export function mapTweet(wire: WireTweet | undefined): Tweet | undefined {
  if (!wire) return undefined
  const { ibookmarked, retweetedStatus, quotedStatus, conversation, ...rest } = wire
  return {
    ...rest,
    iBookmarked: ibookmarked ?? false,
    retweetedStatus: mapTweet(retweetedStatus),
    quotedStatus: mapTweet(quotedStatus),
    conversation: conversation?.map(t => mapTweet(t)!).filter(Boolean),
  }
}

export function mapTweets(wires: WireTweet[] | undefined): Tweet[] {
  if (!wires?.length) return []
  return wires.map(t => mapTweet(t)!).filter(Boolean)
}

export function mapTweetResponse(
  wire: Omit<SotweResponse<WireTweet, User>, 'data'> & { data?: WireTweet[] },
): SotweResponse<Tweet, User> {
  return {
    ...wire,
    data: mapTweets(wire.data),
    whoToFollow: wire.whoToFollow,
  }
}

export function mapUserResponse<TInfo = User>(
  wire: Omit<SotweResponse<User, TInfo>, 'data'> & { data?: User[] },
): SotweResponse<User, TInfo> {
  return {
    ...wire,
    data: wire.data ?? [],
  }
}
