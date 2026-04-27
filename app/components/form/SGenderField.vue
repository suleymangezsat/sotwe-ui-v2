<script setup lang="ts">
/*
 * Gender select — three-option pill picker. Replaces the v1 Vuetify
 * v-select inside EditProfile / signup step 3.
 *
 * Backend enum: `MALE` | `FEMALE` | `OTHER` (see `Gender` in
 * shared/types/enums.ts). We render compact toggle buttons so signup feels
 * like a continuation of the credential flow rather than a desktop form.
 */

import { Gender } from '~shared/types'

const props = withDefaults(defineProps<{
  label?: string
  required?: boolean
}>(), {
  label: undefined,
  required: false,
})

const model = defineModel<Gender | undefined>({ required: true })

const { t } = useI18n()
const labelText = computed(() => props.label ?? t('forms.gender.label'))
const options = computed<Array<{ value: Gender, label: string }>>(() => [
  { value: Gender.MALE, label: t('forms.gender.male') },
  { value: Gender.FEMALE, label: t('forms.gender.female') },
  { value: Gender.OTHER, label: t('forms.gender.other') },
])
</script>

<template>
  <UFormField :label="labelText" :required="required" :ui="{ root: 'w-full' }">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :aria-pressed="model === opt.value"
        class="rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
        :class="model === opt.value
          ? 'border-twitter-blue-500 bg-twitter-blue-50 text-twitter-blue-700 dark:bg-twitter-blue-950 dark:text-twitter-blue-300'
          : 'border-twitter-slate-200 text-twitter-slate-700 hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:text-twitter-slate-200 dark:hover:bg-twitter-slate-900'"
        @click="model = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>
  </UFormField>
</template>
