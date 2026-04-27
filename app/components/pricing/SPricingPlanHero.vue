<script setup lang="ts">
/*
 * Single-plan pricing hero — used on `/pricing` when the backend returns
 * exactly one paid plan (today's Sotwe Premium setup).
 *
 * Borderless layout: there is no card chrome. The page is already
 * framed by the main column (sidebar + right rail draw the borders),
 * so wrapping the offer in another box just stacks lines. We let
 * typography + whitespace do the framing — large centered price,
 * sparse feature list, and the CTA button is the only enclosed
 * element on screen. Cleaner read, fewer distractions.
 *
 * For the multi-plan case `SPricingCard` is still used by the page;
 * the page picks between the two layouts based on `plans.length`.
 */

import type { PaymentSource, SubscriptionPlan } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const props = defineProps<{
  plan: SubscriptionPlan
}>()

const auth = useAuth()
const ui = useUiStore()
const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const { t, te } = useI18n()

const paymentMethodOpen = ref(false)
const loading = ref(false)

const termLabel = computed(() => {
  switch (props.plan.subscriptionTerm) {
    case 'WEEKLY': return t('pricing_card.perWeek')
    case 'MONTHLY': return t('pricing_card.perMonth')
    case 'YEARLY': return t('pricing_card.perYear')
    case 'ONE_TIME':
    default: return t('pricing_card.perOneTime')
  }
})

function featureLabel(code: string): string {
  const key = `pricing_card.features.${code}`
  return te(key) ? t(key) : code
}

// Backend returns the ISO currency code (`usd`, `eur`, `try`, `idr`).
// Map the common ones to a glyph for the hero so the price reads as
// "$3.99" instead of "3.99 USD". Unknown codes fall back to the code
// itself, prefixed, which keeps things parseable for visitors.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TRY: '₺',
  IDR: 'Rp',
}
const currencyCode = computed(() => props.plan.currency.toUpperCase())
const currencySymbol = computed(() => CURRENCY_SYMBOLS[currencyCode.value] ?? currencyCode.value)

// Split the numeric price on the decimal so we can render the cents in
// a smaller superscript-style face — the "$3.⁹⁹" treatment that pricing
// pages use to anchor attention on the integer portion.
const priceParts = computed(() => {
  const [whole, fraction] = String(props.plan.price).split('.')
  return { whole: whole ?? String(props.plan.price), fraction: fraction ?? null }
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
      window.location.href = `https://checkout.sellix.io/invoice/${session.sessionId}`
      return
    }
    if (!config.public.stripeKey) {
      throw new Error(t('pricing_card.stripeNotConfigured'))
    }
    const { loadStripe } = await import('@stripe/stripe-js')
    const stripe = await loadStripe(config.public.stripeKey)
    if (!stripe) throw new Error('Stripe failed to initialise')
    const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId })
    if (error) throw error
  }
  catch (e) {
    toast.add({
      title: t('pricing_card.couldntStart'),
      description: isSotweApiError(e) ? e.message : (e as Error).message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
    loading.value = false
  }
}
</script>

<template>
  <section class="flex flex-col items-center text-center">
    <!-- Plan badge — soft chip, sets product context without a card. -->
    <span class="inline-flex items-center gap-1.5 rounded-full bg-twitter-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-twitter-blue-600 dark:bg-twitter-blue-500/15 dark:text-twitter-blue-300">
      <Icon name="i-lucide-sparkles" class="size-3.5" />
      {{ plan.name }}
    </span>

    <!--
      Price hero. Symbol → integer → cents in a single baseline-aware
      row: the integer dominates, the symbol and cents sit at a smaller
      face so the eye can scan the magnitude in one glance. Term rides
      below in muted copy with the ISO code so visitors know which
      currency they're being charged in.
    -->
    <div class="mt-6 flex items-start justify-center">
      <span
        class="mt-3 text-3xl font-semibold text-twitter-slate-700 sm:mt-4 sm:text-4xl dark:text-twitter-slate-300"
        aria-hidden="true"
      >
        {{ currencySymbol }}
      </span>
      <span class="text-7xl font-bold leading-none tracking-tight text-twitter-slate-950 sm:text-8xl dark:text-twitter-slate-50">
        {{ priceParts.whole }}
      </span>
      <span
        v-if="priceParts.fraction"
        class="mt-3 text-3xl font-bold leading-none text-twitter-slate-700 sm:mt-4 sm:text-4xl dark:text-twitter-slate-300"
      >
        .{{ priceParts.fraction }}
      </span>
    </div>
    <!-- Screen-reader-only price line — keeps "$3.99 USD per month" as
         a single sentence even though the visible markup splits it. -->
    <span class="sr-only">{{ currencySymbol }}{{ plan.price }} {{ currencyCode }} / {{ termLabel }}</span>
    <div class="mt-3 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
      {{ currencyCode }} · {{ termLabel }}
    </div>

    <!-- Single-column feature list. No bullets/dividers — checkmarks +
         consistent spacing carry the rhythm. Left-aligned text inside a
         max-width column keeps long labels from looking ragged. -->
    <ul class="mt-10 flex w-full max-w-sm flex-col gap-3.5 text-left text-base">
      <li
        v-for="f in plan.features"
        :key="f"
        class="flex items-center gap-3"
      >
        <Icon
          name="i-lucide-check"
          class="size-5 shrink-0 text-twitter-blue-500"
        />
        <span class="text-twitter-slate-800 dark:text-twitter-slate-100">{{ featureLabel(f) }}</span>
      </li>
    </ul>

    <!-- CTA — the single framed element on the page. Same column width
         as the feature list so the visual block feels intentional. -->
    <div class="mt-10 flex w-full max-w-sm flex-col gap-3">
      <SButton
        size="xl"
        block
        :loading="loading"
        :disabled="isCurrent"
        @click="startSubscribe"
      >
        {{ isCurrent ? t('pricing_card.currentPlan') : t('pricing_card.subscribe') }}
      </SButton>
      <p class="flex items-center justify-center gap-1.5 text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
        <Icon name="i-lucide-shield-check" class="size-3.5" />
        {{ t('pricing_card.cancelAnytime') }}
      </p>
    </div>

    <SPaymentMethodDialog
      v-model="paymentMethodOpen"
      @selected="pay"
    />
  </section>
</template>
