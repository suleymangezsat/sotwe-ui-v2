<script setup lang="ts">
/*
 * Pricing / Premium — public subscription plan list. Stripe checkout is
 * triggered from the PricingCard component (client-only, Faz 6).
 */

const { data: plans } = await useAsyncData('plans', () => useApi().subscriptions.list(), { default: () => [] })

useSotweMeta({
  title: 'Premium · Sotwe',
  description: 'Remove ads, unlock early access, and support Sotwe.',
})
</script>

<template>
  <STopBar title="Premium" :show-back="true" />
  <section class="px-4 py-6">
    <h1 class="text-2xl font-bold">Sotwe Premium</h1>
    <p class="mt-2 text-twitter-slate-500 dark:text-twitter-slate-400">
      Choose a plan. Stripe checkout opens in Faz 6.
    </p>

    <ul class="mt-6 grid gap-4 md:grid-cols-2">
      <li v-for="plan in plans" :key="plan.id">
        <SCard padded>
          <div class="flex items-baseline justify-between">
            <h2 class="text-lg font-bold">{{ plan.name }}</h2>
            <div class="text-twitter-blue-500 font-bold">
              {{ plan.price }} {{ plan.currency }}
              <span class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
                / {{ plan.subscriptionTerm.toLowerCase() }}
              </span>
            </div>
          </div>
          <p class="mt-2 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
            {{ plan.description }}
          </p>
          <ul class="mt-3 space-y-1 text-sm">
            <li v-for="f in plan.features" :key="f" class="flex items-center gap-2">
              <Icon name="i-lucide-check" class="size-4 text-twitter-blue-500" />
              {{ f }}
            </li>
          </ul>
          <SButton class="mt-4" block>Select plan</SButton>
        </SCard>
      </li>
    </ul>
  </section>
</template>
