/*
 * Nearby-users list (/nearby page). Not paginated on the backend; a single
 * random sample per country.
 */

import type { NearbyUser } from '~shared/types'

export const useNearbyStore = defineStore('location/nearby', () => {
  const data = ref<NearbyUser[]>([])
  const loading = ref(false)
  const error = ref<number | undefined>(undefined)

  async function fetch(country: string, random = 20) {
    loading.value = true
    error.value = undefined
    try {
      data.value = await useApi().location.nearby({ country, random })
    }
    catch (e) {
      error.value = (e as { status?: number }).status ?? 503
    }
    finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
})
