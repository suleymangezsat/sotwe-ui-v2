/*
 * Form validation primitives — mirror sotwebe's `MyEmailValidator`,
 * `MyPasswordValidator`, and `MyUsernameValidator` so client-side checks
 * give the same verdict the backend would. We only validate on the
 * **frontend** to give fast UX feedback; the backend is the source of
 * truth and any payload that gets past us still gets re-checked there.
 *
 * Each helper returns `undefined` for valid input and a short i18n-style
 * message key for invalid input. Form fields render the message inline
 * via `<UFormField :error="...">`.
 *
 * Constraints (kept verbatim from sotwebe regex annotations):
 *   email     5..50 chars, /^[A-Za-z0-9._+-]+@[A-Za-z0-9._-]+\.[A-Za-z]{2,6}$/
 *   password  8..16 chars, /^[A-Za-z0-9#?!@$%^&*_.\-]{8,16}$/
 *   username  3..20 chars, /^[A-Za-z0-9#?!@$%^&*_.\-]{3,20}$/   (frontend stays
 *             stricter on the v1 input — alnum + underscore only — so account
 *             handles look like @screen_name; backend allows the wider set
 *             for compatibility)
 */

const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9._-]+\.[A-Za-z]{2,6}$/
const PASSWORD_RE = /^[A-Za-z0-9#?!@$%^&*_.-]{8,16}$/
const USERNAME_FRONTEND_RE = /^[A-Za-z0-9_]{3,20}$/

export type ValidationResult = string | undefined

export function validateEmail(v: string | undefined | null): ValidationResult {
  const value = (v ?? '').trim()
  if (!value) return 'validation.email.required'
  if (value.length < 5 || value.length > 50) return 'validation.email.length'
  if (!EMAIL_RE.test(value)) return 'validation.email.invalid'
  return undefined
}

export function validatePassword(v: string | undefined | null): ValidationResult {
  const value = v ?? ''
  if (!value) return 'validation.password.required'
  if (value.length < 8 || value.length > 16) return 'validation.password.length'
  if (!PASSWORD_RE.test(value)) return 'validation.password.invalid'
  return undefined
}

export function validateUsername(v: string | undefined | null): ValidationResult {
  const value = (v ?? '').trim()
  if (!value) return 'validation.username.required'
  if (value.length < 3 || value.length > 20) return 'validation.username.length'
  if (!USERNAME_FRONTEND_RE.test(value)) return 'validation.username.invalid'
  return undefined
}

export function validateConfirmPassword(
  password: string | undefined | null,
  confirm: string | undefined | null,
): ValidationResult {
  if (!confirm) return 'validation.confirmPassword.required'
  if ((password ?? '') !== (confirm ?? '')) return 'validation.confirmPassword.mismatch'
  return undefined
}

export function validateOtp(v: string | undefined | null): ValidationResult {
  const value = (v ?? '').trim()
  if (!value) return 'validation.otp.required'
  if (!/^\d{4,8}$/.test(value)) return 'validation.otp.invalid'
  return undefined
}

export function validateName(v: string | undefined | null): ValidationResult {
  const value = (v ?? '').trim()
  if (!value) return 'validation.name.required'
  if (value.length > 50) return 'validation.name.length'
  return undefined
}

/**
 * ISO date `YYYY-MM-DD`, between 1900-01-01 and today. Returned as a
 * stringified validation key so the form field can render an i18n message.
 */
export function validateBirthDate(v: string | undefined | null): ValidationResult {
  const value = (v ?? '').trim()
  if (!value) return 'validation.birthDate.required'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'validation.birthDate.invalid'
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return 'validation.birthDate.invalid'
  const min = Date.parse('1900-01-01')
  const max = Date.now()
  if (ts < min || ts > max) return 'validation.birthDate.range'
  return undefined
}
