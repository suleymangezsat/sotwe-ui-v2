<script setup lang="ts">
/*
 * Post-checkout landing — `/pricing/:source/success`.
 *
 * `source` is the payment processor (`stripe` / `sellix`). Each provider
 * redirects back here with its own session id query param (Stripe:
 * `session_id`, Sellix: `invoice_id`). We POST to the matching
 * `/me/subscription/payment/{source}/verify?sessionId=…` so the backend
 * can confirm the charge cleared, attach the new subscription to the
 * user, and return the fresh `UserSubscription`.
 *
 * If the redirect drops the query (mobile Safari sometimes strips them
 * on intent handoff) we fall back to `verify_last`, which finds the
 * most recent in-flight payment for the authed user.
 *
 * After verify resolves we call `auth.fetchUser()` so the toolbar /
 * profile page badges flip to "Premium" without a hard reload.
 */

import type { PaymentSource, UserSubscription } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const auth = useAuth()

const source = computed<PaymentSource>(() => {
  const s = String(route.params.source || '').toLowerCase()
  return s === 'sellix' ? 'sellix' : 'stripe'
})
const sessionId = computed(() =>
  (route.query.session_id || route.query.sessionId || route.query.invoice_id) as string | undefined,
)

const status = ref<'verifying' | 'ok' | 'error'>('verifying')
const subscription = ref<UserSubscription | undefined>(undefined)
const errorMessage = ref<string | undefined>(undefined)

const { t } = useI18n()
useSotweMeta({
  title: t('payment_success.metaTitle'),
  description: t('payment_success.metaDescription'),
  noindex: true,
})

const processorLabel = computed(() => source.value === 'stripe' ? 'Stripe' : 'Sellix')

onMounted(async () => {
  try {
    const res = sessionId.value
      ? await useApi().me.verifyPayment(source.value, sessionId.value)
      : await useApi().me.verifyLastPayment(source.value)
    subscription.value = res
    await auth.fetchUser()
    status.value = 'ok'
  }
  catch (e) {
    errorMessage.value = isSotweApiError(e) ? e.message : (e as Error).message
    status.value = 'error'
  }
})
</script>

<template>
  <STopBar :title="t('payment_success.topBarTitle')" :show-back="true" :as="'h2'" />
  <section class="flex flex-col items-center gap-4 px-4 py-16 text-center">
    <template v-if="status === 'verifying'">
      <Icon name="i-lucide-loader-circle" class="size-10 animate-spin text-twitter-blue-500" />
      <h1 class="text-2xl font-bold">{{ t('payment_success.confirming') }}</h1>
      <p class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('payment_success.hangTight', { processor: processorLabel }) }}
      </p>
    </template>

    <template v-else-if="status === 'ok'">
      <Icon name="i-lucide-circle-check" class="size-16 text-twitter-blue-500" />
      <h1 class="text-2xl font-bold">{{ t('payment_success.allSet') }}</h1>
      <p class="max-w-md text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('payment_success.welcome', { plan: subscription?.name || t('payment_success.premiumFallback') }) }}
      </p>
      <SButton to="/" block>{{ t('payment_success.backHome') }}</SButton>
    </template>

    <template v-else>
      <Icon name="i-lucide-alert-triangle" class="size-16 text-amber-500" />
      <h1 class="text-2xl font-bold">{{ t('payment_fail.heading') }}</h1>
      <p v-if="errorMessage" class="max-w-md text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p class="max-w-md text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('payment_fail.footer', { email: 'contact@sotwe.com' }) }}
      </p>
      <SButton to="/pricing" block>{{ t('payment_fail.back') }}</SButton>
    </template>
  </section>
</template>
