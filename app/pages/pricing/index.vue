<script setup lang="ts">
/*
 * Pricing / Premium — public subscription plan list. Each plan is a
 * SPricingCard which owns its own subscribe → SPaymentMethodDialog →
 * Stripe / Sellix redirect flow. The page itself is intentionally thin:
 * fetch plans, sort by priority, mark the highest-priority paid plan as
 * "Recommended", and render the cards.
 *
 * SEO note: this page is publicly indexable (no `noindex`) so the plans
 * list shows up in search. The h1 "Sotwe Premium" is the page subject;
 * the topbar title demotes to h2.
 */

const { data: plans } = await useAsyncData(
  'plans',
  () => useApi().subscriptions.list(),
  { default: () => [] },
)

// /pricing only shows plans the visitor can actually subscribe to —
// priority-0 (Free) is the default tier the backend assigns on signup,
// so a "Subscribe" CTA there is meaningless. Sort by priority descending
// so "Recommended" sits at the top of the grid.
const sortedPlans = computed(() =>
  [...(plans.value || [])]
    .filter(p => p.priority > 0)
    .sort((a, b) => b.priority - a.priority),
)
const recommendedId = computed(() => sortedPlans.value[0]?.id)

useSotweMeta({
  title: 'Premium · Sotwe',
  description: 'Remove ads, unlock early access, and support Sotwe.',
})
</script>

<template>
  <STopBar title="Premium" :show-back="true" :as="'h2'" />
  <section class="px-4 py-6">
    <h1 class="text-2xl font-bold">Sotwe Premium</h1>
    <p class="mt-2 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      Remove ads, unlock high-resolution media downloads, and support
      Sotwe. Cancel any time — your subscription stays active until the
      end of the current period.
    </p>

    <ul class="mt-8 grid gap-6 md:grid-cols-2">
      <li v-for="plan in sortedPlans" :key="plan.id">
        <SPricingCard :plan="plan" :recommended="plan.id === recommendedId" />
      </li>
    </ul>

    <p
      v-if="!sortedPlans.length"
      class="mt-8 rounded-lg border border-twitter-slate-100 bg-twitter-slate-50 p-4 text-center text-sm text-twitter-slate-500 dark:border-twitter-slate-700 dark:bg-twitter-slate-900 dark:text-twitter-slate-400"
    >
      No plans are available right now. Please check back later.
    </p>
  </section>
</template>
