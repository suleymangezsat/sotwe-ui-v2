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
 * See also docs/ui-mapping.md. A Faz 10 snapshot test compares this
 * composable's output against the v1 MetaHelper so SEO can't regress.
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

export function useSotweMeta(opts: SotweMetaOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const origin = config.public.siteUrl.replace(/\/+$/, '')
  const derivedUrl = `${origin}${route.path || '/'}`.toLowerCase()
  const canonical = (opts.canonical ?? derivedUrl).toLowerCase()
  const robots = (opts.noindex || opts.isSensitive) ? 'noindex' : undefined

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogImage: opts.image,
    ogUrl: canonical,
    ogType: opts.ogType ?? 'website',
    ogSiteName: config.public.siteName,
    twitterCard: opts.image ? 'summary_large_image' : 'summary',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    twitterImage: opts.image,
    robots,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    script: opts.jsonLd
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify(opts.jsonLd),
        }]
      : [],
  })
}
