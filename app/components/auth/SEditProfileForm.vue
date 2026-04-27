<script setup lang="ts">
/*
 * Edit basic profile fields — name + gender + birth date. Wraps the
 * matching form primitives, hits `PUT /me/profile/update`, and refreshes
 * `useAuth().user` on success so the rest of the UI reflects the change
 * without a page reload.
 *
 * Sotwe doesn't expose a "username/email change" path (see UpdateProfile
 * Request DTO — only name/gender/birthDate are mutable). Keep that scope
 * tight here; surfacing a disabled email field would just confuse users.
 */

import { ErrorCode, type Gender, type UserProfile } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const props = defineProps<{
  profile: UserProfile
}>()
const emit = defineEmits<{ updated: [] }>()

const auth = useAuth()
const toast = useToast()

const name = ref(props.profile.name ?? '')
const gender = ref<Gender | undefined>(props.profile.gender)
const birthDate = ref<string | undefined>(props.profile.birthDate)

const nameError = ref<string | undefined>(undefined)
const birthDateError = ref<string | undefined>(undefined)

const loading = ref(false)
const errorCode = ref<ErrorCode | undefined>(undefined)
const errorMessage = ref<string | undefined>(undefined)

const dirty = computed(() =>
  name.value !== (props.profile.name ?? '')
  || gender.value !== props.profile.gender
  || birthDate.value !== props.profile.birthDate,
)
const canSubmit = computed(() =>
  !loading.value && dirty.value && !nameError.value && !birthDateError.value,
)

async function submit() {
  if (!canSubmit.value) return
  loading.value = true
  errorCode.value = undefined
  errorMessage.value = undefined
  try {
    await useApi().me.updateProfile({
      name: name.value,
      gender: gender.value,
      birthDate: birthDate.value,
    })
    await auth.fetchUser()
    toast.add({ title: 'Profile updated', icon: 'i-lucide-check', color: 'success' })
    emit('updated')
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
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <SNameField v-model="name" @update:error="nameError = $event" />
    <SGenderField v-model="gender" />
    <SBirthDateField v-model="birthDate" @update:error="birthDateError = $event" />

    <SFormError :code="errorCode" :message="errorMessage" />

    <SButton block type="submit" :loading="loading" :disabled="!canSubmit">
      Save changes
    </SButton>
  </form>
</template>
