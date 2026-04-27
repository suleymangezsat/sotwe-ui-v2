<script setup lang="ts">
/*
 * Single subscription plan card — port of v1
 * `components/pricing/PricingCard.vue`. Renders the plan's price, feature
 * list, and a "Subscribe" button that:
 *
 *   1. opens SPaymentMethodDialog so the visitor picks Stripe vs Sellix
 *   2. POSTs `/me/subscription/payment/{source}/{planId}` to mint a session
 *   3. for Stripe → loads `@stripe/stripe-js` and calls
 *      `redirectToCheckout({ sessionId })`
 *   4. for Sellix → `window.location.href` to the Sellix invoice
 *
 * Auth-required: an unauthed click pops the global SLoginDialog instead of
 * navigating to the checkout. After successful checkout the visitor lands
 * on `/pricing/{source}/success?session_id=…` which calls the verify
 * endpoint and refreshes `useAuth().user` so the badge / banner reflects
 * the new tier.
 */

import type { PaymentSource, SubscriptionPlan } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const props = defineProps<{
  plan: SubscriptionPlan
  /** Mark this card as the "recommended" plan (gets a primary border + tag). */
  recommended?: boolean
}>()

const auth = useAuth()
const ui = useUiStore()
const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const paymentMethodOpen = ref(false)
const loading = ref(false)

const termLabel = computed(() => {
  switch (props.plan.subscriptionTerm) {
    case 'WEEKLY': return 'week'
    case 'MONTHLY': return 'month'
    case 'YEARLY': return 'year'
    case 'ONE_TIME':
    default: return 'one-time'
  }
})

const isCurrent = computed(() =>
  auth.user.value?.subscription?.id === props.plan.id,
)

function startSubscribe() {
  if (loading.value) return

  if (!auth.isAuthenticated.value) {
    ui.loginDialog.props = { redirect: route.fullPath }
    ui.loginDialog.display = true
    return
  }
  paymentMethodOpen.value = true
}

async function pay(source: PaymentSource) {
  paymentMethodOpen.value = false
  loading.value = true
  try {
    const session = await useApi().me.createPaymentSession(source, props.plan.id)

    if (source === 'sellix') {
      // Sellix doesn't expose a JS SDK; the invoice URL is deterministic.
      window.location.href = `https://checkout.sellix.io/invoice/${session.sessionId}`
      return
    }

    // Stripe: lazy-load the SDK so visitors who never click subscribe
    // don't pay for it.
    if (!config.public.stripeKey) {
      throw new Error('Stripe is not configured (NUXT_PUBLIC_STRIPE_KEY missing)')
    }
    const { loadStripe } = await import('@stripe/stripe-js')
    const stripe = await loadStripe(config.public.stripeKey)
    if (!stripe) throw new Error('Stripe failed to initialise')
    const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId })
    if (error) throw error
  }
  catch (e) {
    toast.add({
      title: 'Could not start checkout',
      description: isSotweApiError(e) ? e.message : (e as Error).message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
    loading.value = false
  }
  // Note: on success the redirect already navigated us away — no
  // `loading.value = false` needed in the happy path.
}
</script>

<template>
  <div
    class="relative flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-shadow dark:bg-twitter-slate-950"
    :class="recommended
      ? 'border-twitter-blue-500 shadow-twitter-blue-100 dark:shadow-none ring-1 ring-twitter-blue-200 dark:ring-twitter-blue-900'
      : 'border-twitter-slate-100 dark:border-twitter-slate-700'"
  >
    <span
      v-if="recommended"
      class="absolute -top-3 left-5 rounded-full bg-twitter-blue-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
    >
      Recommended
    </span>

    <div class="flex items-baseline justify-between gap-3">
      <h3 class="text-lg font-bold">{{ plan.name }}</h3>
      <div class="text-right">
        <div class="text-2xl font-bold text-twitter-blue-500">
          {{ plan.price }} {{ plan.currency }}
        </div>
        <div class="text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
          / {{ termLabel }}
        </div>
      </div>
    </div>

    <p
      v-if="plan.description"
      class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400"
    >
      {{ plan.description }}
    </p>

    <ul class="flex flex-col gap-1.5 text-sm">
      <li v-for="f in plan.features" :key="f" class="flex items-center gap-2">
        <Icon name="i-lucide-check" class="size-4 shrink-0 text-twitter-blue-500" />
        {{ f }}
      </li>
    </ul>

    <SButton
      block
      :loading="loading"
      :disabled="isCurrent"
      :variant="recommended ? 'solid' : 'outline'"
      @click="startSubscribe"
    >
      {{ isCurrent ? 'Current plan' : 'Subscribe' }}
    </SButton>

    <SPaymentMethodDialog
      v-model="paymentMethodOpen"
      @selected="pay"
    />
  </div>
</template>
