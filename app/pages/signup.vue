<script setup lang="ts">
/*
 * Signup placeholder (`/signup`). Real 3-step flow (credentials → OTP →
 * profile) wires up in Faz 6 via useSignupStore() + recaptcha.
 */

useSotweMeta({
  title: 'Create account · Sotwe',
  description: 'Create a Sotwe account.',
  noindex: true,
})
</script>

<template>
  <STopBar title="Create account" :show-back="true" />
  <section class="mx-auto flex max-w-sm flex-col gap-4 px-4 py-8">
    <SLogo :size="40" class="mx-auto" />
    <h1 class="text-center text-2xl font-bold">Join Sotwe</h1>
    <p class="text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      Full signup flow ships in Faz 6.
    </p>
    <SButton to="/login" variant="outline" block>Back to sign in</SButton>
  </section>
</template>
