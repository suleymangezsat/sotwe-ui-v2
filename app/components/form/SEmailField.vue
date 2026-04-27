<script setup lang="ts">
/*
 * Email input — replaces v1 `components/form/EmailInput.vue`. Bound via
 * `v-model` (string), emits `update:error` so parent forms can disable
 * the submit button until every field is clean. Validation runs on blur
 * to avoid yelling at the user mid-typing, then re-runs on each keystroke
 * once the field has been touched at least once.
 */

import { validateEmail } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  /** Disable validation entirely — used inside SignIn where we let the
   *  backend's 401 message speak for itself. */
  noValidate?: boolean
  disabled?: boolean
}>(), {
  label: 'Email',
  placeholder: 'you@example.com',
  autocomplete: 'email',
  required: true,
  noValidate: false,
  disabled: false,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const touched = ref(false)
const error = computed(() =>
  props.noValidate ? undefined : (touched.value ? validateEmail(model.value) : undefined),
)
watch(error, e => emit('update:error', e), { immediate: true })

const errorMessage = computed(() => translateValidationKey(error.value))
</script>

<template>
  <UFormField :label="label" :error="errorMessage" :required="required" :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      type="email"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      class="w-full"
      @blur="touched = true"
    />
  </UFormField>
</template>
