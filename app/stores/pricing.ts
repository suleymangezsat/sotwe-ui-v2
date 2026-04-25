/*
 * Subscription plans + current active subscription for /pricing and the
 * toolbar Premium badge. Stripe checkout is initiated from the PricingCard
 * component (client-only), not here.
 */

import type { SubscriptionPlan, UserSubscription } from '~shared/types'

export const usePricingStore = defineStore('pricing', () => {
  const plans = ref<SubscriptionPlan[]>([])
  const active = ref<UserSubscription | undefined>(undefined)
  const loading = ref(false)
  const error = ref<number | undefined>(undefined)

  async function fetchPlans() {
    loading.value = true; error.value = undefined
    try {
      plans.value = await useApi().subscriptions.list()
    }
    catch (e) {
      error.value = (e as { status?: number }).status ?? 503
    }
    finally {
      loading.value = false
    }
  }

  async function fetchActive() {
    try {
      active.value = await useApi().me.subscription()
    }
    catch {
      active.value = undefined
    }
  }

  async function cancelRenewal(reason?: string, feedback?: string) {
    await useApi().me.cancelSubscription({ reason, feedback })
    await fetchActive()
  }

  return { plans, active, loading, error, fetchPlans, fetchActive, cancelRenewal }
})
