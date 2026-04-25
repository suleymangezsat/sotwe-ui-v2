<script setup lang="ts">
useSotweMeta({
  title: 'About · Sotwe',
  description: 'Sotwe is a read-only viewer for public Twitter / X content. No account required.',
})
</script>

<template>
  <STopBar title="About" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>
      Sotwe lets you read public Twitter / X content without an account. Search for users,
      browse trending topics by country, and follow conversations from your browser.
    </p>
    <p>
      We don't post, reply, retweet, or DM on your behalf. Sotwe is a front-end over Twitter's
      public data — nothing more. If you're the subject of content hosted here and would like it
      taken down, please contact <a href="mailto:info@sotwe.com">info@sotwe.com</a>.
    </p>
    <p>
      For questions about premium, billing, or refunds, see the
      <NuxtLink to="/pricing">pricing</NuxtLink> page or our
      <NuxtLink to="/delivery-refund-terms">refund policy</NuxtLink>.
    </p>
  </article>
</template>
