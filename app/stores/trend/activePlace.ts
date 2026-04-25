/*
 * Currently selected country / city in the Trends filter. Plain state —
 * no persistence, no network.
 */

import type { Woeid } from '~shared/types'

export const useActivePlaceStore = defineStore('trend/activePlace', () => {
  const place = ref<Woeid | undefined>(undefined)

  function set(w: Woeid | undefined) { place.value = w }
  function clear() { place.value = undefined }

  return { place, set, clear }
})
