<script setup lang="ts">
/*
 * Dev-only auth seeder (`/dev/auth-seed`). The real `/v3/auth/login` +
 * `/v3/auth/signup` endpoints require a reCAPTCHA v3 token, which doesn't
 * land until Faz 11 — so during the migration there's no way to actually
 * sign in from this app and exercise the authenticated screens
 * (`/me/profile`, `/me/bookmarks`, …).
 *
 * Workaround: paste a real `accessToken` + `refreshToken` you already have
 * from the v1 production site, or from a direct backend call that bypasses
 * reCAPTCHA (e.g. a dev-mode admin endpoint). This page just writes those
 * values into the same cookies `useAuth()` reads from, then bounces to
 * `/me/profile` so you can verify the rest of the flow.
 *
 * Hard-blocked in production builds — the page renders a 404 when
 * `NODE_ENV === 'production'` so a stray deploy can't expose a token-
 * stealing form.
 *
 *   How to get a token quickly:
 *     1. Sign in at https://www.sotwe.com (reCAPTCHA works there).
 *     2. DevTools → Application → Cookies → copy `auth._token.local`
 *        (the `Bearer ` prefix is fine; this page strips it).
 *     3. And `auth._refresh_token.local` for the refresh value.
 *     4. Paste here, click "Seed session", you're in.
 */

definePageMeta({ layout: false })

