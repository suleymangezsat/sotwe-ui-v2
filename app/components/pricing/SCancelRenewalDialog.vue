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

const reason = ref<CancelReason | undefined>(undefined)
const feedback = ref('')
const loading = ref(false)
const errorMessage = ref<string | undefined>(undefined)

const reasonOptions: Array<{ value: CancelReason, label: string }> = [
  { value: CancelReason.HIGH_COST, label: 'Too expensive' },
  { value: CancelReason.FEATURE_BROKEN, label: "A feature isn't working" },
  { value: CancelReason.NOT_USING_ENOUGH, label: "I'm not using it enough" },
  { value: CancelReason.CHANGE_IN_NEEDS, label: 'My needs have changed' },
  { value: CancelReason.LACK_OF_FEATURE, label: 'Missing a feature I need' },
  { value: CancelReason.OTHER, label: 'Other' },
]

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
    errorMessage.value = 'Please pick a reason so we can keep improving.'
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
      title: 'Renewal cancelled',
      description: 'Your subscription stays active until the end of the current period.',
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
  <SDialog v-model="open" title="Cancel auto-renewal">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        Sorry to see you go. Your subscription will stay active until the
        end of the current period — we just won't bill you again.
      </p>

      <UFormField label="Why are you leaving?" required :ui="{ root: 'w-full' }">
        <USelect
          v-model="reason"
          :items="reasonOptions"
          value-key="value"
          placeholder="Pick a reason"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Anything else? (optional)" :ui="{ root: 'w-full' }">
        <UTextarea
          v-model="feedback"
          :rows="3"
          maxlength="500"
          placeholder="What could we have done better?"
          class="w-full"
        />
      </UFormField>

      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div class="flex gap-2">
        <SButton block variant="ghost" :disabled="loading" @click="open = false">
          Stay subscribed
        </SButton>
        <SButton
          block
          color="error"
          :loading="loading"
          :disabled="!reason"
          @click="confirm"
        >
          Cancel renewal
        </SButton>
      </div>
    </div>
  </SDialog>
</template>
