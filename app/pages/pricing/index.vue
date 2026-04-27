<script setup lang="ts">
/*
 * Pricing / Premium — public subscription plan list.
 *
 * The page picks one of two layouts based on how many paid plans the
 * backend returns:
 *
 *   1 plan   → `SPricingPlanHero` — full-width hero with two-column
 *              feature grid. Today this is the actual production case
 *              (Sotwe Premium is the single offering).
 *   2+ plans → original `SPricingCard` grid with the highest-priority
 *              card flagged as "Recommended". Kept around so a future
 *              tiered rollout (Pro / Premium / etc.) doesn't need a
 *              page rewrite.
 *
 * Both layouts share the same checkout flow:
 *   subscribe → SPaymentMethodDialog → Stripe / Sellix redirect →
 *   /pricing/{source}/success?session_id=… → verify endpoint.
 *
 * SEO note: this page is publicly indexable (no `noindex`). The h1
 * "Sotwe Premium" is the page subject; the topbar title demotes to h2.
 */

const { data: plans } = await useAsyncData(
  'plans',
  () => useApi().subscriptions.list(),
  { default: () => [] },
)

// /pricing only shows plans the visitor can actually subscribe to —
// priority-0 (Free) is the default tier the backend assigns on signup,
// so a "Subscribe" CTA there is meaningless. Sort by priority descending
// so the most prominent plan sits first.
const sortedPlans = computed(() =>
  [...(plans.value || [])]
    .filter(p => p.priority > 0)
    .sort((a, b) => b.priority - a.priority),
)
const recommendedId = computed(() => sortedPlans.value[0]?.id)
const isSinglePlan = computed(() => sortedPlans.value.length === 1)

const { t } = useI18n()
useSotweMeta({
  title: t('pricing.meta.title'),
  description: t('pricing.meta.description'),
})
</script>

<template>
  <STopBar :title="t('navigation.pricing')" :show-back="true" :as="'h2'" />
  <section class="px-4 py-6 sm:px-6 sm:py-10">
    <header class="mx-auto max-w-3xl text-center">
      <h1 class="text-3xl font-bold sm:text-4xl">{{ t('pricing_page.heading') }}</h1>
      <p class="mx-auto mt-3 max-w-xl text-sm text-twitter-slate-500 sm:text-base dark:text-twitter-slate-400">
        {{ t('pricing_page.subhead') }}
      </p>
    </header>

    <!-- Single-plan layout — one prominent hero card. -->
    <div
      v-if="isSinglePlan && sortedPlans[0]"
      class="mx-auto mt-8 max-w-3xl sm:mt-10"
    >
      <SPricingPlanHero :plan="sortedPlans[0]" />
    </div>

    <!-- Multi-plan layout — grid kept as-is for the future tier rollout. -->
    <ul
      v-else-if="sortedPlans.length"
      class="mt-8 grid gap-6 md:grid-cols-2"
    >
      <li v-for="plan in sortedPlans" :key="plan.id">
        <SPricingCard :plan="plan" :recommended="plan.id === recommendedId" />
      </li>
    </ul>

    <!-- Empty state — backend returned no paid plans. -->
    <p
      v-else
      class="mx-auto mt-8 max-w-md rounded-lg border border-twitter-slate-100 bg-twitter-slate-50 p-4 text-center text-sm text-twitter-slate-500 dark:border-twitter-slate-700 dark:bg-twitter-slate-900 dark:text-twitter-slate-400"
    >
      {{ t('pricing_page.noPlans') }}
    </p>
  </section>
</template>
