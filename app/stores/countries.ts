/*
 * Static country list — hydrated from /v3/trend/woeids on server init, then
 * frozen for the session. Supplies the Trends / Nearby place pickers.
 */

import type { Woeid } from '~shared/types'

export const useCountriesStore = defineStore('countries', () => {
  const data = ref<Woeid[]>([])
  const loading = ref(false)
  const error = ref<number | undefined>(undefined)

  async function fetchOnce() {
    if (data.value.length || loading.value) return
    loading.value = true
    error.value = undefined
    try {
      data.value = await useApi().trend.woeids()
    }
    catch (e) {
      error.value = (e as { status?: number }).status ?? 503
    }
    finally {
      loading.value = false
    }
  }

  const byCountryCode = computed(() => {
    const map: Record<string, Woeid> = {}
    for (const w of data.value) {
      if (w.countryCode) map[w.countryCode.toUpperCase()] = w
    }
    return map
  })

  return { data, loading, error, fetchOnce, byCountryCode }
})
