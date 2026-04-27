<script setup lang="ts">
/*
 * Login (`/login`, root-level — v1 URL scheme). Uses the shared form
 * primitives, surfaces backend errors via SFormError, and offers two
 * shortcuts:
 *
 *   1. "Continue with Google" — kicks the OAuth dance via
 *      SLoginWithGoogleButton; the visitor returns to /auth/redirect/google
 *      where the access code is exchanged for a JWT.
 *   2. "Forgot password" — opens SForgotPasswordDialog which runs the
 *      three-step reset flow without leaving this page.
 *
 * Successful sign-in writes tokens via `useAuth().signIn()`, fetches the
 * profile, then sends the visitor to `?redirect=…` (or /me/profile by
 * default — the post-login destination v1 used).
 */

import { ErrorCode } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const email = ref('')
const password = ref('')
const emailError = ref<string | undefined>(undefined)
const passwordError = ref<string | undefined>(undefined)

const loading = ref(false)
const errorCode = ref<ErrorCode | undefined>(undefined)
const errorMessage = ref<string | undefined>(undefined)
const forgotOpen = ref(false)

const route = useRoute()
const auth = useAuth()
const redirect = computed(() => (route.query.redirect as string | undefined) || '/me/profile')

const { t } = useI18n()
useSotweMeta({
  title: t('loginPage.meta.title'),
  description: t('loginPage.meta.description'),
  noindex: true,
})

async function submit() {
  if (loading.value || emailError.value || passwordError.value) return
  if (!email.value || !password.value) return

  loading.value = true
  errorCode.value = undefined
  errorMessage.value = undefined
  try {
    await auth.signIn({ email: email.value, password: password.value })
    navigateTo(redirect.value)
  }
  catch (e) {
    if (isSotweApiError(e)) {
      errorCode.value = e.code
      errorMessage.value = e.message
    }
    else {
      errorCode.value = ErrorCode.UNEXPECTED
      errorMessage.value = (e as Error).message || t('auth_dialog.signInFailed')
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- The page hero ("Sign in to Sotwe") is the h1 — topbar drops to h2. -->
  <STopBar :title="t('auth.signIn')" :show-back="true" :as="'h2'" />
  <section class="mx-auto flex max-w-sm flex-col gap-6 px-4 py-8">
    <div class="flex flex-col items-center gap-2">
      <SLogo :size="40" />
      <h1 class="text-center text-2xl font-bold">{{ t('auth_dialog.signInTitle') }}</h1>
      <p class="text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('auth_dialog.welcomeBack') }}
      </p>
    </div>

    <SLoginWithGoogleButton />

    <div class="flex items-center gap-3 text-xs text-twitter-slate-400">
      <span class="h-px flex-1 bg-twitter-slate-100 dark:bg-twitter-slate-800" />
      {{ t('auth_dialog.orDivider') }}
      <span class="h-px flex-1 bg-twitter-slate-100 dark:bg-twitter-slate-800" />
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <SEmailField
        v-model="email"
        autocomplete="email"
        no-validate
        @update:error="emailError = $event"
      />
      <SPasswordField
        v-model="password"
        autocomplete="current-password"
        no-validate
        @update:error="passwordError = $event"
      />

      <SFormError :code="errorCode" :message="errorMessage" />

      <SButton
        block
        type="submit"
        :loading="loading"
        :disabled="!email || !password"
      >
        {{ t('auth_dialog.signInButton') }}
      </SButton>
    </form>

    <div class="flex items-center justify-between text-sm">
      <NuxtLink to="/signup" class="font-semibold text-twitter-blue-500 hover:underline">
        {{ t('auth_dialog.createAccount') }}
      </NuxtLink>
      <button
        type="button"
        class="text-twitter-slate-500 hover:underline dark:text-twitter-slate-400"
        @click="forgotOpen = true"
      >
        {{ t('auth_dialog.forgotPassword') }}
      </button>
    </div>

    <SForgotPasswordDialog v-model="forgotOpen" />
  </section>
</template>
