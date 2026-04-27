<script setup lang="ts">
/*
 * Logout — clear auth cookies + cached user via `useAuth().signOut()`,
 * then bounce home. Kept as a dedicated page (not just a button) so v1's
 * `/logout` deep links continue to work.
 *
 * Faz 7 will swap the body for `signOut({ callbackUrl: '/' })` from
 * `@sidebase/nuxt-auth`.
 */

definePageMeta({ layout: false })

const auth = useAuth()

if (import.meta.client) {
  auth.signOut()
  navigateTo('/', { replace: true })
}

const { t } = useI18n()
useSeoMeta({ title: t('auth_dialog.signingOut'), robots: 'noindex' })
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
    <Icon name="i-lucide-loader-circle" class="size-8 animate-spin text-twitter-blue-500" />
  </main>
</template>
