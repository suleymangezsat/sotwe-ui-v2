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

const reasons: { value: ReportReason, label: string }[] = [
  { value: 'CHILD_ABUSE', label: 'Child abuse' },
  { value: 'RACISM', label: 'Racism / hate speech' },
  { value: 'TERROR', label: 'Terrorism' },
  { value: 'VIOLENCE', label: 'Violence' },
  { value: 'OTHER', label: 'Other' },
]

async function submit() {
  if (!openProps.value.type || !openProps.value.name) return
  try {
    await report.submit({
      type: openProps.value.type,
      name: openProps.value.name,
      reason: reason.value,
      message: message.value || undefined,
    })
    toast.add({ title: 'Report submitted', icon: 'i-lucide-check' })
    open.value = false
    report.reset()
    message.value = ''
  }
  catch (e) {
    toast.add({ title: 'Report failed', description: (e as Error).message, color: 'error' })
  }
}
</script>

<template>
  <SDialog v-model="open" title="Report content" description="Tell us why this content violates the rules.">
    <div class="space-y-3 p-4">
      <label class="block text-sm font-semibold">Reason</label>
      <select
        v-model="reason"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-3 py-2 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
      >
        <option v-for="r in reasons" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>

      <label class="block text-sm font-semibold">Details (optional)</label>
      <textarea
        v-model="message"
        rows="3"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-3 py-2 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
        placeholder="Anything else we should know?"
      />

      <div class="flex justify-end gap-2 pt-2">
        <SButton variant="outline" @click="open = false">Cancel</SButton>
        <SButton :loading="report.loading" @click="submit">Send report</SButton>
      </div>
    </div>
  </SDialog>
</template>
