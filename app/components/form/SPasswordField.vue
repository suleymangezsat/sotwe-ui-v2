<script setup lang="ts">
/*
 * Password input with a show/hide toggle. Replaces v1
 * `components/form/PasswordInput.vue`. Same validation + touch contract as
 * SEmailField. The eye toggle flips the input `type` between `password`
 * and `text` — purely client-side, no value rewrite, so autofill keeps
 * working.
 */

import { validatePassword } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  /** Skip validation entirely — used by sign-in where the backend gives
   *  the canonical "invalid credentials" message. */
  noValidate?: boolean
  disabled?: boolean
}>(), {
  label: undefined,
  placeholder: undefined,
  autocomplete: 'current-password',
  required: true,
  noValidate: false,
  disabled: false,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const visible = ref(false)
const touched = ref(false)

const error = computed(() =>
  props.noValidate ? undefined : (touched.value ? validatePassword(model.value) : undefined),
)
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))

const { t } = useI18n()
const labelText = computed(() => props.label ?? t('forms.password.label'))
const placeholderText = computed(() => props.placeholder ?? t('forms.password.placeholder'))
</script>

<template>
  <UFormField :label="labelText" :error="errorMessage" :required="required" :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholderText"
      :autocomplete="autocomplete"
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
          :aria-label="visible ? t('forms.password.hide') : t('forms.password.show')"
          @click="visible = !visible"
        />
      </template>
    </UInput>
  </UFormField>
</template>
