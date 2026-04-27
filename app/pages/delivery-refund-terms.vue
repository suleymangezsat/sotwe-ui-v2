<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

useSotweMeta({
  title: t('deliveryRefund.meta.title'),
  description: t('deliveryRefund.meta.description'),
})

const appEmail = config.public.siteEmail
</script>

<template>
  <STopBar :title="t('deliveryRefund.title')" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <h3>{{ t('deliveryRefund.deliveryTitle') }}</h3>
    <p>
      <span class="font-bold">{{ t('deliveryRefund.deliveryTermsTitle') }}</span>
      <span>{{ t('deliveryRefund.deliveryContent') }}</span>
    </p>

    <h3>{{ t('deliveryRefund.returnTitle') }}</h3>
    <p>
      <span class="font-bold">{{ t('deliveryRefund.returnConditionsTitle') }}</span>
      <span>{{ t('deliveryRefund.returnConditionsContent', { app_email: appEmail }) }}</span>
    </p>

    <p>
      <span class="font-bold">{{ t('deliveryRefund.refundProcessTitle') }}</span>
      <span>{{ t('deliveryRefund.refundProcessContent') }}</span>
    </p>

    <p>{{ t('deliveryRefund.footer', { app_email: appEmail }) }}</p>
  </article>
</template>
