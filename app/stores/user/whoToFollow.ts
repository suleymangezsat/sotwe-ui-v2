/*
 * Who-to-follow — populated as a side effect of `/v3/user/<screenName>`
 * (the endpoint returns `whoToFollow: User[]` on the root response), not
 * a separate call. This store is purely a cache so the right rail can read
 * it without reaching into user/timeline internals.
 */

import type { User } from '~shared/types'

export const useWhoToFollowStore = defineStore('user/whoToFollow', () => {
  const byKey = ref<Record<string, User[]>>({})

  function set(key: string, users: User[] | undefined) {
    byKey.value[key.toLowerCase()] = users ?? []
  }

  function get(key: string): User[] {
    return byKey.value[key.toLowerCase()] ?? []
  }

  return { byKey, set, get }
})
