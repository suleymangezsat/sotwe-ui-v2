<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const appName = config.public.siteName
const appEmail = config.public.siteEmail
const siteUrl = config.public.siteUrl.replace(/\/+$/, '')

// `Organization` schema for the brand — Google reads this to wire the
// knowledge panel + corporate logo on SERPs. Lives on /about because
// that's the `contactPoint` page Google's guidelines reference.
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': appName,
  'alternateName': 'sotwe.com',
  'url': siteUrl,
  'logo': `${siteUrl}/icon.png`,
  'email': appEmail,
  'description': t('aboutpage.about_p_1'),
  'contactPoint': {
    '@type': 'ContactPoint',
    'email': appEmail,
    'contactType': 'customer support',
    'availableLanguage': ['en', 'tr', 'id'],
  },
}

useSotweMeta({
  title: t('aboutpage.meta.title'),
  description: t('aboutpage.meta.description', {
    domain: new URL(config.public.siteUrl).host,
  }),
  jsonLd: aboutJsonLd,
})
</script>

<template>
  <STopBar :title="t('aboutpage.title')" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>{{ t('aboutpage.about_p_1') }}</p>
    <p>{{ t('aboutpage.about_p_2', { app_name: appName }) }}</p>
    <p>{{ t('aboutpage.about_p_3', { app_name: appName }) }}</p>

    <h2>{{ t('aboutpage.contact_title') }}</h2>
    <p>
      {{ t('aboutpage.contact_p_1') }}
      <a :href="`mailto:${appEmail}`">{{ appEmail }}</a>
    </p>
  </article>
</template>
