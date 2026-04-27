/*
 * Domain enums — mirror sotwebe's Java enums and a few UI-only constants
 * that were hardcoded strings in sotwe-ui/js/constants/*.js.
 *
 * Backend source of truth:
 *   sotwebe/applications/api/.../ErrorCodes.java
 *   sotwebe/applications/api/.../model/*.java
 */

// --- Backend enums (from OpenAPI) -----------------------------------------

export const ErrorCode = {
  UNSPECIFIED: 'UNSPECIFIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  NO_CONNECTION: 'NO_CONNECTION',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  INSUFFICIENT_SUBSCRIPTION: 'INSUFFICIENT_SUBSCRIPTION',
  CANNOT_SEND_EMAIL: 'CANNOT_SEND_EMAIL',
  TOO_MANY_OTP_REQUESTS: 'TOO_MANY_OTP_REQUESTS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  INVALID_USERNAME: 'INVALID_USERNAME',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_OLD_PASSWORD: 'INVALID_OLD_PASSWORD',
  SUSPENDED_USER: 'SUSPENDED_USER',
  NOT_FOUND: 'NOT_FOUND',
  TWREQ_ERROR: 'TWREQ_ERROR',
  IO_ERROR: 'IO_ERROR',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  IMAGE_UPLOAD_ERROR: 'IMAGE_UPLOAD_ERROR',
  FILE_SIZE_ERROR: 'FILE_SIZE_ERROR',
  BAD_CREDENTIALS: 'BAD_CREDENTIALS',
  UNEXPECTED: 'UNEXPECTED',
  INVALID_STEP: 'INVALID_STEP',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  USERNAME_EXISTS: 'USERNAME_EXISTS',
  INVALID_OTP: 'INVALID_OTP',
  INVALID_CAPTCHA: 'INVALID_CAPTCHA',
  SOCIAL_LOGIN_FAILED: 'SOCIAL_LOGIN_FAILED',
  SOCIAL_LOGIN_FOR_REMOVED_USER: 'SOCIAL_LOGIN_FOR_REMOVED_USER',
  BOOKMARK_NOT_FOUND: 'BOOKMARK_NOT_FOUND',
  BOOKMARK_SIZE_EXCEEDED: 'BOOKMARK_SIZE_EXCEEDED',
} as const
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  UNSPECIFIED: 'UNSPECIFIED',
} as const
export type Gender = (typeof Gender)[keyof typeof Gender]

export const SubscriptionTerm = {
  ONE_TIME: 'ONE_TIME',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const
export type SubscriptionTerm = (typeof SubscriptionTerm)[keyof typeof SubscriptionTerm]

/**
 * Reasons offered in the cancel-renewal dialog. Backend stores them as a
 * raw string; we use a const map so the picker stays typed and the
 * dropdown can render labels from a single source.
 */
export const CancelReason = {
  HIGH_COST: 'HIGH_COST',
  FEATURE_BROKEN: 'FEATURE_BROKEN',
  NOT_USING_ENOUGH: 'NOT_USING_ENOUGH',
  CHANGE_IN_NEEDS: 'CHANGE_IN_NEEDS',
  LACK_OF_FEATURE: 'LACK_OF_FEATURE',
  OTHER: 'OTHER',
} as const
export type CancelReason = (typeof CancelReason)[keyof typeof CancelReason]

export const ReportType = {
  USER: 'USER',
  TAG: 'TAG',
  LOCATION: 'LOCATION',
  TWEET: 'TWEET',
  SEARCH: 'SEARCH',
} as const
export type ReportType = (typeof ReportType)[keyof typeof ReportType]

export const ReportReason = {
  CHILD_ABUSE: 'CHILD_ABUSE',
  RACISM: 'RACISM',
  TERROR: 'TERROR',
  VIOLENCE: 'VIOLENCE',
  OTHER: 'OTHER',
} as const
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason]

export const SocialSource = {
  GOOGLE: 'GOOGLE',
} as const
export type SocialSource = (typeof SocialSource)[keyof typeof SocialSource]

// SearchTerm (returned by /v3/search/lastViewed). Mirrors backend enum.
export const SearchTermType = {
  USER: 'USER',
  LOCATION: 'LOCATION',
  TWEET: 'TWEET',
} as const
export type SearchTermType = (typeof SearchTermType)[keyof typeof SearchTermType]

// --- UI-only enums (lifted from sotwe-ui/js/constants/*) ------------------

// Hashtag/keyword/user search navigation. Not a backend contract — the UI
// decides which endpoint to call based on the leading character.
export const SearchKind = {
  HASHTAG: 'HASHTAG',
  USER: 'USER',
  KEYWORD: 'KEYWORD',
} as const
export type SearchKind = (typeof SearchKind)[keyof typeof SearchKind]

// MediaEntity.type values observed in real responses + the Java enum.
export const MediaType = {
  PHOTO: 'photo',
  VIDEO: 'video',
  ANIMATED_GIF: 'animated_gif',
} as const
export type MediaType = (typeof MediaType)[keyof typeof MediaType]

// Woeid.type values observed in /v3/trend/woeids.
export const WoeidType = {
  SUPERNAME: 'SUPERNAME',
  COUNTRY: 'COUNTRY',
  CITY: 'CITY',
} as const
export type WoeidType = (typeof WoeidType)[keyof typeof WoeidType]

// Which UX pages should never show ads. From sotwe-ui/js/constants/NoAdsPages.js.
export const NoAdsPages = [
  'auth-login',
  'auth-signup',
  'auth-callback',
  'login',
  'logout',
  'pricing',
  'pricing-success',
  'pricing-fail',
] as const
export type NoAdsPage = (typeof NoAdsPages)[number]
