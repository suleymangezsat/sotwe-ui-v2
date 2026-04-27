<script setup lang="ts">
/*
 * "Continue with Google" — replaces v1
 * `components/common/LoginWithGoogleButton.vue`. Builds the OAuth URL
 * client-side and replaces the location so back-button doesn't trap the
 * user in the consent screen.
 *
 *   protocol: oauth2 / response_type: code / access_type: offline
 *   client_id:    NUXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID
 *   redirect_uri: <siteUrl>/auth/redirect/google   (handled by [provider].vue)
 *   scope:        email profile openid
 *
 * Disabled when `googleAuthClientId` is empty (e.g. local dev without
 * OAuth credentials) so the button doesn't lead to a Google "missing
 * client_id" error page.
 */

const config = useRuntimeConfig()
const enabled = computed(() => Boolean(config.public.googleAuthClientId))

function randomState(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

function encode(query: Record<string, string>): string {
  return Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

function startOAuth() {
  if (!enabled.value) return
  const redirectUri = new URL('/auth/redirect/google', config.public.siteUrl).toString()
  const url = `https://accounts.google.com/o/oauth2/auth?${encode({
    response_type: 'code',
    access_type: 'offline',
    client_id: config.public.googleAuthClientId,
    redirect_uri: redirectUri,
    scope: 'email profile openid',
    state: randomState(),
  })}`
  window.location.replace(url)
}

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    :disabled="!enabled"
    :aria-label="t('common.continueWithGoogle')"
    class="inline-flex w-full items-center justify-center gap-3 rounded-full border border-twitter-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-twitter-slate-950 transition-colors hover:bg-twitter-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-twitter-slate-700 dark:bg-twitter-slate-950 dark:text-twitter-slate-100 dark:hover:bg-twitter-slate-900"
    @click="startOAuth"
  >
    <Icon name="i-ri-google-fill" class="size-5 text-[#4285F4]" />
    {{ t('common.continueWithGoogle') }}
  </button>
</template>
