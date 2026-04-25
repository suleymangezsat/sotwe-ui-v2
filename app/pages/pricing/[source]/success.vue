<script setup lang="ts">
/*
 * Post-checkout landing — `/pricing/:source/success`.
 * `source` is the payment processor (`stripe` / `sellix`). Each processor
 * redirects back with its own query payload (Stripe: session_id, Sellix:
 * invoice_id) that the matching `/me/subscription/payment/:source/verify*`
 * backend endpoint consumes. Faz 6's PricingCard will call verify on mount.
 */

const route = useRoute()
const source = computed(() => String(route.params.source || '').toLowerCase())

useSotweMeta({
  title: 'Payment successful · Sotwe',
  description: 'Thanks for subscribing.',
  noindex: true,
})
</script>

<template>
  <STopBar title="Payment" :show-back="true" />
  <section class="flex flex-col items-center gap-4 px-4 py-16 text-center">
    <Icon name="i-lucide-circle-check" class="size-16 text-twitter-blue-500" />
    <h1 class="text-2xl font-bold">You're all set</h1>
    <p class="text-twitter-slate-500 dark:text-twitter-slate-400 max-w-md">
      Your {{ source }} subscription is active. Enjoy Sotwe Premium.
    </p>
    <SButton to="/" block>Back home</SButton>
  </section>
</template>
