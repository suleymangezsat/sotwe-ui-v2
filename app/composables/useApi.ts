/*
 * Typed endpoint wrappers for the sotwebe backend.
 *
 * Callers should use useApi(), not useApiClient() directly — this composable
 * returns an object keyed by resource (tweet, user, search, trend, tag,
 * location, auth, me) so each call site picks up the return type without
 * repeating the URL.
 *
 * SSR data fetching uses this via useAsyncData in pages:
 *
 *   const { data } = await useAsyncData('user-'+screenName, () =>
 *     useApi().user.get(screenName, { after })
 *   )
 *
 * Endpoints here mirror sotwe-ui/store/... action URLs 1-1, so Pinia stores
 * in Faz 3 can call `useApi().user.get(...)` instead of assembling $fetch
 * calls themselves.
 */

import type {
  AuthTokens,
  BookmarkedContentResponse,
  CancelSubscriptionPayload,
  ChangePasswordPayload,
  Location as SotwePlace,
  LoginPayload,
  NearbyUser,
  PaymentResponse,
  PaymentSource,
  RefreshTokenPayload,
  ReportPayload,
  ResetPasswordPayload,
  SignupPayload,
  SocialLoginPayload,
  SotweResponse,
  SubscriptionPlan,
  Trend,
  Tweet,
  UnlinkSocialAccountPayload,
  UpdateProfilePayload,
  User,
  UserProfile,
  UserSubscription,
  Visit,
  Woeid,
  SearchTermType,
} from '~shared/types'
import { mapTweet, mapTweetResponse, mapUserResponse } from '~/utils/mappers'

interface Cursor {
  after?: string
}

