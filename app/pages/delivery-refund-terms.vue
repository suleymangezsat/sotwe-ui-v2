<script setup lang="ts">
useSotweMeta({
  title: 'Refund Policy · Sotwe',
  description: 'Refund policy for Sotwe Premium subscriptions.',
})
</script>

<template>
  <STopBar title="Refund Policy" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>
      Faz 9 copies the v1 refund policy from <code>sotwe-ui/pages/deliveryrefund.vue</code>
      verbatim. In summary:
    </p>
    <ul>
      <li>Subscriptions can be cancelled any time; you keep access until the end of the paid period.</li>
      <li>Refunds within 14 days of an initial purchase are granted if no heavy usage has occurred.</li>
      <li>Refund requests go to <a href="mailto:info@sotwe.com">info@sotwe.com</a>.</li>
    </ul>
  </article>
</template>
