/*
 * Signup flow — multi-step form state.
 * Steps: 1=init (username/email/password), 2=otp, 3=profile (name, gender, birthday).
 * After step 3 the backend returns AuthResponse; sidebase/nuxt-auth (Faz 7)
 * installs the tokens via `signIn('local', ...)`.
 */

import type { AuthTokens, Gender } from '~shared/types'

export const useSignupStore = defineStore('signup', () => {
  const step = ref<1 | 2 | 3>(1)
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const otpCode = ref('')
  const name = ref('')
  const gender = ref<Gender | undefined>(undefined)
  const birthDate = ref<string | undefined>(undefined)

  const loading = ref(false)
  const error = ref<{ statusCode: number, code?: string, message?: string } | undefined>(undefined)
  const tokens = ref<AuthTokens | undefined>(undefined)

  function reset() {
    step.value = 1
    username.value = ''
    email.value = ''
    password.value = ''
    otpCode.value = ''
    name.value = ''
    gender.value = undefined
    birthDate.value = undefined
    loading.value = false
    error.value = undefined
    tokens.value = undefined
  }

  async function submit(captcha?: string) {
    loading.value = true
    error.value = undefined
    try {
      const res = await useApi().auth.signup({
        username: username.value,
        email: email.value,
        password: password.value,
        step: step.value,
        name: name.value || undefined,
        gender: gender.value,
        birthDate: birthDate.value,
        otpCode: otpCode.value || undefined,
        captcha,
      })
      tokens.value = res
      if (step.value < 3) step.value = (step.value + 1) as 1 | 2 | 3
    }
    catch (e) {
      const err = e as { status?: number, code?: string, message?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code, message: err.message }
      throw e
    }
    finally {
      loading.value = false
    }
  }

  return {
    step, username, email, password, otpCode, name, gender, birthDate,
    loading, error, tokens,
    reset, submit,
  }
})
