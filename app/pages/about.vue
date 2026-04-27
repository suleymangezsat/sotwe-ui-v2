<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

useSotweMeta({
  title: t('aboutpage.meta.title'),
  description: t('aboutpage.meta.description', {
    domain: new URL(config.public.siteUrl).host,
  }),
})

const appName = config.public.siteName
const appEmail = config.public.siteEmail
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
