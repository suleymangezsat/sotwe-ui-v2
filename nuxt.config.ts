// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // DevTools overlay + Vue Tracer are injected into <body> after hydration
  // and briefly force a body-level reflow that shifts the right rail
  // ~30px before settling. Disable them by default — re-enable locally
  // via `NUXT_DEVTOOLS=1 npm run dev` when you actually need the panel.
  devtools: { enabled: process.env.NUXT_DEVTOOLS === '1' },

  // SSR is non-negotiable: sotwe.com lives on organic search and all primary
  // content (tweets, users, trends) must be present in the initial HTML.
  ssr: true,

  future: {
    compatibilityVersion: 4,
  },

  srcDir: 'app/',
  serverDir: 'server/',

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  css: ['~/assets/css/main.css'],

  // We name components with a deliberate `S*` (Sotwe) prefix, so we turn
  // OFF Nuxt's folder-derived prefix. Without this, `components/layout/
  // SSidebar.vue` auto-imports as `LayoutSSidebar`, silently 404ing when a
  // template uses `<SSidebar />` and Vue falls back to rendering nothing.
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/layout', pathPrefix: false },
    { path: '~/components/tweet', pathPrefix: false },
    { path: '~/components/trend', pathPrefix: false },
    { path: '~/components/promo', pathPrefix: false },
    { path: '~/components/rail', pathPrefix: false },
    { path: '~/components/form', pathPrefix: false },
    { path: '~/components/auth', pathPrefix: false },
    { path: '~/components/dialog', pathPrefix: false },
    { path: '~/components/user', pathPrefix: false },
    { path: '~/components/pricing', pathPrefix: false },
    { path: '~/components' },
  ],

  // Site defaults to light (X-style), with a manual toggle in the toolbar
  // that persists the user's choice in a cookie. Cookie storage (not
  // localStorage) is critical: it lets SSR render in the right theme on
  // first paint, so the toggle button doesn't need to be wrapped in
  // <ClientOnly> (which would cause a layout shift at hydration).
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'sotwe-color-mode',
    storage: 'cookie',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, minimum-scale=1',
      meta: [
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#000000', media: '(prefers-color-scheme: dark)' },
        { name: 'format-detection', content: 'telephone=no' },
        // Twitter's video CDN (video-s.twimg.com) 403s any Referer that
        // isn't empty or `https://x.com/...`. Chrome does NOT honour
        // `<video referrerpolicy="no-referrer">` for media range
        // requests, so we strip the header document-wide. Our backend
        // (proxied through `/api/**`) ignores Referer, and image CDNs
        // (`pbs.twimg.com`) serve without it.
        { name: 'referrer', content: 'no-referrer' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  runtimeConfig: {
    // Server-only — SSR fetches hit this directly (no Cloudflare, no captcha).
    // Prod PM2 env overrides to the internal-network backend address.
    privateApiUrl: process.env.NUXT_PRIVATE_API_URL || 'http://161.35.240.135/',
    public: {
      siteName: 'Sotwe',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.sotwe.com',
      // Dev defaults to the relative `/api` path which Nitro's devProxy
      // forwards to the backend IP. Avoids both CORS and the Cloudflare
      // captcha that guards https://www.sotwe.com/api. Prod overrides this
      // via NUXT_PUBLIC_API_URL to the canonical public URL.
      apiUrl: process.env.NUXT_PUBLIC_API_URL
        || (process.env.NODE_ENV === 'production' ? 'https://www.sotwe.com/api' : '/api'),
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || 'G-HFT3KBFRDE',
      yandexMetricaId: process.env.NUXT_PUBLIC_YANDEX_METRICA_ID || '88678119',
      googleAuthClientId: process.env.NUXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID || '',
      stripeKey: process.env.NUXT_PUBLIC_STRIPE_KEY || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      adsEnabled: process.env.NUXT_PUBLIC_ADS_ENABLED !== 'false',
      sweetdreamEnabled: process.env.NUXT_PUBLIC_SWEETDREAM_ENABLED !== 'false',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },

  // Route-level cache hints. Public pages set a short `cache-control` that
  // the Cloudflare worker (see sotwe-ui/cf_worker.js) consumes — CF is the
  // caching tier, not Nitro. We deliberately DON'T use Nitro's `swr` because
  // its default filesystem storage collides on root-level keys.
  // Per-user or auth routes must bypass CF.
  //
  // URL paths mirror v1's `app/router.js` exactly.
  routeRules: {
    '/': { headers: { 'cache-control': 'public, max-age=0, s-maxage=60' } },
    '/about': { headers: { 'cache-control': 'public, max-age=0, s-maxage=3600' } },
    '/terms-of-service': { headers: { 'cache-control': 'public, max-age=0, s-maxage=3600' } },
    '/privacy-policy': { headers: { 'cache-control': 'public, max-age=0, s-maxage=3600' } },
    '/delivery-refund-terms': { headers: { 'cache-control': 'public, max-age=0, s-maxage=3600' } },
    '/tweet/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300' } },
    '/hashtag/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=120' } },
    '/location/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=120' } },
    '/search/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=60' } },
    '/trends/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=60' } },
    '/me/**': { headers: { 'cache-control': 'no-store' } },
    '/pricing/**': { headers: { 'cache-control': 'no-store' } },
    '/auth/**': { headers: { 'cache-control': 'no-store' } },
    '/login': { headers: { 'cache-control': 'no-store' } },
    '/signup': { headers: { 'cache-control': 'no-store' } },
    '/logout': { headers: { 'cache-control': 'no-store' } },
    '/dev/**': { headers: { 'cache-control': 'no-store, x-robots-tag: noindex' } },
    // Same-origin API proxy. In local dev / `nuxt preview` the browser's
    // client-side `$fetch` hits `/api/...` (same origin) and Nitro forwards
    // to the real backend. Prod deploys never reach this rule — the
    // Cloudflare worker routes `/api/*` to the backend first.
    '/api/**': {
      proxy: `${(process.env.NUXT_PRIVATE_API_URL || 'http://161.35.240.135/').replace(/\/+$/, '')}/**`,
    },

    // `/:username` (root-level profile) falls through to the default below —
    // treated as a user page with 120s CDN cache. Single-segment routes that
    // we own (`/about`, `/login`, …) override this via their explicit rule.
    '/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=120' } },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    // Keep CF-specific request headers reaching us (cf-ipcountry, cf-connecting-ip).
    routeRules: {},
    // Dev-only reverse proxy: client-side fetches to `/api/...` land on the
    // real backend without CORS preflight noise. Unused in production
    // (where NUXT_PUBLIC_API_URL points at the canonical Cloudflare URL).
    // We strip the leading `/api` prefix — the backend roots are `/v3/*`
    // / `/me/*` / etc., not `/api/v3/*`.
    // `rewrite` is a runtime-supported httpxy option but isn't in Nitro's
    // typed surface, hence the ts-expect-error.
    devProxy: {
      '/api': {
        target: (process.env.NUXT_PRIVATE_API_URL || 'http://161.35.240.135/').replace(/\/+$/, ''),
        changeOrigin: true,
        // @ts-expect-error runtime accepts the rewrite fn
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },

  experimental: {
    // Payload extraction would turn SSR pages into static snapshots on
    // deploy; that breaks dynamic SSR and is incompatible with 1.5M daily
    // dynamic requests. Keep it off.
    payloadExtraction: false,
  },

  icon: {
    // Inline SVGs both at SSR and in the client bundle:
    //   - `serverBundle: 'local'` loads from the installed @iconify-json/*
    //     packages (no remote iconify.design fetch at SSR time).
    //   - `clientBundle.scan: true` scans `app/` at build time for
    //     `i-<coll>-<name>` class strings and bundles only those, so the
    //     client never falls back to a runtime `/api/_nuxt_icon/...` request
    //     (which is what triggered the "failed to load icon" warnings).
    mode: 'svg',
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },

  image: {
    format: ['webp', 'avif'],
    screens: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  ui: {
    // Populated in app/app.config.ts
  },

  // Auto-import `use*Store` composables from app/stores/** so layouts +
  // pages don't have to import each one. `srcDir` is app/, so `stores/**`
  // resolves to `app/stores/**`.
  imports: {
    dirs: ['stores/**'],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  alias: {
    '~shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  vite: {
    build: {
      // Default chunk size warning is 500kb — a few of our components (SweetDream)
      // are legitimately large, quiet the warnings but don't disable splitting.
      chunkSizeWarningLimit: 1000,
    },
  },
})
