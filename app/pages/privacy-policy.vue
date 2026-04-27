<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

useSotweMeta({
  title: t('privacyPolicy.meta.title'),
  description: t('privacyPolicy.meta.description'),
})

const appEmail = config.public.siteEmail
</script>

<template>
  <STopBar :title="t('privacyPolicy.title')" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>
      {{ t('privacyPolicy.introduction', { app_email: appEmail }) }}
    </p>

    <h3>{{ t('privacyPolicy.headers.informationWeCollect') }}</h3>
    <p>{{ t('privacyPolicy.content.informationWeCollect') }}</p>

    <h3>{{ t('privacyPolicy.headers.howWeUseYourInformation') }}</h3>
    <p>{{ t('privacyPolicy.content.howWeUseYourInformationIntro') }}</p>
    <ul>
      <li>{{ t('privacyPolicy.content.useList.provideAndMaintain') }}</li>
      <li>{{ t('privacyPolicy.content.useList.improveAndPersonalize') }}</li>
      <li>{{ t('privacyPolicy.content.useList.understandAndAnalyze') }}</li>
      <li>{{ t('privacyPolicy.content.useList.developNew') }}</li>
      <li>{{ t('privacyPolicy.content.useList.communicate') }}</li>
      <li>{{ t('privacyPolicy.content.useList.sendEmails') }}</li>
      <li>{{ t('privacyPolicy.content.useList.preventFraud') }}</li>
    </ul>

    <h3>{{ t('privacyPolicy.headers.dataProtection') }}</h3>
    <p>{{ t('privacyPolicy.content.dataProtection') }}</p>

    <h3>{{ t('privacyPolicy.headers.policyChanges') }}</h3>
    <p>{{ t('privacyPolicy.content.policyChanges') }}</p>
  </article>
</template>
