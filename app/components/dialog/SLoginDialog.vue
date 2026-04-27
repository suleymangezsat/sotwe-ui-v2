<script setup lang="ts">
/*
 * "You need to sign in" prompt — port of v1's modal login wrapper. Used
 * by auth-gated actions that don't warrant a full-page navigation
 * (clicking the bookmark button while logged-out, opening the message
 * dialog from a profile, etc.). Visitors that want the full /login
 * experience get a link at the bottom.
 *
 * State:
 *   ui.loginDialog.display         — visibility
 *   ui.loginDialog.props.redirect  — where to land after sign-in (defaults
 *                                    to the current path)
 *
 * The form itself reuses the same primitives as the /login page so error
 * shapes + Google OAuth wiring stay in one place.
 */

import { ErrorCode } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const ui = useUiStore()
const auth = useAuth()
const route = useRoute()
const { t } = useI18n()

const open = computed({
  get: () => ui.loginDialog.display,
  set: v => (ui.loginDialog.display = v),
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorCode = ref<ErrorCode | undefined>(undefined)
const errorMessage = ref<string | undefined>(undefined)

const redirect = computed(() => ui.loginDialog.props.redirect || route.fullPath)

watch(open, (v) => {
  if (!v) {
    email.value = ''
    password.value = ''
    errorCode.value = undefined
    errorMessage.value = undefined
  }
})

async function submit() {
  if (loading.value || !email.value || !password.value) return
  loading.value = true
  errorCode.value = undefined
  errorMessage.value = undefined
  try {
    await auth.signIn({ email: email.value, password: password.value })
    open.value = false
  }
  catch (e) {
    if (isSotweApiError(e)) {
      errorCode.value = e.code
      errorMessage.value = e.message
    }
    else {
      errorCode.value = ErrorCode.UNEXPECTED
      errorMessage.value = (e as Error).message
    }
  }
  finally {
    loading.value = false
  }
}

function goToFullPage() {
  open.value = false
  navigateTo({ path: '/login', query: { redirect: redirect.value } })
}

function goToSignup() {
  open.value = false
  ui.signupDialog.display = true
}
</script>

<template>
  <SDialog v-model="open" :title="t('auth_dialog.signInTitle')">
    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('auth_dialog.signInSubtitle') }}
      </p>

      <SLoginWithGoogleButton />

      <div class="flex items-center gap-3 text-xs text-twitter-slate-400">
        <span class="h-px flex-1 bg-twitter-slate-100 dark:bg-twitter-slate-800" />
        {{ t('auth_dialog.orDivider') }}
        <span class="h-px flex-1 bg-twitter-slate-100 dark:bg-twitter-slate-800" />
      </div>

      <SEmailField v-model="email" no-validate />
      <SPasswordField v-model="password" no-validate />

      <SFormError :code="errorCode" :message="errorMessage" />

      <SButton
        type="submit"
        block
        :loading="loading"
        :disabled="!email || !password"
      >
        {{ t('auth_dialog.signInButton') }}
      </SButton>

      <div class="flex items-center justify-between text-sm">
        <button type="button" class="font-semibold text-twitter-blue-500 hover:underline" @click="goToSignup">
          {{ t('auth_dialog.createAccount') }}
        </button>
        <button type="button" class="text-twitter-slate-500 hover:underline dark:text-twitter-slate-400" @click="goToFullPage">
          {{ t('auth_dialog.openFullPage') }}
        </button>
      </div>
    </form>
  </SDialog>
</template>
