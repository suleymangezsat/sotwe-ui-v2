/*
 * DM dialog state — which user we're messaging, the compose text, send
 * status. The backend DM endpoint isn't public yet (sotwe-auth territory),
 * so this is mostly UI state until the API is wired.
 */

export const useUserMessageStore = defineStore('user/message', () => {
  const recipientScreenName = ref<string | undefined>(undefined)
  const recipientName = ref<string | undefined>(undefined)
  const body = ref('')
  const sending = ref(false)
  const error = ref<string | undefined>(undefined)

  function open(screenName: string, name?: string) {
    recipientScreenName.value = screenName
    recipientName.value = name
    body.value = ''
    error.value = undefined
  }

  function close() {
    recipientScreenName.value = undefined
    recipientName.value = undefined
    body.value = ''
  }

  return { recipientScreenName, recipientName, body, sending, error, open, close }
})
