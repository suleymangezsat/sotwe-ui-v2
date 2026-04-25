/*
 * Forgot-password flow state — 3 steps: init (email), verify (OTP), confirm
 * (new password). Each step calls its own backend endpoint.
 */

export const useForgotPasswordStore = defineStore('forgotPassword', () => {
  const step = ref<'init' | 'verify' | 'confirm' | 'done'>('init')
  const email = ref('')
  const otp = ref('')
  const newPassword = ref('')

  const loading = ref(false)
  const error = ref<{ statusCode: number, code?: string } | undefined>(undefined)

  function reset() {
    step.value = 'init'
    email.value = ''
    otp.value = ''
    newPassword.value = ''
    loading.value = false
    error.value = undefined
  }

  async function requestOtp(captcha?: string) {
    loading.value = true; error.value = undefined
    try {
      await useApi().auth.forgotInit({ email: email.value, captcha })
      step.value = 'verify'
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally { loading.value = false }
  }

  async function verifyOtp() {
    loading.value = true; error.value = undefined
    try {
      await useApi().auth.forgotVerify({ email: email.value, otp: otp.value })
      step.value = 'confirm'
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally { loading.value = false }
  }

  async function confirmReset() {
    loading.value = true; error.value = undefined
    try {
      await useApi().auth.forgotConfirm({
        email: email.value,
        otp: otp.value,
        password: newPassword.value,
      })
      step.value = 'done'
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally { loading.value = false }
  }

  return { step, email, otp, newPassword, loading, error, reset, requestOtp, verifyOtp, confirmReset }
})
