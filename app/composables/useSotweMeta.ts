/*
 * Centralized page metadata — exact parity with sotwe-ui/js/helpers/metaHelper.js.
 *
 * Pages should call this instead of reaching for `useSeoMeta` / `useHead`
 * directly, so:
 *   - the canonical URL is always lowercased (v1 hack for duplicate-URL
 *     avoidance in search indexes)
 *   - `noindex` is emitted whenever the route renders user-generated or
 *     sensitive content that we don't want in search results
 *   - og:* and twitter:* mirror the primary title/description/image
 *   - JSON-LD lives inside `<head>` as a raw script tag
 *   - Twitter cards switch between `summary` and `summary_large_image`
 *     based on whether an image is supplied
 *
 * The pure builder (`buildSotweMeta`) is exported separately so the
 * Faz 10 SEO-snapshot tests can pin the meta tag set without booting a
 * full Nuxt instance — they call `buildSotweMeta(opts, ctx)` and assert
 * on the resulting object shape directly.
 */

export interface SotweMetaOptions {
  title: string
  description: string
  /** og:image / twitter:image. When set, twitter card becomes summary_large_image. */
  image?: string
  /** Emit `<meta name="robots" content="noindex">`. Used for auth pages, sensitive tweets, 404/410. */
  noindex?: boolean
  /** Shortcut for noindex when the backend flagged the content as adult/sensitive. */
  isSensitive?: boolean
  /** Override the derived canonical URL (lowercase, origin + path). */
  canonical?: string
  /** JSON-LD schema for the page. Emitted as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown>
  /** og:type — defaults to 'website'. Use 'article' for tweet detail. */
  ogType?: 'website' | 'article' | 'profile'
}

/**
 * Context the builder needs to derive a canonical URL — site origin
 * (from `runtimeConfig.public.siteUrl`), site name (`Sotwe`), and the
 * current request path (from `useRoute().path`). Tests pass these in
 * directly; the composable below resolves them from Nuxt.
 */
export interface SotweMetaContext {
  siteUrl: string
  siteName: string
  routePath: string
}

export interface SotweMetaOutput {
  seoMeta: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
    ogImage?: string
    ogUrl: string
    ogType: 'website' | 'article' | 'profile'
    ogSiteName: string
    twitterCard: 'summary' | 'summary_large_image'
    twitterTitle: string
    twitterDescription: string
    twitterImage?: string
    robots?: 'noindex'
  }
  link: { rel: 'canonical', href: string }[]
  script: { type: 'application/ld+json', innerHTML: string }[]
}

export function buildSotweMeta(opts: SotweMetaOptions, ctx: SotweMetaContext): SotweMetaOutput {
  const origin = ctx.siteUrl.replace(/\/+$/, '')
  const derivedUrl = `${origin}${ctx.routePath || '/'}`.toLowerCase()
  const canonical = (opts.canonical ?? derivedUrl).toLowerCase()
  const robots = (opts.noindex || opts.isSensitive) ? 'noindex' as const : undefined

  return {
    seoMeta: {
      title: opts.title,
      description: opts.description,
      ogTitle: opts.title,
      ogDescription: opts.description,
      ogImage: opts.image,
      ogUrl: canonical,
      ogType: opts.ogType ?? 'website',
      ogSiteName: ctx.siteName,
      twitterCard: opts.image ? 'summary_large_image' : 'summary',
      twitterTitle: opts.title,
      twitterDescription: opts.description,
      twitterImage: opts.image,
      robots,
    },
    link: [{ rel: 'canonical', href: canonical }],
    script: opts.jsonLd
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify(opts.jsonLd),
        }]
      : [],
  }
}

export function useSotweMeta(opts: SotweMetaOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const out = buildSotweMeta(opts, {
    siteUrl: config.public.siteUrl,
    siteName: config.public.siteName,
    routePath: route.path,
  })

  useSeoMeta(out.seoMeta)
  useHead({
    link: out.link,
    script: out.script,
  })
}
