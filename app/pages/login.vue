<script setup lang="ts">
/*
 * Login (`/login`). Faz 7 will swap the inline local + Google flow with
 * sidebase/nuxt-auth's `signIn()` call. Root-level route to match the
 * v1 URL scheme (`/login`, not `/auth/login`) — existing backlinks +
 * search index entries assume this path.
 */

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | undefined>(undefined)

const route = useRoute()
const redirect = computed(() => (route.query.redirect as string | undefined) || '/')

useSotweMeta({
  title: 'Sign in · Sotwe',
  description: 'Sign in to Sotwe.',
  noindex: true,
})

async function submit() {
  loading.value = true
  errorMessage.value = undefined
  try {
    await useApi().auth.login({ email: email.value, password: password.value })
    navigateTo(redirect.value)
  }
  catch (e) {
    errorMessage.value = (e as Error).message || 'Sign-in failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <STopBar title="Sign in" :show-back="true" />
  <section class="mx-auto flex max-w-sm flex-col gap-4 px-4 py-8">
    <SLogo :size="40" class="mx-auto" />
    <h1 class="text-center text-2xl font-bold">Sign in to Sotwe</h1>

    <UForm :state="{ email, password }" class="flex flex-col gap-4" @submit="submit">
      <UFormField name="email" label="Email">
        <UInput v-model="email" type="email" autocomplete="email" :ui="{ base: 'w-full' }" />
      </UFormField>
      <UFormField name="password" label="Password">
        <UInput v-model="password" type="password" autocomplete="current-password" :ui="{ base: 'w-full' }" />
      </UFormField>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      <SButton block :loading="loading" type="submit">Sign in</SButton>
    </UForm>

    <div class="flex items-center justify-between text-sm">
      <NuxtLink to="/signup" class="text-twitter-blue-500 hover:underline">Create account</NuxtLink>
      <button class="text-twitter-slate-500 hover:underline">Forgot password</button>
    </div>
  </section>
</template>
