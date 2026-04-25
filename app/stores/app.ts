/*
 * Root app store — replaces the root `state` / `mutations` / `nuxtServerInit`
 * in sotwe-ui/store/index.js. Holds: visitor country (from Cloudflare),
 * ad-rotation weights, current active ad provider, locale.
 *
 * `initFromRequest()` is called from a server-only plugin (see Faz 7 for
 * app/plugins/01.server-init.server.ts) once per request, so the country /
 * ad choice is deterministic for SSR.
 */

export const adWeights = {
  adsterra: 0,
  propellerads: 0,
  evadav: 0,
  admaven: 50,
  adcash: 0,
  monetag: 50,
  popads: 0,
} as const

export type AdProvider = keyof typeof adWeights

export const useAppStore = defineStore('app', () => {
  const country = ref<string | undefined>(undefined)
  const locale = ref<string | undefined>(undefined)
  const activeAd = ref<AdProvider>('admaven')

  function setCountry(v: string | undefined) { country.value = v }
  function setLocale(v: string) { locale.value = v }
  function setActiveAd(v: AdProvider) { activeAd.value = v }

  return { country, locale, activeAd, setCountry, setLocale, setActiveAd }
})
