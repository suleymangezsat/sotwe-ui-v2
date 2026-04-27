<script setup lang="ts">
/*
 * Signup step 2 — visitor enters the verification code sent to the email
 * captured in step 1. POSTs `/v3/auth/signup` with `step=2`. On success the
 * parent moves to step 3.
 */

import { ErrorCode } from '~shared/types'
import { useSignupStore } from '~/stores/signup'

const store = useSignupStore()

const otpError = ref<string | undefined>(undefined)

const errorCode = computed<ErrorCode | undefined>(() => {
  if (!store.error?.code) return undefined
  return store.error.code in ErrorCode
    ? (store.error.code as ErrorCode)
    : ErrorCode.UNEXPECTED
})

const canSubmit = computed(() =>
  !store.loading && store.otpCode && !otpError.value,
)

async function submit() {
  if (!canSubmit.value) return
  try { await store.submit() } catch { /* see store */ }
}

function back() {
  store.step = 1
}

const { t } = useI18n()
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ t('signup_steps.codeSentTo', { email: store.email }) }}
    </p>
    <SOtpField v-model="store.otpCode" @update:error="otpError = $event" />

    <SFormError :code="errorCode" />

    <SButton block type="submit" :loading="store.loading" :disabled="!canSubmit">
      {{ t('signup_steps.verify') }}
    </SButton>
    <button
      type="button"
      class="text-sm text-twitter-blue-500 hover:underline"
      @click="back"
    >
      {{ t('signup_steps.useDifferentEmail') }}
    </button>
  </form>
</template>
