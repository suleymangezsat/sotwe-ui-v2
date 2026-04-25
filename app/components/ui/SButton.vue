<script setup lang="ts">
/*
 * SButton — the Sotwe wrapper around Nuxt UI's UButton with X / Twitter
 * defaults (pill shape, semibold weight, primary=twitter-blue). Use SButton
 * everywhere instead of UButton so app-wide visual changes can be made here.
 */

import type { ButtonProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ ButtonProps {
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'solid',
  size: 'md',
})
</script>

<template>
  <UButton
    v-bind="$attrs"
    :color="$props.color"
    :variant="$props.variant"
    :size="$props.size"
    :class="[block ? 'w-full' : '', 'font-semibold rounded-full']"
  >
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </UButton>
</template>
