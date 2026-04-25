<script setup lang="ts">
/*
 * Modal dialog. Replaces Vuetify's `<v-dialog>` + `<v-card>` pattern that
 * every `*Dialog.vue` in sotwe-ui used. Controlled via v-model.
 */

defineProps<{
  title?: string
  description?: string
  /** Make the backdrop non-dismissable (used for multi-step signup). */
  persistent?: boolean
}>()

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <!--
    Nuxt UI's UModal uses the DEFAULT slot as the trigger element (what
    you click to open the modal) — not the body. Callers of SDialog pass
    body content via the default slot for ergonomics, so we map it to
    UModal's `#body`. Anything explicitly passed under `#trigger` falls
    through to UModal's default slot (trigger). `#footer` is forwarded
    untouched.
  -->
  <UModal
    v-model:open="model"
    :title="title"
    :description="description"
    :dismissible="!persistent"
    :ui="{
      content: 'rounded-2xl bg-white dark:bg-twitter-slate-950',
    }"
  >
    <template v-if="$slots.trigger" #default>
      <slot name="trigger" />
    </template>

    <template #body>
      <slot />
    </template>

    <template v-if="$slots.footer" #footer="scope">
      <slot name="footer" v-bind="scope" />
    </template>
  </UModal>
</template>
