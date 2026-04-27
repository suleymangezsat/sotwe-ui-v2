<script setup lang="ts">
const { t } = useI18n()
useSotweMeta({
  title: t('payment_fail.metaTitle'),
  description: t('payment_fail.metaDescription'),
  noindex: true,
})
</script>

<template>
  <STopBar :title="t('payment_fail.topBarTitle')" :show-back="true" :as="'h2'" />
  <section class="flex flex-col items-center gap-4 px-4 py-16 text-center">
    <Icon name="i-lucide-circle-x" class="size-16 text-red-500" />
    <h1 class="text-2xl font-bold">{{ t('payment_fail.somethingWrong') }}</h1>
    <p class="text-twitter-slate-500 dark:text-twitter-slate-400 max-w-md">
      {{ t('payment_fail.didNotGoThrough') }}
    </p>
    <SButton to="/pricing" block>{{ t('payment_fail.tryAgain') }}</SButton>
  </section>
</template>
