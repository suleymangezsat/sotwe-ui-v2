<template>
  <!--
    UApp wires up the providers Nuxt UI v4 needs at the tree root — Tooltip,
    Toast, Modal, Dialog, overlay portals. Without it, any <UTooltip> /
    <UModal> / `useToast()` call throws a Reka injection error.
    See app/components/ui/STooltip.vue.
  -->
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
