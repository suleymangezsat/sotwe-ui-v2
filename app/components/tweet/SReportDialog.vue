<script setup lang="ts">
/*
 * Report dialog — fires `/v1/report` via useReportStore. Type/name come
 * from the trigger (`ui.reportDialog.props.type` + `.name`). Reason has
 * 5 v1-parity values (CHILD_ABUSE / RACISM / TERROR / VIOLENCE / OTHER)
 * plus an optional free-text message.
 */

import type { ReportReason, ReportType } from '~shared/types'

const ui = useUiStore()
const report = useReportStore()
const toast = useToast()
const { t } = useI18n()

const open = computed({
  get: () => ui.reportDialog.display,
  set: (v) => { ui.reportDialog.display = v },
})

const openProps = computed(() => ui.reportDialog.props as unknown as {
  type?: ReportType
  name?: string
})

const reason = ref<ReportReason>('OTHER')
const message = ref('')

const reasons = computed<{ value: ReportReason, label: string }[]>(() => [
  { value: 'CHILD_ABUSE', label: t('reportDialog.reasons.CHILD_ABUSE') },
  { value: 'RACISM', label: t('reportDialog.reasons.RACISM') },
  { value: 'TERROR', label: t('reportDialog.reasons.TERROR') },
  { value: 'VIOLENCE', label: t('reportDialog.reasons.VIOLENCE') },
  { value: 'OTHER', label: t('reportDialog.reasons.OTHER') },
])

async function submit() {
  if (!openProps.value.type || !openProps.value.name) return
  try {
    await report.submit({
      type: openProps.value.type,
      name: openProps.value.name,
      reason: reason.value,
      message: message.value || undefined,
    })
    toast.add({ title: t('reportDialog.submitted'), icon: 'i-lucide-check' })
    open.value = false
    report.reset()
    message.value = ''
  }
  catch (e) {
    toast.add({ title: t('reportDialog.failed'), description: (e as Error).message, color: 'error' })
  }
}
</script>

<template>
  <SDialog v-model="open" :title="t('reportDialog.title')" :description="t('reportDialog.subtitle')">
    <div class="space-y-3 p-4">
      <label class="block text-sm font-semibold">{{ t('reportDialog.reasonLabel') }}</label>
      <select
        v-model="reason"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-3 py-2 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
      >
        <option v-for="r in reasons" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>

      <label class="block text-sm font-semibold">{{ t('reportDialog.detailsLabel') }}</label>
      <textarea
        v-model="message"
        rows="3"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-3 py-2 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
        :placeholder="t('reportDialog.placeholder')"
      />

      <div class="flex justify-end gap-2 pt-2">
        <SButton variant="outline" @click="open = false">{{ t('common.cancel') }}</SButton>
        <SButton :loading="report.loading" @click="submit">{{ t('reportDialog.send') }}</SButton>
      </div>
    </div>
  </SDialog>
</template>
