/*
 * Domain types — UI-facing shape of backend entities.
 *
 * These mirror the OpenAPI schemas in shared/openapi/sotwebe.json but
 * differ in three deliberate ways:
 *   1. `data` in Response<T> is generic here — the OpenAPI Java generic is
 *      erased and always reads `data: Tweet[]`, which is wrong for
 *      endpoints that return User[] / Trend[] / Woeid[].
 *   2. Optional fields on live responses (location, url, description, etc.)
 *      are marked `?` based on observed responses, not the spec.
 *   3. A few fields (`ibookmarked`) are renamed (`iBookmarked`) via mappers
 *      so components don't have to know the wire quirks. The raw shape lives
 *      here; mappers in app/utils/api.ts produce the domain shape.
 *
 * Keep the wire shape faithful — if you find a field that lives on the
 * live response but is absent here, add it. Prefer adding over renaming.
 */

import type {
  ErrorCode,
  Gender,
  MediaType,
  ReportReason,
  ReportType,
  SearchTermType,
  SocialSource,
  SubscriptionTerm,
  WoeidType,
} from './enums'

// ---------------------------------------------------------------------------
// Entities inside a Tweet's `text`
// ---------------------------------------------------------------------------

export interface UrlEntity {
  text: string
  url: string
  expandedURL: string
  displayURL: string
  start: number
  end: number
}

export interface HashtagEntity {
  text: string
  start: number
  end: number
}

