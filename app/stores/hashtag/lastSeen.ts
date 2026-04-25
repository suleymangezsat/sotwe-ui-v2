/*
 * Last-seen hashtags (right rail on hashtag page, home). /v3/tag/lastViewed
 * returns a flat `Visit<string>[]` grouped by country.
 */

import type { Visit } from '~shared/types'

export const useHashtagLastSeenStore = defineStore('hashtag/lastSeen', () => {
  const data = ref<Visit<string>[]>([])
  const loading = ref(false)
  const error = ref<number | undefined>(undefined)

  async function fetch(limit = 20) {
    loading.value = true
    error.value = undefined
    try {
      data.value = await useApi().tag.lastViewed(limit)
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
