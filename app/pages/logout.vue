<script setup lang="ts">
/*
 * Logout — clear the auth cookie client-side, then bounce home. Faz 7
 * swaps this with sidebase/nuxt-auth's signOut().
 */

definePageMeta({ layout: false })

if (import.meta.client) {
  const token = useCookie('sotwe-access-token')
  token.value = null
  const refresh = useCookie('sotwe-refresh-token')
  refresh.value = null
  navigateTo('/', { replace: true })
}

useSeoMeta({ title: 'Signing out · Sotwe', robots: 'noindex' })
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
    <Icon name="i-lucide-loader-circle" class="size-8 animate-spin text-twitter-blue-500" />
  </main>
</template>
