/*
 * Static English fallback for validation message keys produced by
 * `app/utils/validators.ts`. Faz 7 will replace this with `@nuxtjs/i18n`'s
 * `$t()` so the same keys resolve from `i18n/locales/{en,tr,id}.ts`.
 *
 * Keep in sync with v1 `app/locales/en.js` validation strings.
 */

export const VALIDATION_MESSAGES: Record<string, string> = {
  'validation.email.required': 'Email is required',
  'validation.email.length': 'Email must be 5–50 characters',
  'validation.email.invalid': 'Enter a valid email address',

  'validation.password.required': 'Password is required',
  'validation.password.length': 'Password must be 8–16 characters',
  'validation.password.invalid': 'Use letters, digits, or #?!@$%^&*_.-',

  'validation.username.required': 'Username is required',
  'validation.username.length': 'Username must be 3–20 characters',
  'validation.username.invalid': 'Letters, digits, and underscore only',

  'validation.confirmPassword.required': 'Confirm your password',
  'validation.confirmPassword.mismatch': 'Passwords do not match',

  'validation.otp.required': 'Enter the verification code',
  'validation.otp.invalid': 'Enter a valid code',

  'validation.name.required': 'Name is required',
  'validation.name.length': 'Name must be at most 50 characters',

  'validation.birthDate.required': 'Birth date is required',
  'validation.birthDate.invalid': 'Enter a valid birth date',
  'validation.birthDate.range': 'Birth date is out of range',
}

export function translateValidationKey(key: string | undefined): string | undefined {
  if (!key) return undefined
  return VALIDATION_MESSAGES[key] ?? key
}
