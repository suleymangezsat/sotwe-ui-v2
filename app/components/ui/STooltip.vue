<script setup lang="ts">
/*
 * Thin wrapper over Nuxt UI v4 UTooltip with sane defaults.
 *
 * SSR caveat: Nuxt UI v4's internal Tooltip implementation reads
 * `disabled.value` during SSR; if the prop is missing it throws
 * "Cannot read properties of undefined (reading 'disabled')" inside the
 * server renderer (most visibly on `app/error.vue`, which is rendered
 * outside the usual app context). Passing an explicit `:disabled="false"`
 * sidesteps that — the tooltip is still active on the client.
 */

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
    :disabled="false"
  >
    <slot />
  </UTooltip>
</template>
