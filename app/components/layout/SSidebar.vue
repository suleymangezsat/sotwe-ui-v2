<script setup lang="ts">
/*
 * Left sidebar — Twitter-style vertical navigation.
 *
 * Desktop: fixed ~275px column, sticky. Icons + labels.
 * Tablet (md..lg): icons only (64px), labels hidden.
 * Mobile (< md): hidden — SBottomNav is rendered instead from default.vue.
 *
 * Auth-aware items (Bookmarks, Profile, Pricing/Premium) are always visible;
 * they just route to /auth/login if the visitor isn't signed in. Sidebase's
 * auth middleware (Faz 7) enforces this.
 */

interface NavItem {
  label: string
  to: string
  icon: string
  iconActive?: string
  exact?: boolean
}

const { t } = useI18n()

// URLs mirror v1's app/router.js exactly — sotwe.com/me/* for authed user
// pages, sotwe.com/pricing for premium, and a root-level Sotwe logo for
// the home trends feed. No explicit /trends item in the sidebar: v1 used
// `/` itself as the trends overview (CF-IPCountry default).
const items = computed<NavItem[]>(() => [
  { label: t('navigation.home'), to: '/', icon: 'i-lucide-house', exact: true },
  { label: t('navigation.nearby'), to: '/me/nearby', icon: 'i-lucide-map-pin' },
  { label: t('navigation.myBookmarks'), to: '/me/bookmarks', icon: 'i-lucide-bookmark' },
  { label: t('navigation.myProfile'), to: '/me/profile', icon: 'i-lucide-user-round' },
  { label: t('navigation.pricing'), to: '/pricing', icon: 'i-lucide-badge-check' },
])

const route = useRoute()
function isActive(item: NavItem) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

const moreItems = computed(() => [
  [
    { label: t('navigation.about'), icon: 'i-lucide-info', to: '/about' },
    { label: t('navigation.termsOfService'), icon: 'i-lucide-file-text', to: '/terms-of-service' },
    { label: t('navigation.privacyPolicy'), icon: 'i-lucide-shield', to: '/privacy-policy' },
    { label: t('navigation.refundPolicy'), icon: 'i-lucide-receipt', to: '/delivery-refund-terms' },
  ],
])
</script>

<template>
  <aside
    class="sticky top-0 hidden h-dvh flex-col items-center gap-1 px-2 py-3 md:flex xl:items-stretch xl:px-4"
  >
    <div class="mb-1 flex items-center xl:h-14 xl:px-3">
      <SLogo :size="30" :compact="true" class="xl:hidden" />
      <SLogo :size="30" class="hidden xl:inline-flex" />
    </div>

    <nav class="flex flex-col items-center gap-1 xl:items-stretch">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :class="[
          'group flex items-center gap-4 rounded-full text-xl transition-colors',
          'px-3 py-3 xl:py-2.5',
          'hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900',
          isActive(item)
            ? 'font-bold text-twitter-slate-950 dark:text-twitter-slate-100'
            : 'text-twitter-slate-700 dark:text-twitter-slate-200',
        ]"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <Icon :name="item.icon" class="size-7 shrink-0" />
        <span class="hidden xl:inline">{{ item.label }}</span>
      </NuxtLink>

      <SMenu :items="moreItems" :aria-label="t('common.more')">
        <button
          type="button"
          class="group flex items-center gap-4 rounded-full px-3 py-3 text-xl text-twitter-slate-700 transition-colors hover:bg-twitter-slate-50 xl:py-2.5 dark:text-twitter-slate-200 dark:hover:bg-twitter-slate-900"
        >
          <Icon name="i-lucide-ellipsis" class="size-7 shrink-0" />
          <span class="hidden xl:inline">{{ t('common.more') }}</span>
        </button>
      </SMenu>
    </nav>

    <div class="mt-auto hidden items-center justify-between gap-2 border-t border-twitter-slate-100 pt-3 xl:flex dark:border-twitter-slate-700">
      <SThemeToggle />
      <SButton variant="outline" size="sm" to="/login">{{ t('auth.signIn') }}</SButton>
    </div>

    <div class="mt-auto flex flex-col items-center gap-2 xl:hidden">
      <SThemeToggle />
    </div>
  </aside>
</template>
