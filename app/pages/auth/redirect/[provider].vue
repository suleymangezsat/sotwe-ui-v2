<script setup lang="ts">
/*
 * OAuth callback — `/auth/redirect/:provider` (v1 URL scheme). The only
 * provider wired today is `google`; we branch on `provider` so future
 * social sources (twitter, apple, ...) can slot in without a new route.
 * Faz 7 swaps the inline call for sidebase/nuxt-auth's social flow.
 */

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Signing in · Sotwe',
  robots: 'noindex',
})

const route = useRoute()
const provider = computed(() => String(route.params.provider || '').toLowerCase())
const loading = ref(true)
const errorMessage = ref<string | undefined>(undefined)

onMounted(async () => {
  const code = route.query.code as string | undefined
  if (!code) {
    errorMessage.value = 'Missing OAuth code'
    loading.value = false
    return
  }
  try {
    if (provider.value === 'google') {
      await useApi().auth.google({ code })
    }
    else {
      throw new Error(`Unsupported provider: ${provider.value}`)
    }
    navigateTo('/')
  }
  catch (e) {
    errorMessage.value = (e as Error).message || 'Social sign-in failed'
    loading.value = false
  }
})
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
    <div class="flex flex-col items-center gap-4">
      <Icon v-if="loading" name="i-lucide-loader-circle" class="size-8 animate-spin text-twitter-blue-500" />
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      <SButton v-if="errorMessage" to="/login" variant="outline">Back to sign in</SButton>
    </div>
  </main>
</template>
