<script setup lang="ts">
/*
 * Signup (`/signup`, root-level — v1 URL scheme). Three-step flow:
 *
 *   1. Credentials   — username + email + password   → step bumps to 2
 *   2. Verify email  — OTP                           → step bumps to 3
 *   3. Profile info  — name + gender + birth date    → returns AuthTokens
 *
 * Each step is its own component (`SSignupStepInit/Otp/Profile`) so the
 * page only orchestrates which one is on screen + a progress dots row at
 * the top. State lives in `useSignupStore` so a refresh during step 2 or 3
 * doesn't lose the typed credentials within the same browser session.
 *
 * On step 3 success the profile component bounces us to /me/profile.
 */

import { useSignupStore } from '~/stores/signup'

const store = useSignupStore()
const auth = useAuth()

const { t } = useI18n()
useSotweMeta({
  title: t('signupPage.meta.title'),
  description: t('signupPage.meta.description'),
  noindex: true,
})

// If the visitor's already signed in (back-button to /signup after a
// successful run) bounce them to their profile rather than show step 1.
if (import.meta.client && auth.isAuthenticated.value) {
  navigateTo('/me/profile', { replace: true })
}

// Reset the store on initial visit so a stale half-finished signup from
// a previous tab doesn't pre-fill fields.
onMounted(() => {
  if (store.step === 1 && !store.email) store.reset()
})

const stepLabel = computed(() => {
  if (store.step === 1) return t('signup_steps.stepCreate')
  if (store.step === 2) return t('signup_steps.stepVerify')
  return t('signup_steps.stepProfile')
})

function onProfileDone() {
  store.reset()
  navigateTo('/me/profile', { replace: true })
}
</script>

<template>
  <!-- The step heading ("Create your account" / "Verify…" / "Tell us about
       you") is the page h1 — topbar drops to h2. -->
  <STopBar :title="t('auth.signUp')" :show-back="true" :as="'h2'" />
  <section class="mx-auto flex max-w-sm flex-col gap-6 px-4 py-8">
    <div class="flex flex-col items-center gap-2">
      <SLogo :size="40" />
      <h1 class="text-center text-2xl font-bold">{{ stepLabel }}</h1>
    </div>

    <!-- Progress dots — purely visual hint of where the visitor is in
         the 3-step flow. Aria-current pins the active dot for AT users. -->
    <div class="flex items-center justify-center gap-2" :aria-label="t('signup_steps.progressLabel')">
      <span
        v-for="n in 3"
        :key="n"
        :aria-current="store.step === n ? 'step' : undefined"
        class="h-1.5 rounded-full transition-all"
        :class="[
          store.step === n ? 'w-6 bg-twitter-blue-500' : 'w-3 bg-twitter-slate-200 dark:bg-twitter-slate-700',
        ]"
      />
    </div>

    <SSignupStepInit v-if="store.step === 1" />
    <SSignupStepOtp v-else-if="store.step === 2" />
    <SSignupStepProfile v-else @done="onProfileDone" />

    <p class="text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('auth.alreadyHaveAccount') }}
      <NuxtLink to="/login" class="font-semibold text-twitter-blue-500 hover:underline">
        {{ t('auth.signIn') }}
      </NuxtLink>
    </p>
  </section>
</template>
