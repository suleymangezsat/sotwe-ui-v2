<script setup lang="ts">
/*
 * Birth-date input. We use a native `<input type="date">` — fast,
 * accessible, and respects the OS locale of the visitor. Backend wants
 * ISO `YYYY-MM-DD` which is what the input emits. Min/max guard against
 * absurd values without needing a custom calendar widget.
 */

import { validateBirthDate } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  label?: string
  required?: boolean
}>(), {
  label: undefined,
  required: true,
})

const { t } = useI18n()
const labelText = computed(() => props.label ?? t('forms.birthDate.label'))

const model = defineModel<string | undefined>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const todayIso = new Date().toISOString().slice(0, 10)
const MIN = '1900-01-01'

const touched = ref(false)
const error = computed(() => (touched.value ? validateBirthDate(model.value) : undefined))
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))
</script>

<template>
  <UFormField :label="labelText" :error="errorMessage" :required="required" :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      type="date"
      :min="MIN"
      :max="todayIso"
      class="w-full"
      @blur="touched = true"
    />
  </UFormField>
</template>
