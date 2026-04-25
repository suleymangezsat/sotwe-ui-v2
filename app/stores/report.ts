/*
 * Report submission state for ReportDialog (auth-required).
 */

import type { ReportPayload } from '~shared/types'

export const useReportStore = defineStore('report', () => {
  const loading = ref(false)
  const error = ref<{ statusCode: number, code?: string } | undefined>(undefined)
  const submitted = ref(false)

  async function submit(payload: ReportPayload) {
    loading.value = true; error.value = undefined; submitted.value = false
    try {
      await useApi().report.submit(payload)
      submitted.value = true
    }
    catch (e) {
      const err = e as { status?: number, code?: string }
      error.value = { statusCode: err.status ?? 503, code: err.code }
      throw e
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = undefined
    submitted.value = false
  }

  return { loading, error, submitted, submit, reset }
})
