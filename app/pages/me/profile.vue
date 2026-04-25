<script setup lang="ts">
/*
 * Signed-in user's own profile — edit bio, unlink socials, change password,
 * cancel subscription, delete account. Auth-required.
 */

definePageMeta({ middleware: 'auth' })

const { data: profile } = await useAsyncData('me-profile', () => useApi().me.profile())

useSotweMeta({
  title: 'Profile · Sotwe',
  description: 'Manage your Sotwe account.',
  noindex: true,
})
</script>

<template>
  <STopBar title="Profile" />

  <section v-if="profile" class="px-4 py-6">
    <div class="flex items-center gap-3">
      <UAvatar :src="profile.profilePic || undefined" :alt="profile.name" size="xl" class="ring-1 ring-twitter-slate-100 dark:ring-twitter-slate-700" />
      <div>
        <div class="text-xl font-bold">{{ profile.name }}</div>
        <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          @{{ profile.username }}
        </div>
        <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          {{ profile.email }}
        </div>
      </div>
    </div>

    <div v-if="profile.subscription" class="mt-6 rounded-2xl border border-twitter-blue-200 bg-twitter-blue-50 p-4 dark:border-twitter-blue-700 dark:bg-twitter-blue-950">
      <div class="flex items-center gap-2 font-bold">
        <Icon name="i-lucide-badge-check" class="size-5 text-twitter-blue-500" />
        {{ profile.subscription.name }}
      </div>
      <p class="mt-1 text-sm text-twitter-slate-600 dark:text-twitter-slate-300">
        {{ profile.subscription.description }}
      </p>
    </div>

    <p class="mt-6 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      Profile editing, password change, and account deletion arrive in Faz 6
      once the auth-dependent forms are ported.
    </p>
  </section>
</template>
