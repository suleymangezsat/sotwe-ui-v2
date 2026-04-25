<script setup lang="ts">
/*
 * Mobile bottom navigation — replaces the sidebar below md breakpoint.
 * 5 items (Twitter convention); the rest live under "More" in the sidebar
 * which is invisible on mobile (use the Explore search).
 */

const items = [
  { label: 'Home', to: '/', icon: 'i-lucide-house' },
  { label: 'Nearby', to: '/me/nearby', icon: 'i-lucide-map-pin' },
  { label: 'Bookmarks', to: '/me/bookmarks', icon: 'i-lucide-bookmark' },
  { label: 'Profile', to: '/me/profile', icon: 'i-lucide-user-round' },
  { label: 'Premium', to: '/pricing', icon: 'i-lucide-badge-check' },
]

const route = useRoute()
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-twitter-slate-100 bg-white/90 backdrop-blur md:hidden dark:border-twitter-slate-700 dark:bg-black/90"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :aria-label="item.label"
      :class="[
        'flex flex-1 items-center justify-center',
        route.path === item.to || route.path.startsWith(item.to + '/')
          ? 'text-twitter-slate-950 dark:text-twitter-slate-100'
          : 'text-twitter-slate-500 dark:text-twitter-slate-400',
      ]"
    >
      <Icon :name="item.icon" class="size-6" />
    </NuxtLink>
  </nav>
</template>
