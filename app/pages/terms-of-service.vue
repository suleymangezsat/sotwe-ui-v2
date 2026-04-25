<script setup lang="ts">
useSotweMeta({
  title: 'Terms of Service · Sotwe',
  description: 'Terms of service for sotwe.com.',
})
</script>

<template>
  <STopBar title="Terms of Service" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>
      By using Sotwe you agree to these terms. Full legal copy matches the v1 site and will be
      pasted in Faz 9 from <code>sotwe-ui/pages/tos.vue</code>.
    </p>
    <h2>1. Using Sotwe</h2>
    <p>
      Sotwe is provided as-is. You agree not to use it for spam, scraping, or abuse.
    </p>
    <h2>2. Premium subscriptions</h2>
    <p>
      Premium subscriptions are billed via Stripe. You can cancel renewal at any time from
      <NuxtLink to="/me/profile">your profile</NuxtLink>. For refunds see our
      <NuxtLink to="/delivery-refund-terms">refund policy</NuxtLink>.
    </p>
    <h2>3. Content ownership</h2>
    <p>
      All tweet and user data displayed on Sotwe is owned by its original authors on Twitter / X.
    </p>
    <h2>4. Contact</h2>
    <p>
      Questions? Email <a href="mailto:info@sotwe.com">info@sotwe.com</a>.
    </p>
  </article>
</template>
