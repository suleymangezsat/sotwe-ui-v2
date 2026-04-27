<script setup lang="ts">
/*
 * "How do you want to pay?" — port of v1
 * `components/pricing/PaymentMethodDialog.vue`. Two-option picker that
 * sits between the SPricingCard subscribe button and the actual checkout
 * redirect. Lets the visitor choose:
 *
 *   - Stripe (credit card / Apple Pay / Google Pay) — handled by
 *     stripe-js redirectToCheckout
 *   - Sellix (crypto / alt payment methods) — redirects to a Sellix
 *     invoice URL
 *
 * The dialog itself doesn't make any API calls — it only emits `selected`
 * with the chosen processor. The parent SPricingCard owns the session
 * mint + redirect.
 */

import type { PaymentSource } from '~shared/types'

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ selected: [PaymentSource] }>()

function pick(source: PaymentSource) {
  open.value = false
  emit('selected', source)
}
</script>

<template>
  <SDialog v-model="open" title="Choose a payment method">
    <div class="flex flex-col gap-3">
      <button
        type="button"
        class="flex items-center gap-4 rounded-xl border border-twitter-slate-100 bg-white p-4 text-left transition-colors hover:border-twitter-blue-500 hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:bg-twitter-slate-950 dark:hover:bg-twitter-slate-900"
        @click="pick('stripe')"
      >
        <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-white">
          <Icon name="i-simple-icons-stripe" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="font-bold">Card / Apple Pay / Google Pay</div>
          <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
            Pay with Stripe — secure checkout, supports most countries.
          </div>
        </div>
        <Icon name="i-lucide-chevron-right" class="size-4 text-twitter-slate-400" />
      </button>

      <button
        type="button"
        class="flex items-center gap-4 rounded-xl border border-twitter-slate-100 bg-white p-4 text-left transition-colors hover:border-twitter-blue-500 hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:bg-twitter-slate-950 dark:hover:bg-twitter-slate-900"
        @click="pick('sellix')"
      >
        <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0073e6] text-white">
          <Icon name="i-lucide-bitcoin" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="font-bold">Crypto &amp; alternatives</div>
          <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
            Pay via Sellix — Bitcoin, Litecoin, USDT, and more.
          </div>
        </div>
        <Icon name="i-lucide-chevron-right" class="size-4 text-twitter-slate-400" />
      </button>
    </div>
  </SDialog>
</template>
