<script setup lang="ts">
/*
 * Forgot-password dialog — three-step flow that mirrors v1
 * `components/login/forgot-password/ForgotPasswordFlow.vue` + its three
 * step children. Driven by `useForgotPasswordStore()` so closing/reopening
 * the dialog preserves the in-flight step state until the user explicitly
 * cancels.
 *
 * Steps:
 *   init    — visitor enters email; POST /v3/auth/forgot/init
 *   verify  — visitor enters the OTP they received; POST /v3/auth/forgot/verify
 *   confirm — visitor sets a new password; POST /v3/auth/forgot/confirm
 *   done    — success message + close button
 *
 * The captcha argument is plumbed through but currently undefined — Faz 11
 * wires `vue-recaptcha-v3` so each submit gets a fresh token.
 */

import { ErrorCode } from '~shared/types'

const open = defineModel<boolean>({ required: true })

const store = useForgotPasswordStore()
const { t } = useI18n()

// Per-field validation error state — surfaces "submit disabled" without
// a wrapper UForm.
const emailError = ref<string | undefined>(undefined)
const otpError = ref<string | undefined>(undefined)
const passwordError = ref<string | undefined>(undefined)

const submitErrorCode = computed<ErrorCode | undefined>(() => {
  if (!store.error?.code) return undefined
  return store.error.code in ErrorCode
    ? (store.error.code as ErrorCode)
    : ErrorCode.UNEXPECTED
})

watch(open, (v) => {
  // Reset to a clean slate every time the dialog *opens*. Closing midway
  // keeps the typed values around in case it was an accidental dismiss.
  if (v && store.step === 'done') store.reset()
})

async function onInit() {
  if (emailError.value) return
  try { await store.requestOtp() } catch { /* error surfaces via store.error */ }
}

async function onVerify() {
  if (otpError.value) return
  try { await store.verifyOtp() } catch { /* see above */ }
}

async function onConfirm() {
  if (passwordError.value) return
  try { await store.confirmReset() } catch { /* see above */ }
}

function close() {
  open.value = false
  if (store.step === 'done') store.reset()
}
</script>

<template>
  <SDialog v-model="open" :title="t('forgot_dialog.title')">
    <!-- Step 1 — email -->
    <div v-if="store.step === 'init'" class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('forgot_dialog.enterEmailDesc') }}
      </p>
      <SEmailField v-model="store.email" @update:error="emailError = $event" />
      <SFormError v-if="submitErrorCode" :code="submitErrorCode" />
      <SButton
        block
        :loading="store.loading"
        :disabled="!!emailError || !store.email"
        @click="onInit"
      >
        {{ t('forgot_dialog.sendCode') }}
      </SButton>
    </div>

    <!-- Step 2 — OTP -->
    <div v-else-if="store.step === 'verify'" class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('forgot_dialog.codeSentDesc', { email: store.email }) }}
      </p>
      <SOtpField v-model="store.otp" @update:error="otpError = $event" />
      <SFormError v-if="submitErrorCode" :code="submitErrorCode" />
      <SButton
        block
        :loading="store.loading"
        :disabled="!!otpError || !store.otp"
        @click="onVerify"
      >
        {{ t('forgot_dialog.verifyCode') }}
      </SButton>
      <button
        type="button"
        class="text-sm text-twitter-blue-500 hover:underline"
        @click="store.step = 'init'"
      >
        {{ t('signup_steps.useDifferentEmail') }}
      </button>
    </div>

    <!-- Step 3 — new password -->
    <div v-else-if="store.step === 'confirm'" class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('forgot_dialog.newPasswordDesc') }}
      </p>
      <SPasswordField
        v-model="store.newPassword"
        :label="t('forgot_dialog.newPasswordLabel')"
        autocomplete="new-password"
        @update:error="passwordError = $event"
      />
      <SFormError v-if="submitErrorCode" :code="submitErrorCode" />
      <SButton
        block
        :loading="store.loading"
        :disabled="!!passwordError || !store.newPassword"
        @click="onConfirm"
      >
        {{ t('forgot_dialog.savePassword') }}
      </SButton>
    </div>

    <!-- Step 4 — done -->
    <div v-else class="flex flex-col items-center gap-4 py-2 text-center">
      <Icon name="i-lucide-check-circle-2" class="size-10 text-green-500" />
      <h3 class="text-lg font-bold">{{ t('forgot_dialog.done') }}</h3>
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('forgot_dialog.doneDesc') }}
      </p>
      <SButton block @click="close">{{ t('common.close') }}</SButton>
    </div>
  </SDialog>
</template>
