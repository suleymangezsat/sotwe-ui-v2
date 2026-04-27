<script setup lang="ts">
/*
 * One-time code input — used by signup step 2 and forgot-password step 2.
 * Renders a numeric input with `inputmode="numeric"` so mobile keyboards
 * pop the digit pad. We let the visitor paste the whole code at once.
 */

import { validateOtp } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

withDefaults(defineProps<{
  label?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: 'Verification code',
  placeholder: '123456',
  disabled: false,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const touched = ref(false)
const error = computed(() => (touched.value ? validateOtp(model.value) : undefined))
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))

function onInput(e: Event) {
  // Strip non-digits so paste of "123-456" still works.
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  model.value = v
  if (v) touched.value = true
}
</script>

<template>
  <UFormField :label="label" :error="errorMessage" required :ui="{ root: 'w-full' }">
    <UInput
      :model-value="model"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="8"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full"
      :ui="{ base: 'text-center tracking-[0.4em] text-lg font-semibold' }"
      @input="onInput"
      @blur="touched = true"
    />
  </UFormField>
</template>
