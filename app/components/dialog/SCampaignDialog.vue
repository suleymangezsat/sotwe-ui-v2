<script setup lang="ts">
/*
 * Account-verification helper — port of v1 `components/common/CampaignModal
 * .vue`. Shown when the visitor opens "Account ownership" from a profile
 * menu and the profile is theirs (or claimed to be). Sotwe doesn't verify
 * ownership over an OAuth handshake — instead it asks the user to email
 * the team a link to a tweet they own from that handle. This dialog
 * surfaces the deeplink they should send.
 *
 * The dialog is informational — there's no API call. Single OK button
 * dismisses it.
 */

const ui = useUiStore()
const config = useRuntimeConfig()
const toast = useToast()

const open = computed({
  get: () => ui.displayCampaignModal,
  set: v => (ui.displayCampaignModal = v),
})

// The campaign modal in v1 reads the screen name from the route. We do the
// same — the dialog only makes sense on a profile page.
const route = useRoute()
const screenName = computed(() => {
  const u = (route.params.username || route.params.screenName) as string | undefined
  return u || ''
})

const profileLink = computed(() => {
  const base = (config.public.siteUrl || '').replace(/\/+$/, '')
  return screenName.value ? `${base}/${screenName.value}` : ''
})

async function copy() {
  try {
    await navigator.clipboard.writeText(profileLink.value)
    toast.add({ title: 'Link copied', icon: 'i-lucide-link' })
  }
  catch {
    toast.add({ title: 'Copy failed', color: 'error' })
  }
}
</script>

<template>
  <SDialog v-model="open" title="Verify your account">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        If <span class="font-semibold">@{{ screenName }}</span> is yours,
        you can take ownership of this profile on Sotwe. Email us with
        the link below — sent from the email tied to your X account — and
        we'll wire your dashboard to this profile.
      </p>

      <div class="flex items-stretch gap-2 rounded-lg border border-twitter-slate-100 bg-twitter-slate-50 p-1 text-sm dark:border-twitter-slate-700 dark:bg-twitter-slate-900">
        <span class="min-w-0 flex-1 truncate px-2 py-2 font-mono text-xs text-twitter-slate-700 dark:text-twitter-slate-300">
          {{ profileLink }}
        </span>
        <SButton size="sm" icon="i-lucide-copy" @click="copy">Copy</SButton>
      </div>

      <p class="text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
        Send to <a href="mailto:contact@sotwe.com" class="text-twitter-blue-500 hover:underline">contact@sotwe.com</a>.
      </p>

      <div class="flex justify-end">
        <SButton @click="open = false">Got it</SButton>
      </div>
    </div>
  </SDialog>
</template>
