import { describe, expect, it } from 'vitest'
import { resolveLangOverride } from '~/utils/resolveLangOverride'

/*
 * `?lang=` is the deep-link locale-switch entrypoint. The pure
 * `resolveLangOverride` helper decides whether the middleware should
 * call `$i18n.setLocale()` + persist a cookie, or skip both. These
 * tests pin the priority rules:
 *
 *   - missing / empty / array-of-empty / unknown query  → noop
 *   - matching the current locale                       → noop (no
 *     redundant cookie writes / async re-resolve)
 *   - supported locale that differs from current        → apply
 *
 * v1's `middleware/i18n.js` had the same precedence (query > cookie >
 * Accept-Language > default).
 */

const SUPPORTED = ['en', 'tr', 'id'] as const

describe('resolveLangOverride', () => {
  it('returns noop when no `lang` query is present', () => {
    expect(resolveLangOverride({ query: undefined, supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
    expect(resolveLangOverride({ query: '', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
  })

  it('returns noop for unsupported locales (no validation pass-through)', () => {
    expect(resolveLangOverride({ query: 'fr', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
    expect(resolveLangOverride({ query: 'EN-US', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
  })

  it('case-insensitively maps the query value', () => {
    expect(resolveLangOverride({ query: 'TR', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'apply', locale: 'tr' })
    expect(resolveLangOverride({ query: 'Id', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'apply', locale: 'id' })
  })

  it('applies a supported, distinct locale', () => {
    expect(resolveLangOverride({ query: 'tr', supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'apply', locale: 'tr' })
  })

  it('returns noop when the requested locale already matches `current`', () => {
    expect(resolveLangOverride({ query: 'tr', supported: SUPPORTED, current: 'tr' })).toEqual({ kind: 'noop' })
  })

  it('takes the first value when Vue Router returns an array (?lang=tr&lang=id)', () => {
    expect(resolveLangOverride({ query: ['tr', 'id'], supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'apply', locale: 'tr' })
  })

  it('returns noop when an array is empty / starts with empty', () => {
    expect(resolveLangOverride({ query: [], supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
    expect(resolveLangOverride({ query: ['', 'id'], supported: SUPPORTED, current: 'en' })).toEqual({ kind: 'noop' })
  })
})
