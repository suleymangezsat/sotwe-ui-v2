<script setup lang="ts">
useSotweMeta({
  title: 'Payment failed · Sotwe',
  description: 'Checkout was not completed.',
  noindex: true,
})
</script>

<template>
  <STopBar title="Payment" :show-back="true" :as="'h2'" />
  <section class="flex flex-col items-center gap-4 px-4 py-16 text-center">
    <Icon name="i-lucide-circle-x" class="size-16 text-red-500" />
    <h1 class="text-2xl font-bold">Something went wrong</h1>
    <p class="text-twitter-slate-500 dark:text-twitter-slate-400 max-w-md">
      Your payment didn't go through. Please try again.
    </p>
    <SButton to="/pricing" block>Try again</SButton>
  </section>
</template>
