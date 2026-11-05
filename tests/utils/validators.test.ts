import { describe, expect, it } from 'vitest'
import {
  validateBirthDate,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateOtp,
  validatePassword,
  validateUsername,
} from '~/utils/validators'

/*
 * Form-validation primitives mirror sotwebe's server-side regex set, so
 * any drift here means the visitor passes our gate and gets a 400 from
 * the backend instead of inline help. These tests pin the boundaries
 * (length min/max + character class) one case each side — they're cheap
 * regression bait if anyone tweaks the regex without checking the
 * sotwebe contract.
 */

describe('validateEmail', () => {
  it('rejects missing input with `required`', () => {
    expect(validateEmail('')).toBe('validation.email.required')
    expect(validateEmail(undefined)).toBe('validation.email.required')
  })
  it('rejects too-short and too-long inputs with `length`', () => {
    expect(validateEmail('a@b')).toBe('validation.email.length')
    expect(validateEmail(`${'x'.repeat(45)}@y.com`)).toBe('validation.email.length')
  })
  it('rejects malformed emails with `invalid`', () => {
    expect(validateEmail('not-an-email')).toBe('validation.email.invalid')
    expect(validateEmail('foo@bar')).toBe('validation.email.invalid')
  })
  it('accepts well-formed addresses', () => {
    expect(validateEmail('foo@bar.com')).toBeUndefined()
    expect(validateEmail('a.b+tag-x@example.co')).toBeUndefined()
  })
})

describe('validatePassword', () => {
  it('rejects missing / short / long passwords', () => {
    expect(validatePassword('')).toBe('validation.password.required')
    expect(validatePassword('short')).toBe('validation.password.length')
    expect(validatePassword('this-is-too-long-pw')).toBe('validation.password.length')
  })
  it('rejects passwords with disallowed characters', () => {
    expect(validatePassword('hello world')).toBe('validation.password.invalid')
  })
  it('accepts in-spec passwords', () => {
    expect(validatePassword('Abcd1234!')).toBeUndefined()
  })
})

describe('validateUsername', () => {
  it('enforces length 3..20 alnum + underscore', () => {
    expect(validateUsername('ab')).toBe('validation.username.length')
    expect(validateUsername('a'.repeat(21))).toBe('validation.username.length')
    expect(validateUsername('user-with-dash')).toBe('validation.username.invalid')
    expect(validateUsername('valid_handle1')).toBeUndefined()
  })
})

describe('validateConfirmPassword', () => {
  it('flags mismatch and required', () => {
    expect(validateConfirmPassword('a', '')).toBe('validation.confirmPassword.required')
    expect(validateConfirmPassword('a', 'b')).toBe('validation.confirmPassword.mismatch')
    expect(validateConfirmPassword('same', 'same')).toBeUndefined()
  })
})

describe('validateOtp', () => {
  it('accepts 4–8 digit codes', () => {
    expect(validateOtp('')).toBe('validation.otp.required')
    expect(validateOtp('12')).toBe('validation.otp.invalid')
    expect(validateOtp('abcd')).toBe('validation.otp.invalid')
    expect(validateOtp('1234')).toBeUndefined()
    expect(validateOtp('12345678')).toBeUndefined()
  })
})

describe('validateName', () => {
  it('enforces required + max length', () => {
    expect(validateName('')).toBe('validation.name.required')
    expect(validateName('a'.repeat(51))).toBe('validation.name.length')
    expect(validateName('Jane Doe')).toBeUndefined()
  })
})

describe('validateBirthDate', () => {
  it('rejects missing / non-iso / out-of-range dates', () => {
    expect(validateBirthDate('')).toBe('validation.birthDate.required')
    expect(validateBirthDate('1990/01/01')).toBe('validation.birthDate.invalid')
    expect(validateBirthDate('1899-12-31')).toBe('validation.birthDate.range')
  })
  it('accepts a plausible birth date', () => {
    expect(validateBirthDate('1990-05-12')).toBeUndefined()
  })
})