export function useApi() {
  const client = useApiClient()

  return {
    tweet: {
      get: async (id: string): Promise<Tweet | undefined> => {
        const wire = await client<Tweet>(`/v3/tweet/${encodeURIComponent(id)}`)
        return mapTweet(wire)
      },
      comments: async (id: string): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          `/v3/tweet/${encodeURIComponent(id)}/comments`,
        )
        return mapTweetResponse(wire)
      },
    },

    user: {
      get: async (
        screenName: string,
        params?: Cursor & { page?: number },
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          `/v3/user/${encodeURIComponent(screenName)}`,
          { query: params },
        )
        const mapped = mapTweetResponse(wire)
        // The page-owner's own tweets come back without a top-level `user`
        // (it's implicit via `response.info`). v1's mapper patched each
        // tweet so the UI can always read `tweet.user.screenName` / avatar.
        if (mapped.info) {
          for (const t of mapped.data) {
            if (!t.user) t.user = mapped.info
          }
        }
        return mapped
      },
      popular: async (params?: {
        country?: string
        category?: string
        size?: number
        after?: string
      }): Promise<SotweResponse<User, User>> => {
        const wire = await client<SotweResponse<User, User>>('/v3/user/popular', {
          query: params,
        })
        return mapUserResponse(wire)
      },
      lastViewed: (limit = 20) =>
        client<Visit<User>[]>('/v3/user/lastViewed', { query: { limit } }),
    },

    search: {
      tweet: async (
        q: string,
        params?: Cursor,
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>('/v3/search/tweet', {
          query: { q, ...params },
        })
        return mapTweetResponse(wire)
      },
      user: async (q: string): Promise<SotweResponse<User, User>> => {
        const wire = await client<SotweResponse<User, User>>('/v3/search/user', {
          query: { q },
        })
        return mapUserResponse(wire)
      },
      lastViewed: (limit = 20) =>
        client<Visit<{ type: SearchTermType, term: string }>[]>(
          '/v3/search/lastViewed',
          { query: { limit } },
        ),
    },

    trend: {
      woeids: () => client<Woeid[]>('/v3/trend/woeids'),
      topicsByLocation: (params: {
        country: string
        city?: string
        datetime?: string
        ago?: number
      }) =>
        client<SotweResponse<Trend, User>>('/v3/trend/topics/location', {
          query: params,
        }),
      topicsByCode: (code: string) =>
        client<SotweResponse<Trend, User>>(
          `/v3/trend/topics/code/${encodeURIComponent(code)}`,
        ),
      tweetsByLocation: async (
        params: { country: string, city?: string } & Cursor,
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          '/v3/trend/tweets/location',
          { query: params },
        )
        return mapTweetResponse(wire)
      },
      tweetsByCode: async (
        code: string,
        params?: Cursor,
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          `/v3/trend/tweets/code/${encodeURIComponent(code)}`,
          { query: params },
        )
        return mapTweetResponse(wire)
      },
    },

    tag: {
      get: async (
        tagname: string,
        params?: Cursor,
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          `/v3/tag/${encodeURIComponent(tagname)}`,
          { query: params },
        )
        return mapTweetResponse(wire)
      },
      lastViewed: (limit = 20) =>
        client<Visit<string>[]>('/v3/tag/lastViewed', { query: { limit } }),
    },

    location: {
      get: async (
        placeId: string,
        params?: Cursor,
      ): Promise<SotweResponse<Tweet, User>> => {
        const wire = await client<SotweResponse<Tweet, User>>(
          `/v3/location/${encodeURIComponent(placeId)}`,
          { query: params },
        )
        return mapTweetResponse(wire)
      },
      nearby: (params: { country: string, random?: number }) =>
        client<NearbyUser[]>('/v3/location/nearby', { query: params }),
      lastViewed: (limit = 20) =>
        client<Visit<SotwePlace>[]>('/v3/location/lastViewed', {
          query: { limit },
        }),
    },

    auth: {
      login: (body: LoginPayload) =>
        client<AuthTokens>('/v3/auth/login', { method: 'POST', body }),
      signup: (body: SignupPayload) =>
        client<AuthTokens>('/v3/auth/signup', { method: 'POST', body }),
      refresh: (body: RefreshTokenPayload) =>
        client<AuthTokens>('/v3/auth/refreshToken', { method: 'POST', body }),
      google: (body: SocialLoginPayload) =>
        client<AuthTokens>('/v3/auth/google/token', { method: 'POST', body }),
      forgotInit: (body: ResetPasswordPayload) =>
        client<void>('/v3/auth/forgot/init', { method: 'POST', body }),
      forgotVerify: (body: ResetPasswordPayload) =>
        client<void>('/v3/auth/forgot/verify', { method: 'POST', body }),
      forgotConfirm: (body: ResetPasswordPayload) =>
        client<void>('/v3/auth/forgot/confirm', { method: 'POST', body }),
    },

    me: {
      profile: () => client<UserProfile>('/me/profile'),
      deleteAccount: () => client<void>('/me/profile', { method: 'DELETE' }),
      updateProfile: (body: UpdateProfilePayload) =>
        client<void>('/me/profile/update', { method: 'PUT', body }),
      changePassword: (body: ChangePasswordPayload) =>
        client<void>('/me/profile/changePassword', { method: 'PUT', body }),
      uploadPicture: (form: FormData) =>
        client<void>('/me/profile/picture', { method: 'POST', body: form }),
      unlinkSocial: (body: UnlinkSocialAccountPayload) =>
        client<void>('/me/profile/unlink', { method: 'DELETE', body }),

      bookmark: (tweetId: string) =>
        client<void>(`/me/bookmark/${encodeURIComponent(tweetId)}`, {
          method: 'POST',
        }),
      unbookmark: (tweetId: string) =>
        client<void>(`/me/bookmark/${encodeURIComponent(tweetId)}`, {
          method: 'DELETE',
        }),
      bookmarks: async (page = 0): Promise<BookmarkedContentResponse> => {
        const wire = await client<BookmarkedContentResponse>(
          '/me/bookmark/content',
          { query: { page } },
        )
        return { ...wire, data: wire.data ? wire.data.map(t => mapTweet(t)!) : [] }
      },

      subscription: () => client<UserSubscription>('/me/subscription'),
      cancelSubscription: (body: CancelSubscriptionPayload) =>
        client<void>('/me/subscription', { method: 'DELETE', body }),

      /**
       * Mint a payment session for a given subscription plan + processor.
       * Returns `{ id, sessionId, createdAt }` — the `sessionId` is what
       * we hand to Stripe's `redirectToCheckout` (or to Sellix's invoice
       * URL) to start the checkout. Auth-required.
       */
      createPaymentSession: (source: PaymentSource, subscriptionId: string) =>
        client<PaymentResponse>(
          `/me/subscription/payment/${source}/${encodeURIComponent(subscriptionId)}`,
          { method: 'POST' },
        ),
      /**
       * After Stripe redirects the visitor back to /pricing/:source/success
       * we hit this with the `sessionId` query param so the backend can
       * confirm the charge cleared, attach the new subscription to the
       * user, and return the fresh `UserSubscription` for the UI to show.
       */
      verifyPayment: (source: PaymentSource, sessionId: string) =>
        client<UserSubscription>(
          `/me/subscription/payment/${source}/verify`,
          { method: 'POST', query: { sessionId } },
        ),
      /**
       * Fallback path used when the success redirect drops the
       * `?session_id=…` query (Stripe sometimes loses it across mobile
       * Safari intent handoffs). Verifies the most recent in-flight
       * payment for the authed user.
       */
      verifyLastPayment: (source: PaymentSource) =>
        client<UserSubscription>(
          `/me/subscription/payment/${source}/verify_last`,
          { method: 'POST' },
        ),
    },

    subscriptions: {
      list: () => client<SubscriptionPlan[]>('/v2/subscriptions'),
    },

    report: {
      submit: (body: ReportPayload) =>
        client<void>('/v1/report', { method: 'POST', body }),
    },
  }
}
