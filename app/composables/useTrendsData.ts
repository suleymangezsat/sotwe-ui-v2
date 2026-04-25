/*
 * Shared trends fetcher — used by `/` (home) and `/trends/:country/:city?`
 * to pull topic list + popular tweets for a place in one SSR cycle.
 *
 * Matches the v1 behaviour where `pages/index.vue` nested a child
 * `pages/trends.vue` via `<nuxt-child>` for both `/` and `/trends/...`.
 *
 * Datetime filter contract (matches v1 URL scheme):
 *   - `?date=YYYYMMDD-HH`  → historical topics (explicit day + hour)
 *   - `?ago=0..23`          → hours ago (today only)
 *   - neither               → "now" (today, current hour)
 *   Accepted by `/v3/trend/topics/location` as `datetime=yyyyMMdd-HH` or `ago`.
 *
 * Backend endpoint quirks (empirical, tested against 161.35.240.135):
 *   - `/v3/trend/{topics,tweets}/code/{code}` accepts the 2-letter ISO
 *     country code (e.g. `tr`). No city, no datetime. 404s on `worldwide`.
 *   - `/v3/trend/{topics,tweets}/location?country=X` accepts the country
 *     *name* (e.g. `turkey`, `worldwide`) + optional `city` + optional
 *     `datetime` / `ago`. 404s on ISO codes like `tr`.
 *   - So to hit the location endpoint with an ISO code input, we first
 *     translate `tr → turkey` via `/v3/trend/woeids`.
 */

import type { Tweet, Trend, Woeid } from '~shared/types'

export interface TrendsDateParams {
  date?: string
  ago?: number
}

export interface TrendsPayload {
  topics: Trend[]
  tweets: Tweet[]
  country: string
  city?: string
  /** Cursor for loading more popular tweets (undefined when exhausted). */
  after?: string
}

export function placeDisplayName(country: string, city?: string): string {
  if (!country || country === 'worldwide') return 'Worldwide'
  const c = country.charAt(0).toUpperCase() + country.slice(1)
  if (!city) return c
  const cap = city.charAt(0).toUpperCase() + city.slice(1)
  return `${cap}, ${c}`
}

async function resolveCountryName(
  input: string,
  fetchWoeids: () => Promise<Woeid[]>,
): Promise<string> {
  // Already a name (worldwide, turkey, united states, ...)
  if (!/^[a-z]{2}$/i.test(input)) return input
  try {
    const woeids = await fetchWoeids()
    const hit = woeids.find(w => w.countryCode?.toLowerCase() === input.toLowerCase())
    return hit?.fullname?.toLowerCase() || input
  }
  catch {
    return input
  }
}

export async function useTrendsData(
  country: MaybeRefOrGetter<string>,
  city: MaybeRefOrGetter<string | undefined> = () => undefined,
  date: MaybeRefOrGetter<TrendsDateParams | undefined> = () => undefined,
) {
  const countryRef = computed(() => String(toValue(country) || '').toLowerCase())
  const cityRef = computed(() => {
    const v = toValue(city)
    return v ? String(v).toLowerCase() : undefined
  })
  const dateRef = computed(() => toValue(date))

  return useAsyncData<TrendsPayload>(
    () => `trends-${countryRef.value}-${cityRef.value ?? ''}-${dateRef.value?.date ?? ''}-${dateRef.value?.ago ?? ''}`,
    async () => {
      const api = useApi()
      const rawCountry = countryRef.value || 'worldwide'
      const city = cityRef.value
      const d = dateRef.value
      const hasDate = !!d?.date || d?.ago !== undefined
      const isIsoCode = /^[a-z]{2}$/i.test(rawCountry)

      // `code/{code}` endpoints are simplest; use them when we have a bare
      // 2-letter ISO and no city / datetime filter.
      if (isIsoCode && !city && !hasDate) {
        const [topicsRes, tweetsRes] = await Promise.all([
          api.trend.topicsByCode(rawCountry).catch(() => null),
          api.trend.tweetsByCode(rawCountry).catch(() => null),
        ])
        return {
          country: rawCountry,
          city,
          topics: topicsRes?.data ?? [],
          tweets: tweetsRes?.data ?? [],
          after: tweetsRes?.after,
        }
      }

      // Otherwise go through the location endpoint, which needs the
      // country *name*. Translate ISO codes via woeids.
      const countryName = isIsoCode
        ? await resolveCountryName(rawCountry, () => api.trend.woeids())
        : rawCountry

      const [topicsRes, tweetsRes] = await Promise.all([
        api.trend.topicsByLocation({ country: countryName, city, datetime: d?.date, ago: d?.ago }).catch(() => null),
        api.trend.tweetsByLocation({ country: countryName, city }).catch(() => null),
      ])
      return {
        country: countryName,
        city,
        topics: topicsRes?.data ?? [],
        tweets: tweetsRes?.data ?? [],
        after: tweetsRes?.after,
      }
    },
    { default: (): TrendsPayload => ({ topics: [], tweets: [], country: '', city: undefined }) },
  )
}
