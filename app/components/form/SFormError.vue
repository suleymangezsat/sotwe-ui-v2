<script setup lang="ts">
/*
 * Inline form-level error banner — replaces v1 `components/form/FormError
 * .vue`. Accepts either:
 *   - a `code: ErrorCode` prop (Sotwe API code), which we translate via
 *     `useErrorCode()` so the message matches the same i18n keys v1 uses;
 *   - a free-form `message` string, used for non-API errors (network
 *     drops, validation summaries).
 *
 * Shown only when one of the two is provided. Lives outside form fields
 * because it summarises the whole submit attempt — fields render their
 * per-field errors via `<UFormField :error>`.
 */

import type { ErrorCode } from '~shared/types'

const props = withDefaults(defineProps<{
  code?: ErrorCode | undefined
  message?: string | undefined
  /** Title override; defaults to the i18n title for `code`. */
  title?: string
}>(), {
  code: undefined,
  message: undefined,
  title: undefined,
})

const visible = computed(() => Boolean(props.code || props.message))
const text = computed(() => props.message || (props.code ? `errors.${props.code}.message` : ''))
const heading = computed(() => props.title || (props.code ? `errors.${props.code}.title` : 'Error'))
</script>

<template>
  <div
    v-if="visible"
    role="alert"
    class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  >
    <Icon name="i-lucide-alert-circle" class="mt-0.5 size-4 shrink-0" />
    <div>
      <p v-if="heading" class="font-semibold">{{ heading }}</p>
      <p v-if="text">{{ text }}</p>
    </div>
  </div>
</template>