const config = useRuntimeConfig()
if (config.public.nodeEnv === 'production') {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

useSeoMeta({ title: 'Dev · Seed auth session', robots: 'noindex' })

const auth = useAuth()
const accessToken = ref('')
const refreshToken = ref('')
const status = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const message = ref<string | undefined>(undefined)

/*
 * Mock-premium toggle.
 *
 * Backed by `localStorage.sotwe-dev-premium`. The hook lives in
 * `useAuth().fetchUser()` — when this flag is set, the next /me/profile
 * fetch comes back with `subscription.priority` swapped to a non-zero
 * value so premium-gated UI (Download All Media, …) can be exercised
 * with a free-tier test account. Backend still says Free; only the
 * client-side `auth.user` view is patched.
 *
 * Hard-disabled in production builds — see `applyDevSubscriptionOverride`
 * in app/composables/useAuth.ts.
 */
const mockPremium = ref(false)
onMounted(() => {
  mockPremium.value = localStorage.getItem('sotwe-dev-premium') === '1'
})
watch(mockPremium, (v) => {
  if (v) localStorage.setItem('sotwe-dev-premium', '1')
  else localStorage.removeItem('sotwe-dev-premium')
  // Re-fetch the user so the override applies (or is undone) immediately.
  if (auth.isAuthenticated.value) auth.fetchUser()
})

function stripBearer(t: string): string {
  return t.replace(/^bearer\s+/i, '').trim()
}

async function seed() {
  status.value = 'loading'
  message.value = undefined

  const access = stripBearer(accessToken.value)
  const refresh = stripBearer(refreshToken.value)
  if (!access || !refresh) {
    status.value = 'error'
    message.value = 'Both access and refresh token are required.'
    return
  }

  auth.applyTokens({
    accessToken: access,
    refreshToken: refresh,
    expiresIn: 60 * 30,
  })

  // Verify the token works by hitting /me/profile. `fetchUser()` itself
  // tries a refresh-token rotation when the access token is expired, so
  // a stale 30-min JWT paired with a fresh refresh still gets through —
  // the same way the production app would handle it.
  try {
    const profile = await auth.fetchUser()
    if (!profile) {
      throw new Error('Backend rejected both tokens. The refresh token may also be expired or revoked — sign in at sotwe.com again to get a fresh pair.')
    }
    status.value = 'ok'
    message.value = `Signed in as @${profile.username}. Redirecting…`
    setTimeout(() => navigateTo('/me/profile'), 800)
  }
  catch (e) {
    status.value = 'error'
    message.value = (e as Error).message || 'Token rejected'
    auth.signOut()
  }
}

function clear() {
  auth.signOut()
  accessToken.value = ''
  refreshToken.value = ''
  status.value = 'idle'
  message.value = 'Cookies cleared.'
}

const isAuthed = computed(() => Boolean(auth.accessToken.value))
</script>

<template>
  <main class="min-h-dvh bg-white px-4 py-10 dark:bg-black">
    <section class="mx-auto flex max-w-lg flex-col gap-6">
      <header class="flex flex-col gap-2">
        <span class="self-start rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          dev only
        </span>
        <h1 class="text-2xl font-bold">Seed auth session</h1>
        <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          The live <code>/v3/auth/login</code> endpoint requires a
          reCAPTCHA token that isn't wired until Faz&nbsp;11. Until then,
          paste a real JWT pair below to seed the cookies
          <code>useAuth()</code> reads from, then test the protected screens.
        </p>
        <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          To grab a token: sign in at
          <a href="https://www.sotwe.com" target="_blank" class="text-twitter-blue-500 hover:underline">www.sotwe.com</a>
          → DevTools&nbsp;→&nbsp;Application&nbsp;→&nbsp;Cookies&nbsp;→ copy
          <code>auth._token.local</code> and <code>auth._refresh_token.local</code>.
        </p>
      </header>

      <div
        v-if="isAuthed"
        class="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
      >
        <span>An access token is already in cookies for this browser.</span>
        <SButton size="xs" variant="ghost" color="error" @click="clear">Clear</SButton>
      </div>

      <!--
        Subscription override. Lets the visitor flip
        `auth.user.subscription.priority` to a non-zero value without a
        real premium account, so gated flows (Download All Media,
        Premium UI badges, …) can be exercised end-to-end on a free-tier
        test account. Persists in localStorage so it survives reloads.
      -->
      <label
        class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950"
      >
        <input
          v-model="mockPremium"
          type="checkbox"
          class="mt-0.5 size-4 shrink-0 accent-twitter-blue-500"
        >
        <div class="flex flex-col gap-0.5">
          <span class="font-semibold text-amber-900 dark:text-amber-200">Mock premium subscription</span>
          <span class="text-xs text-amber-800 dark:text-amber-300">
            Patches <code>auth.user.subscription.priority = 99</code> client-side
            so you can test premium-gated flows (e.g. Download All Media).
            Backend still says Free.
          </span>
        </div>
      </label>

      <form class="flex flex-col gap-4" @submit.prevent="seed">
        <UFormField label="Access token (JWT)" :ui="{ root: 'w-full' }">
          <UTextarea
            v-model="accessToken"
            :rows="3"
            class="w-full font-mono text-xs"
            placeholder="eyJhbGciOi…"
            :disabled="status === 'loading'"
          />
        </UFormField>
        <UFormField label="Refresh token" :ui="{ root: 'w-full' }">
          <UTextarea
            v-model="refreshToken"
            :rows="2"
            class="w-full font-mono text-xs"
            placeholder="eyJhbGciOi…"
            :disabled="status === 'loading'"
          />
        </UFormField>

        <p
          v-if="message"
          :class="status === 'error'
            ? 'text-sm text-red-600 dark:text-red-400'
            : 'text-sm text-green-600 dark:text-green-400'"
        >
          {{ message }}
        </p>

        <div class="flex gap-2">
          <SButton
            type="submit"
            :loading="status === 'loading'"
            :disabled="!accessToken || !refreshToken"
            block
          >
            Seed session
          </SButton>
          <SButton
            type="button"
            variant="ghost"
            :disabled="status === 'loading'"
            @click="clear"
          >
            Clear
          </SButton>
        </div>
      </form>

      <NuxtLink to="/" class="text-sm text-twitter-blue-500 hover:underline">
        ← Back to home
      </NuxtLink>
    </section>
  </main>
</template>
