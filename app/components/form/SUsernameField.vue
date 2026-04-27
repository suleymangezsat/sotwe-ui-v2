<script setup lang="ts">
/*
 * Username input — replaces v1 `components/form/UsernameInput.vue`. The
 * leading `@` glyph is a UInput leading slot so the value itself stays
 * clean (`elonmusk`, not `@elonmusk`). All values are lowercased on blur
 * to match how the backend stores screen names.
 */

import { validateUsername } from '~/utils/validators'
import { translateValidationKey } from '~/utils/validationMessages'

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  required?: boolean
  noValidate?: boolean
  disabled?: boolean
}>(), {
  label: 'Username',
  placeholder: 'screen_name',
  required: true,
  noValidate: false,
  disabled: false,
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ 'update:error': [string | undefined] }>()

const touched = ref(false)
function onBlur() {
  touched.value = true
  if (model.value) model.value = model.value.toLowerCase()
}

const error = computed(() =>
  props.noValidate ? undefined : (touched.value ? validateUsername(model.value) : undefined),
)
watch(error, e => emit('update:error', e), { immediate: true })
const errorMessage = computed(() => translateValidationKey(error.value))
</script>

<template>
  <UFormField :label="label" :error="errorMessage" :required="required" :ui="{ root: 'w-full' }">
    <UInput
      v-model="model"
      type="text"
      :placeholder="placeholder"
      autocomplete="username"
      :disabled="disabled"
      class="w-full"
      @blur="onBlur"
    >
      <template #leading>
        <span class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">@</span>
      </template>
    </UInput>
  </UFormField>
</template>
