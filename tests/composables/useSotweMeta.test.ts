import { describe, expect, it } from 'vitest'
import { buildSotweMeta } from '~/composables/useSotweMeta'

/*
 * SEO regression net.
 *
 * `useSotweMeta` is the single chokepoint that emits every meta tag
 * Google / Bing / Twitter / OpenGraph crawlers read. v1's MetaHelper
 * shape is what the live sotwe.com SERP listings are wired against —
 * if any of these snapshots drift, the production migration will move
 * pages around in search results.
 *
 * The composable's pure builder (`buildSotweMeta`) is the test surface
 * so we can assert the full output object without booting Nuxt's auto-
 * imports. The composable wrapper just hands the runtime config /
 * route path to the same builder.
 */

const CTX = {
  siteUrl: 'https://www.sotwe.com',
  siteName: 'Sotwe',
  routePath: '/elonmusk',
}

describe('buildSotweMeta', () => {
  it('emits the v1 baseline tag set for a public profile page', () => {
    const out = buildSotweMeta(
      {
        title: 'Elon Musk @elonmusk - Twitter Profile',
        description: 'Bio and stats for @elonmusk',
        image: 'https://pbs.twimg.com/profile_images/elon.jpg',
        ogType: 'profile',
      },
      CTX,
    )

    expect(out.seoMeta).toMatchInlineSnapshot(`
      {
        "description": "Bio and stats for @elonmusk",
        "ogDescription": "Bio and stats for @elonmusk",
        "ogImage": "https://pbs.twimg.com/profile_images/elon.jpg",
        "ogSiteName": "Sotwe",
        "ogTitle": "Elon Musk @elonmusk - Twitter Profile",
        "ogType": "profile",
        "ogUrl": "https://www.sotwe.com/elonmusk",
        "robots": undefined,
        "title": "Elon Musk @elonmusk - Twitter Profile",
        "twitterCard": "summary_large_image",
        "twitterDescription": "Bio and stats for @elonmusk",
        "twitterImage": "https://pbs.twimg.com/profile_images/elon.jpg",
        "twitterTitle": "Elon Musk @elonmusk - Twitter Profile",
      }
    `)
    expect(out.link).toEqual([{ rel: 'canonical', href: 'https://www.sotwe.com/elonmusk' }])
  })

  it('downgrades twitter card when no image is supplied', () => {
    const out = buildSotweMeta(
      { title: 'About Us', description: 'Sotwe info' },
      { ...CTX, routePath: '/about' },
    )
    expect(out.seoMeta.twitterCard).toBe('summary')
    expect(out.seoMeta.ogImage).toBeUndefined()
    expect(out.seoMeta.twitterImage).toBeUndefined()
    expect(out.seoMeta.ogType).toBe('website')
  })

  it('emits noindex when `noindex` is true', () => {
    const out = buildSotweMeta(
      { title: 'Login', description: 'Sign in', noindex: true },
      { ...CTX, routePath: '/login' },
    )
    expect(out.seoMeta.robots).toBe('noindex')
  })

  it('emits noindex for sensitive content (Twitter NSFW flag)', () => {
    const out = buildSotweMeta(
      { title: 'Tweet', description: 'sensitive', isSensitive: true },
      { ...CTX, routePath: '/tweet/1' },
    )
    expect(out.seoMeta.robots).toBe('noindex')
  })

  it('lowercases the canonical URL (v1 duplicate-URL hack)', () => {
    const out = buildSotweMeta(
      { title: 'X', description: 'X' },
      { ...CTX, routePath: '/MixedCase/Path' },
    )
    expect(out.seoMeta.ogUrl).toBe('https://www.sotwe.com/mixedcase/path')
    expect(out.link[0]?.href).toBe('https://www.sotwe.com/mixedcase/path')
  })

  it('honours an explicit canonical override but still lowercases it', () => {
    const out = buildSotweMeta(
      {
        title: 'X',
        description: 'X',
        canonical: 'https://www.sotwe.com/Override',
      },
      { ...CTX, routePath: '/elonmusk?after=abc' },
    )
    expect(out.link[0]?.href).toBe('https://www.sotwe.com/override')
  })

  it('strips trailing slashes from the configured site URL', () => {
    const out = buildSotweMeta(
      { title: 'X', description: 'X' },
      { ...CTX, siteUrl: 'https://www.sotwe.com//', routePath: '/foo' },
    )
    expect(out.seoMeta.ogUrl).toBe('https://www.sotwe.com/foo')
  })

  it('serialises JSON-LD into a single script tag', () => {
    const out = buildSotweMeta(
      {
        title: 'X',
        description: 'X',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'About Sotwe',
        },
      },
      { ...CTX, routePath: '/about' },
    )
    expect(out.script).toHaveLength(1)
    expect(out.script[0]?.type).toBe('application/ld+json')
    expect(JSON.parse(out.script[0]!.innerHTML)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'About Sotwe',
    })
  })

  it('produces an empty script array when no JSON-LD is supplied', () => {
    const out = buildSotweMeta({ title: 'X', description: 'X' }, CTX)
    expect(out.script).toEqual([])
  })

  it('falls back to a `/`-rooted canonical when route path is empty', () => {
    const out = buildSotweMeta({ title: 'X', description: 'X' }, { ...CTX, routePath: '' })
    expect(out.seoMeta.ogUrl).toBe('https://www.sotwe.com/')
  })
})
