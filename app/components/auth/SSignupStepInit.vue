<script setup lang="ts">
/*
 * Signup step 1 — username + email + password.
 *
 * Submitting POSTs `/v3/auth/signup` with `step=1`. The backend doesn't
 * mint tokens yet; it just verifies the credentials are well-formed and
 * sends a verification code to the email. On success the parent moves to
 * step 2.
 */

import { ErrorCode } from '~shared/types'
import { useSignupStore } from '~/stores/signup'

const store = useSignupStore()

const usernameError = ref<string | undefined>(undefined)
const emailError = ref<string | undefined>(undefined)
const passwordError = ref<string | undefined>(undefined)

const errorCode = computed<ErrorCode | undefined>(() => {
  if (!store.error?.code) return undefined
  return store.error.code in ErrorCode
    ? (store.error.code as ErrorCode)
    : ErrorCode.UNEXPECTED
})

const canSubmit = computed(() =>
  !store.loading
  && store.username && store.email && store.password
  && !usernameError.value && !emailError.value && !passwordError.value,
)

async function submit() {
  if (!canSubmit.value) return
  try { await store.submit() } catch { /* error mirrored via store */ }
}

const { t } = useI18n()
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <SUsernameField
      v-model="store.username"
      @update:error="usernameError = $event"
    />
    <SEmailField
      v-model="store.email"
      @update:error="emailError = $event"
    />
    <SPasswordField
      v-model="store.password"
      autocomplete="new-password"
      @update:error="passwordError = $event"
    />

    <SFormError :code="errorCode" />

    <SButton block type="submit" :loading="store.loading" :disabled="!canSubmit">
      {{ t('signup_steps.sendCode') }}
    </SButton>
  </form>
</template>
