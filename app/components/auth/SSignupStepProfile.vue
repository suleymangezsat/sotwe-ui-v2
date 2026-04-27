<script setup lang="ts">
/*
 * Signup step 3 — name + gender + birth date. POSTs /v3/auth/signup with
 * `step=3`; on success the backend returns AuthTokens and we drop them
 * into the auth cookies via `useAuth().applyTokens()`. The parent then
 * fetches the profile and bounces to /me/profile.
 *
 * v1 had two extra optional steps after this (UploadProfilePic, GetPremium).
 * In v2 we keep step 3 as the terminal step of the signup *form* — the
 * picture and subscription nudges live on /me/profile after the visitor
 * is signed in, which avoids forcing them through extra screens before
 * they see real content.
 */

import { ErrorCode } from '~shared/types'
import { useSignupStore } from '~/stores/signup'

const emit = defineEmits<{ done: [] }>()

const store = useSignupStore()
const auth = useAuth()

const nameError = ref<string | undefined>(undefined)
const birthDateError = ref<string | undefined>(undefined)

const errorCode = computed<ErrorCode | undefined>(() => {
  if (!store.error?.code) return undefined
  return store.error.code in ErrorCode
    ? (store.error.code as ErrorCode)
    : ErrorCode.UNEXPECTED
})

const canSubmit = computed(() =>
  !store.loading
  && store.name && store.birthDate && store.gender
  && !nameError.value && !birthDateError.value,
)

async function submit() {
  if (!canSubmit.value) return
  try {
    await store.submit()
    if (store.tokens) {
      auth.applyTokens(store.tokens)
      await auth.fetchUser()
      emit('done')
    }
  }
  catch { /* see store */ }
}

const { t } = useI18n()
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <SNameField v-model="store.name" @update:error="nameError = $event" />
    <SGenderField v-model="store.gender" required />
    <SBirthDateField v-model="store.birthDate" @update:error="birthDateError = $event" />

    <SFormError :code="errorCode" />

    <SButton block type="submit" :loading="store.loading" :disabled="!canSubmit">
      {{ t('signup_steps.createAccountBtn') }}
    </SButton>
  </form>
</template>
