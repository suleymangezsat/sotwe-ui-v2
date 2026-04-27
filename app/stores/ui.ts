/*
 * Global UI state — modal/dialog visibility + props, search mode toggle,
 * side-menu expanded state. Mirrors sotwe-ui/store/ui/state.js 1-1.
 *
 * Every modal is a `DialogSlot<Props>`: components read `.display` to decide
 * whether to render and `.props` to pass payload. Call `.open(props)` to
 * show, `.close()` to hide.
 */

interface DialogSlot<Props = Record<string, unknown>> {
  display: boolean
  props: Props
}

function slot<P = Record<string, unknown>>(): DialogSlot<P> {
  return { display: false, props: {} as P }
}

export const useUiStore = defineStore('ui', () => {
  const searchMode = ref(false)
  const searchTerm = ref<string | undefined>(undefined)
  const displayMenu = ref(false)
  const displayCampaignModal = ref(false)
  const displayNearbyDialog = ref(false)

  const loginDialog = ref(slot<{ redirect?: string }>())
  const signupDialog = ref(slot())
  const forgotPasswordDialog = ref(slot())
  const genericErrorDialog = ref(slot<{ title?: string, message?: string }>())
  const mediaModal = ref(slot<{ tweetId?: string, index?: number }>())
  const shareModal = ref(slot<{ url?: string, title?: string }>())
  const reportDialog = ref(slot<{ type?: string, name?: string }>())
  const locationPermissionDialog = ref(slot())

  return {
    searchMode,
    searchTerm,
    displayMenu,
    displayCampaignModal,
    displayNearbyDialog,
    loginDialog,
    signupDialog,
    forgotPasswordDialog,
    genericErrorDialog,
    mediaModal,
    shareModal,
    reportDialog,
    locationPermissionDialog,
  }
})
