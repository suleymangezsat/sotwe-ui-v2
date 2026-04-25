<script setup lang="ts">
/*
 * Dropdown menu (tweet context menu, user profile menu, language switcher).
 * Wraps Nuxt UI's UDropdownMenu so we get a consistent trigger + item shape.
 */

import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  items: DropdownMenuItem[] | DropdownMenuItem[][]
  ariaLabel?: string
}>()
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', sideOffset: 4 }"
    :ui="{
      content: 'rounded-xl border border-twitter-slate-100 bg-white dark:border-twitter-slate-700 dark:bg-twitter-slate-950',
    }"
  >
    <slot />
  </UDropdownMenu>
</template>
