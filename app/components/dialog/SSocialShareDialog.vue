<script setup lang="ts">
/*
 * Multi-network share dialog — port of v1's `SocialSharingModal.vue`. Used
 * when the visitor clicks "Share" outside a tweet's action row (e.g. on a
 * user profile or a hashtag page) where the inline `SShareButton`
 * dropdown isn't surfaced. Web-share API is preferred when available;
 * otherwise we fall back to this 12-network grid.
 *
 * State:
 *   ui.shareModal.props = {
 *     url:   string  // canonical URL to share
 *     title: string  // social card title / og:title fallback
 *     text?: string  // body text appended where supported (Twitter, WA…)
 *   }
 *
 * Each tile opens an external share popup in a new window — no API call
 * from our side. "Copy link" writes to the clipboard + fires a toast.
 */

const ui = useUiStore()
const toast = useToast()

const open = computed({
  get: () => ui.shareModal.display,
  set: v => (ui.shareModal.display = v),
})

interface ShareProps { url?: string, title?: string, text?: string }
const props = computed<ShareProps>(() => ui.shareModal.props as ShareProps)

const url = computed(() => props.value.url || (import.meta.client ? location.href : ''))
const title = computed(() => props.value.title || 'Sotwe')
const text = computed(() => props.value.text || '')

interface Network {
  id: string
  label: string
  icon: string
  href: (_u: string, _t: string, _txt: string) => string
  color: string
}

const networks: Network[] = [
  { id: 'twitter', label: 'X / Twitter', icon: 'i-simple-icons-x', color: '#000000', href: (u, _t, txt) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(txt)}` },
  { id: 'facebook', label: 'Facebook', icon: 'i-simple-icons-facebook', color: '#1877F2', href: u => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'i-simple-icons-whatsapp', color: '#25D366', href: (u, _t, txt) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${txt} ${u}`.trim())}` },
  { id: 'telegram', label: 'Telegram', icon: 'i-simple-icons-telegram', color: '#229ED9', href: (u, _t, txt) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(txt)}` },
  { id: 'reddit', label: 'Reddit', icon: 'i-simple-icons-reddit', color: '#FF4500', href: (u, t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { id: 'linkedin', label: 'LinkedIn', icon: 'i-simple-icons-linkedin', color: '#0A66C2', href: u => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { id: 'pinterest', label: 'Pinterest', icon: 'i-simple-icons-pinterest', color: '#BD081C', href: (u, t) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(t)}` },
  { id: 'tumblr', label: 'Tumblr', icon: 'i-simple-icons-tumblr', color: '#36465D', href: (u, t) => `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { id: 'line', label: 'Line', icon: 'i-simple-icons-line', color: '#06C755', href: (u, t) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: 'viber', label: 'Viber', icon: 'i-simple-icons-viber', color: '#7360F2', href: (u, _t, txt) => `viber://forward?text=${encodeURIComponent(`${txt} ${u}`.trim())}` },
  { id: 'vk', label: 'VK', icon: 'i-simple-icons-vk', color: '#0077FF', href: (u, t) => `https://vk.com/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { id: 'email', label: 'Email', icon: 'i-lucide-mail', color: '#536471', href: (u, t, txt) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${txt}\n\n${u}`)}` },
]

function shareTo(n: Network) {
  if (!url.value) return
  const target = n.href(url.value, title.value, text.value)
  // viber / mailto use the OS handler; everything else is HTTPS — pop a
  // window so we don't blow away the visitor's current page.
  if (n.id === 'viber' || n.id === 'email') {
    location.href = target
    return
  }
  window.open(target, '_blank', 'noopener,noreferrer,width=600,height=540')
}

async function copyLink() {
  if (!url.value) return
  try {
    await navigator.clipboard.writeText(url.value)
    toast.add({ title: 'Link copied', icon: 'i-lucide-link' })
  }
  catch {
    toast.add({ title: 'Copy failed', color: 'error' })
  }
}
</script>

<template>
  <SDialog v-model="open" title="Share">
    <div class="flex flex-col gap-4">
      <div class="flex items-stretch gap-2 rounded-lg border border-twitter-slate-100 bg-twitter-slate-50 p-1 text-sm dark:border-twitter-slate-700 dark:bg-twitter-slate-900">
        <span class="min-w-0 flex-1 truncate px-2 py-2 font-mono text-xs text-twitter-slate-700 dark:text-twitter-slate-300">
          {{ url }}
        </span>
        <SButton size="sm" variant="solid" icon="i-lucide-copy" @click="copyLink">Copy</SButton>
      </div>

      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="n in networks"
          :key="n.id"
          type="button"
          class="flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
          :aria-label="`Share on ${n.label}`"
          @click="shareTo(n)"
        >
          <span
            class="inline-flex size-10 items-center justify-center rounded-full text-white"
            :style="{ backgroundColor: n.color }"
          >
            <Icon :name="n.icon" class="size-5" />
          </span>
          <span class="text-twitter-slate-700 dark:text-twitter-slate-300">{{ n.label }}</span>
        </button>
      </div>
    </div>
  </SDialog>
</template>
