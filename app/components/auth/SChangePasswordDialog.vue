<script setup lang="ts">
/*
 * Change-password dialog (signed-in flow, distinct from the forgot-
 * password reset). Asks for the current password + a new one, hits
 * `PUT /me/profile/changePassword`, then closes on success.
 */

import { ErrorCode } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const open = defineModel<boolean>({ required: true })

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const newPasswordError = ref<string | undefined>(undefined)
const confirmError = ref<string | undefined>(undefined)

const loading = ref(false)
const errorCode = ref<ErrorCode | undefined>(undefined)
const errorMessage = ref<string | undefined>(undefined)

const toast = useToast()

const canSubmit = computed(() =>
  !loading.value
  && oldPassword.value && newPassword.value && confirmPassword.value
  && !newPasswordError.value && !confirmError.value,
)

watch(open, (v) => {
  if (!v) {
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    errorCode.value = undefined
    errorMessage.value = undefined
  }
})

async function submit() {
  if (!canSubmit.value) return
  loading.value = true
  errorCode.value = undefined
  errorMessage.value = undefined
  try {
    await useApi().me.changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    toast.add({ title: 'Password changed', icon: 'i-lucide-check', color: 'success' })
    open.value = false
  }
  catch (e) {
    if (isSotweApiError(e)) {
      errorCode.value = e.code
      errorMessage.value = e.message
    }
    else {
      errorCode.value = ErrorCode.UNEXPECTED
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <SDialog v-model="open" title="Change password">
    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <SPasswordField
        v-model="oldPassword"
        label="Current password"
        autocomplete="current-password"
        no-validate
      />
      <SPasswordField
        v-model="newPassword"
        label="New password"
        autocomplete="new-password"
        @update:error="newPasswordError = $event"
      />
      <SConfirmPasswordField
        v-model="confirmPassword"
        :password="newPassword"
        @update:error="confirmError = $event"
      />

      <SFormError :code="errorCode" :message="errorMessage" />

      <SButton block type="submit" :loading="loading" :disabled="!canSubmit">
        Change password
      </SButton>
    </form>
  </SDialog>
</template>
