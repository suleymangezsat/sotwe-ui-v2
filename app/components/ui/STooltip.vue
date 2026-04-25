<script setup lang="ts">
defineProps<{
  text: string
  /** Tooltip placement. */
  side?: 'top' | 'right' | 'bottom' | 'left'
}>()
</script>

<template>
  <UTooltip
    :text="text"
    :content="{ side: side || 'top', align: 'center' }"
    :delay-duration="400"
  >
    <slot />
  </UTooltip>
</template>
