/*
 * Last-seen users across the world — the footer widget on the home page.
 * Data comes from /v3/user/lastViewed, a flat array of {country, data}.
 */

import type { User, Visit } from '~shared/types'

export const useUserLastSeenStore = defineStore('user/lastSeen', () => {
  const data = ref<Visit<User>[]>([])
  const loading = ref(false)
  const error = ref<number | undefined>(undefined)

  async function fetch(limit = 20) {
    loading.value = true
    error.value = undefined
    try {
      data.value = await useApi().user.lastViewed(limit)
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
