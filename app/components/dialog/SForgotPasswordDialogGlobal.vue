<script setup lang="ts">
/*
 * Global mount point for the existing SForgotPasswordDialog so any modal
 * (most notably the login dialog) can pop the reset flow without each
 * caller wiring its own v-model. The actual three-step UI lives in
 * `app/components/auth/SForgotPasswordDialog.vue` — this file is just a
 * thin adapter that binds the dialog's open state to
 * `useUiStore().forgotPasswordDialog.display`.
 */

const ui = useUiStore()
const open = computed({
  get: () => ui.forgotPasswordDialog.display,
  set: v => (ui.forgotPasswordDialog.display = v),
})
</script>

<template>
  <SForgotPasswordDialog v-model="open" />
</template>