export interface UserMentionEntity {
  text: string
  name: string
  screenName: string
  id: string
  start: number
  end: number
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface ImageSizes {
  width: number
  height: number
}

export interface VideoVariant {
  type: string
  bitrate?: number
  url: string
}

export interface VideoInfo {
  ratio?: number[]
  duration?: number
  variants?: VideoVariant[]
}

export interface MediaEntity {
  id: string
  url: string
  mediaURL: string
  expandedURL: string
  displayURL: string
  type: MediaType | string
  text: string
  videoInfo?: VideoInfo
  imageSize?: ImageSizes
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserSummary {
  name: string
  screenName: string
  profileImageMedium?: string
  profileImageOriginal?: string
  verified?: boolean
}

export interface User extends UserSummary {
  id: string
  location?: string
  description?: string
  urlEntity?: UrlEntity
  url?: string
  createdAt: number
  followingCount: number
  followerCount: number
  favouritesCount: number
  postCount: number
  listedCount: number
  profileImageThumbnail?: string
  profileBannerOriginal?: string
  profileBannerMobileURL?: string
  geoEnabled: boolean
  userProtected: boolean
  possiblySensitive: boolean
  profileInterstitialType?: string
  country?: string
  category?: string[]
  userMentionEntities?: UserMentionEntity[]
  tagEntities?: HashtagEntity[]
}

// ---------------------------------------------------------------------------
// Tweets
// ---------------------------------------------------------------------------

export interface Tweet {
  id: string
  createdAt: number
  text: string
  source?: string
  lang?: string
  urlEntities?: UrlEntity[]
  userMentionEntities?: UserMentionEntity[]
  tagEntities?: HashtagEntity[]
  user?: User
  location?: Location
  favoriteCount: number
  retweetCount: number
  quoteCount: number
  replyCount: number
  bookmarkCount: number
  viewCount: number
  pinned: boolean
  possiblySensitive: boolean
  truncated: boolean
  retweetedStatus?: Tweet
  quotedStatus?: Tweet
  conversation?: Tweet[]
  mediaEntities?: MediaEntity[]
  inReplyToStatusId?: string
  inReplyToUserId?: string
  /** Wire name is `ibookmarked` (lowercase b). Mapper renames to this. */
  iBookmarked?: boolean
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export interface Location {
  id: string
  name: string
  countryCode: string
  country: string
  placeType: string
  url?: string
  fullName: string
  lat: number
  lng: number
}

export interface Woeid {
  name: string
  fullname: string
  type: WoeidType | string
  country?: string
  countryCode?: string
  woeid: number
  parentId: number
  trendPlaceId: string
  placeId: string
  cities?: Woeid[]
}

// /v3/location/nearby response element (flat, not nested in UserSummary).
export interface NearbyUser {
  userId: string
  username: string
  fullname: string
  profilePic: string
  verified: boolean
  userProtected: boolean
  lastSeen: number
  place?: string
  distance: number
}

// ---------------------------------------------------------------------------
// Trends, search, visits
// ---------------------------------------------------------------------------

export interface Trend {
  name: string
  tweetVolume?: number
}

export interface SearchTerm {
  type: SearchTermType
  term: string
}

/**
 * lastViewed endpoints (/v3/user/lastViewed, /v3/tag/lastViewed, ...)
 * return arrays of these, grouped by country.
 */
export interface Visit<T> {
  country: string
  data: T
}

// ---------------------------------------------------------------------------
// Generic response wrapper — the actual shape returned by `Response<T, R>`
// endpoints on sotwebe. Note `data` is typed generically here; OpenAPI
// erases this to Tweet[].
// ---------------------------------------------------------------------------

export interface SotweResponse<TData, TInfo = never> {
  key?: string
  data: TData[]
  /** Cursor for next page (tweet id, user id, etc). Absent on last page. */
  after?: string
  info?: TInfo
  sensitive?: boolean
  cached?: boolean
  whoToFollow?: User[]
  dataSource?: string
}

// /me/bookmark/content uses integer paging instead of a string cursor.
export interface BookmarkedContentResponse {
  data: Tweet[]
  /** Next page number, absent on last page. */
  after?: number
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginPayload {
  email: string
  password: string
  captcha?: string
}

export interface SocialLoginPayload {
  /** Google OAuth authorization code or id_token, per deployment. */
  code: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface SignupPayload {
  username: string
  email: string
  password: string
  captcha?: string
  step: number
  name?: string
  gender?: Gender
  /** ISO date (YYYY-MM-DD). */
  birthDate?: string
  otpCode?: string
}

export interface ResetPasswordPayload {
  email: string
  password?: string
  otp?: string
  captcha?: string
}

// ---------------------------------------------------------------------------
// Authenticated user / subscription
// ---------------------------------------------------------------------------

export interface UserSubscription {
  id: string
  name: string
  description?: string
  priority: number
  features: string[]
  renewal: SubscriptionTerm
  startDate: string
  endDate: string
}

export interface UserProfile {
  userId: string
  username: string
  email: string
  name: string
  profilePic?: string
  gender?: Gender
  /** ISO date. */
  birthDate?: string
  linkedAccounts?: Partial<Record<SocialSource, string>>
  createdAt: string
  updatedAt: string
  subscription?: UserSubscription
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  features: string[]
  priority: number
  price: number
  currency: string
  duration: number
  subscriptionTerm: SubscriptionTerm
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface UpdateProfilePayload {
  name?: string
  gender?: Gender
  birthDate?: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface UnlinkSocialAccountPayload {
  socialId: string
  source: SocialSource
}

export interface CancelSubscriptionPayload {
  reason?: string
  feedback?: string
}

/**
 * Payment processor identifier — picked in the SPaymentMethodDialog and
 * passed as a path segment (`/me/subscription/payment/{source}/...`) to the
 * backend so it knows which provider's session to mint / verify.
 */
export type PaymentSource = 'stripe' | 'sellix'

/**
 * Backend response when minting a payment session. The `sessionId` is what
 * we hand to `stripe.redirectToCheckout()` (or to Sellix's invoice URL) to
 * actually start the checkout. `id` is our internal payment record id —
 * useful for support / log correlation, not used in the UI flow.
 */
export interface PaymentResponse {
  id: string
  sessionId: string
  createdAt: string
}

export interface ReportPayload {
  type: ReportType
  name: string
  reason: ReportReason
  message?: string
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export interface BackendErrorBody {
  message: string
  code: ErrorCode
  statusCode: number
}

/** Thrown/rejected shape. See app/utils/api.ts. */
export interface SotweApiError extends Error {
  status: number
  code: ErrorCode
  cause?: unknown
}
