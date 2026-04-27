<script setup lang="ts">
/*
 * "Download all media" — port of v1 `components/common/DownloadAllButton.vue`.
 * Collects every media URL from the tweets the visitor has scrolled
 * through so far and packages them into a single ZIP that streams to the
 * user's downloads folder.
 *
 * Auth-gated, premium-gated:
 *   - signed-out          → open SLoginDialog (with redirect back here)
 *   - signed-in, free tier (subscription.priority === 0)  → /pricing
 *   - signed-in, premium  → zip download starts immediately
 *
 * Implementation notes:
 *   - We use `client-zip` (~12KB MIT) instead of v1's streamsaver + custom
 *     zip-stream. streamsaver routes the writable stream through a
 *     service worker hosted on a third-party origin (jimmywarting.github
 *     .io) — that's a privacy concern for 1.5M daily visitors and would
 *     trip ad-blockers / corporate proxies. client-zip stays in-page.
 *   - The fetch calls work because the document-level
 *     `<meta name="referrer" content="no-referrer">` (see nuxt.config.ts)
 *     already strips the Referer header that Twitter's video CDN 403s
 *     on. Photo CDNs ignore Referer entirely.
 *   - `urls` is a Set — duplicates collapse so a quote tweet sharing the
 *     same media doesn't get downloaded twice.
 *
 * Faz 8 will optionally swap this for a server-side ZIP endpoint that
 * streams without buffering in browser memory; this client-side path is
 * fine for the typical 10–50 photo case but caps out at a couple hundred
 * MB before tabs start swapping.
 */

import type { MediaEntity, Tweet } from '~shared/types'

const props = defineProps<{
  username: string
  /** Tweets currently loaded in the timeline; recomputed via the parent's
   *  reactive ref so visitors who scroll further get more media in their
   *  zip. Free of duplicates after the Set roundtrip. */
  tweets: Tweet[]
}>()

const auth = useAuth()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()

const loading = ref(false)

function bestVideoUrl(m: MediaEntity): string | undefined {
  const variants = m.videoInfo?.variants?.filter(v => v.type === 'video/mp4') ?? []
  if (!variants.length) return undefined
  return variants.slice().sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]?.url
}

function collectUrls(): string[] {
  const urls = new Set<string>()
  for (const t of props.tweets) {
    for (const m of (t.mediaEntities ?? [])) {
      const url = m.type === 'photo' ? m.mediaURL : bestVideoUrl(m)
      if (url) urls.add(url)
    }
    for (const m of (t.quotedStatus?.mediaEntities ?? [])) {
      const url = m.type === 'photo' ? m.mediaURL : bestVideoUrl(m)
      if (url) urls.add(url)
    }
  }
  return Array.from(urls)
}

function filenameFromUrl(u: string, fallbackIndex: number): string {
  try {
    const url = new URL(u)
    const segments = url.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    return last && last.includes('.') ? last : `media-${fallbackIndex}`
  }
  catch {
    return `media-${fallbackIndex}`
  }
}

async function handleClick() {
  if (loading.value) return

  if (!auth.isAuthenticated.value) {
    ui.loginDialog.props = { redirect: route.fullPath }
    ui.loginDialog.display = true
    return
  }

  // The shared `auth.user` ref is hydrated by the page that needs it
  // (e.g. /me/profile fetches it on mount). On a hard reload of a public
  // user page (/elonmusk) we have a JWT but no profile loaded, so fetch
  // it on demand so the priority gate uses real data instead of falling
  // through the `?? 0` default and accidentally redirecting premium
  // visitors to /pricing.
  if (!auth.user.value) {
    await auth.fetchUser()
  }

  // Free-tier gate matches v1 priority semantics. The backend assigns
  // priority 0 to the free plan; any paid tier bumps it to ≥ 1.
  const priority = auth.user.value?.subscription?.priority ?? 0
  if (priority === 0) {
    router.push('/pricing')
    return
  }

  const urls = collectUrls()
  if (!urls.length) {
    toast.add({
      title: t('download_all.noMedia', { username: props.username }),
      icon: 'i-lucide-alert-circle',
    })
    return
  }

  loading.value = true
  const progressId = String(Date.now())
  toast.add({
    id: progressId,
    title: t('download_all.downloading', { count: urls.length }),
    icon: 'i-lucide-loader-circle',
    duration: 0,
  })

  try {
    // Lazy import keeps the ~12KB client-zip module out of the SSR bundle
    // and the initial page weight — only visitors who actually click pay
    // for it.
    const { downloadZip } = await import('client-zip')

    const inputs = await Promise.all(urls.map(async (u, i) => {
      const res = await fetch(u, { referrerPolicy: 'no-referrer' })
      if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${u}`)
      return { name: filenameFromUrl(u, i), input: res.body || await res.blob() }
    }))

    const blob = await downloadZip(inputs).blob()

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `${props.username}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)

    toast.remove(progressId)
    toast.add({
      title: t('download_all.downloaded', { count: urls.length }),
      icon: 'i-lucide-check',
      color: 'success',
    })
  }
  catch (err) {
    toast.remove(progressId)
    toast.add({
      title: t('download_all.failed'),
      description: (err as Error).message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    type="button"
    :aria-label="t('download_all.ariaLabel', { username })"
    class="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-twitter-slate-200 px-3 text-sm font-semibold transition-colors hover:bg-twitter-slate-50 disabled:cursor-progress disabled:opacity-60 sm:px-4 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900"
    :disabled="loading"
    @click="handleClick"
  >
    <Icon
      :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-download'"
      class="size-5"
      :class="{ 'animate-spin': loading }"
    />
    <!-- Mobile: icon-only fab. Desktop: icon + label. The label hides
         under sm to keep the action row inside the avatar+banner gutter
         on narrow viewports. -->
    <span class="hidden sm:inline">{{ t('download_all.label') }}</span>
  </button>
</template>
