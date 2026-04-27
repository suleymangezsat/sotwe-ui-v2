<script setup lang="ts">
/*
 * Confirm-password input — replaces v1 `components/form/ConfirmPasswordInput
 * .vue`. Takes the source `password` as a prop, validates that the visible
 * confirm value matches it. Same touch + visibility behavior as
 * SPasswordField.
 */

import { validateConfirmPassword } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  /** The other (real) password to compare against. */
  password: string
  label?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: 'Confirm password',
  placeholder: 'Re-enter your password',
  disabled: false,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const visible = ref(false)
const touched = ref(false)
const error = computed(() =>
  touched.value ? validateConfirmPassword(props.password, model.value) : undefined,
)
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))
</script>

<template>
  <UFormField :label="label" :error="errorMessage" required :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      autocomplete="new-password"
      :disabled="disabled"
      class="w-full"
      @blur="touched = true"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="xs"
          :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="visible ? 'Hide password' : 'Show password'"
          @click="visible = !visible"
        />
      </template>
    </UInput>
  </UFormField>
</template>
