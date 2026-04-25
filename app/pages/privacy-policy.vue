<script setup lang="ts">
useSotweMeta({
  title: 'Privacy Policy · Sotwe',
  description: 'Privacy policy for sotwe.com.',
})
</script>

<template>
  <STopBar title="Privacy Policy" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>
      This page is a placeholder. Faz 9 copies the v1 privacy policy from
      <code>sotwe-ui/pages/privacypolicy.vue</code> verbatim to preserve legal wording and
      GDPR cookie disclosures.
    </p>
    <h2>Summary</h2>
    <ul>
      <li>We store minimal account data (email, hashed password, subscription).</li>
      <li>We log Cloudflare-derived country so we can localize trends and ads.</li>
      <li>We use Google Analytics and Yandex Metrica for aggregate traffic stats.</li>
      <li>Email us at <a href="mailto:info@sotwe.com">info@sotwe.com</a> for deletion requests.</li>
    </ul>
  </article>
</template>
