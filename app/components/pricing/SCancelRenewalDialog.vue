<script setup lang="ts">
/*
 * Cancel-renewal dialog — port of v1
 * `components/pricing/CancelRenewalDialog.vue`. Pops from the /me/profile
 * subscription card when the visitor wants to stop the auto-renewal.
 *
 * Collects a reason (one of the v1 enum values) plus optional free-text
 * feedback, then DELETEs `/me/subscription`. The active subscription
 * stays valid until `endDate` even after cancel — the backend only flips
 * the auto-renew flag.
 */

import { CancelReason } from '~shared/types'
import { isSotweApiError } from '~/utils/api'

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ done: [] }>()

const pricing = usePricingStore()
const auth = useAuth()
const toast = useToast()
const { t } = useI18n()

const reason = ref<CancelReason | undefined>(undefined)
const feedback = ref('')
const loading = ref(false)
const errorMessage = ref<string | undefined>(undefined)

const reasonOptions = computed<Array<{ value: CancelReason, label: string }>>(() => [
  { value: CancelReason.HIGH_COST, label: t('cancel_renewal.reasons.HIGH_COST') },
  { value: CancelReason.FEATURE_BROKEN, label: t('cancel_renewal.reasons.FEATURE_BROKEN') },
  { value: CancelReason.NOT_USING_ENOUGH, label: t('cancel_renewal.reasons.NOT_USING_ENOUGH') },
  { value: CancelReason.CHANGE_IN_NEEDS, label: t('cancel_renewal.reasons.CHANGE_IN_NEEDS') },
  { value: CancelReason.LACK_OF_FEATURE, label: t('cancel_renewal.reasons.LACK_OF_FEATURE') },
  { value: CancelReason.OTHER, label: t('cancel_renewal.reasons.OTHER') },
])

watch(open, (v) => {
  if (!v) {
    reason.value = undefined
    feedback.value = ''
    errorMessage.value = undefined
  }
})

async function confirm() {
  if (loading.value) return
  if (!reason.value) {
    errorMessage.value = t('cancel_renewal.pickReasonError')
    return
  }
  loading.value = true
  errorMessage.value = undefined
  try {
    await pricing.cancelRenewal(reason.value, feedback.value.trim() || undefined)
    // Refresh the user state so the /me/profile subscription card
    // reflects the cancelled-but-still-valid status until endDate.
    await auth.fetchUser()
    toast.add({
      title: t('cancel_renewal.cancelled'),
      description: t('cancel_renewal.cancelledDesc'),
      icon: 'i-lucide-check',
      color: 'success',
    })
    open.value = false
    emit('done')
  }
  catch (e) {
    errorMessage.value = isSotweApiError(e) ? e.message : (e as Error).message
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <SDialog v-model="open" :title="t('cancel_renewal.title')">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        {{ t('cancel_renewal.preamble') }}
      </p>

      <UFormField :label="t('cancel_renewal.whyLeaving')" required :ui="{ root: 'w-full' }">
        <USelect
          v-model="reason"
          :items="reasonOptions"
          value-key="value"
          :placeholder="t('cancel_renewal.pickReason')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('cancel_renewal.anythingElse')" :ui="{ root: 'w-full' }">
        <UTextarea
          v-model="feedback"
          :rows="3"
          maxlength="500"
          :placeholder="t('cancel_renewal.whatBetter')"
          class="w-full"
        />
      </UFormField>

      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div class="flex gap-2">
        <SButton block variant="ghost" :disabled="loading" @click="open = false">
          {{ t('cancel_renewal.stay') }}
        </SButton>
        <SButton
          block
          color="error"
          :loading="loading"
          :disabled="!reason"
          @click="confirm"
        >
          {{ t('cancel_renewal.cancel') }}
        </SButton>
      </div>
    </div>
  </SDialog>
</template>
