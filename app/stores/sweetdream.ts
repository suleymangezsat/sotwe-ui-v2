/*
 * SweetDreamChat widget UI state — whether the FAB is expanded, the open
 * conversation, queued messages, etc. The chat's 2,879-line port in Faz 6
 * will reach in to set/read these fields. Client-only (`<ClientOnly>`).
 */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  createdAt: number
}

export const useSweetdreamStore = defineStore('sweetdream', () => {
  const enabled = computed(() => {
    const cfg = useRuntimeConfig()
    return cfg.public.sweetdreamEnabled
  })
  const open = ref(false)
  const conversationId = ref<string | undefined>(undefined)
  const messages = ref<ChatMessage[]>([])
  const sending = ref(false)

  function toggle() { open.value = !open.value }
  function reset() {
    conversationId.value = undefined
    messages.value = []
    sending.value = false
  }

  return { enabled, open, conversationId, messages, sending, toggle, reset }
})
