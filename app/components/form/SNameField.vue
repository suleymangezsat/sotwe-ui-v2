<script setup lang="ts">
/*
 * Plain "full name" text input — replaces the v1 v-text-field used in
 * signup step 3 + EditProfile. Validation is just length + non-empty.
 */

import { validateName } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  required?: boolean
}>(), {
  label: undefined,
  placeholder: undefined,
  required: true,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const touched = ref(false)
const error = computed(() => (touched.value ? validateName(model.value) : undefined))
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))

const { t } = useI18n()
const labelText = computed(() => props.label ?? t('forms.name.label'))
const placeholderText = computed(() => props.placeholder ?? t('forms.name.placeholder'))
</script>

<template>
  <UFormField :label="labelText" :error="errorMessage" :required="required" :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      type="text"
      maxlength="50"
      autocomplete="name"
      :placeholder="placeholderText"
      class="w-full"
      @blur="touched = true"
    />
  </UFormField>
</template>
