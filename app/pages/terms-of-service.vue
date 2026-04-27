<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSotweMeta({
  title: t('termsOfService.meta.title'),
  description: t('termsOfService.meta.description'),
})

// `prohibitions` is an array under `termsOfService.prohibitions` — `tm()`
// returns the raw message tree, which `rt()` then renders per active locale.
const prohibitions = computed(() => {
  const raw = tm('termsOfService.prohibitions') as unknown
  if (!Array.isArray(raw)) return [] as string[]
  return (raw as unknown[]).map(item => rt(item as never))
})
</script>

<template>
  <STopBar :title="t('termsOfService.title')" :show-back="true" />
  <article class="prose prose-slate max-w-none px-4 py-6 dark:prose-invert">
    <p>{{ t('termsOfService.welcome') }}</p>
    <p>{{ t('termsOfService.agreement') }}</p>

    <h3>{{ t('termsOfService.useTitle') }}</h3>
    <p>{{ t('termsOfService.useDescription') }}</p>
    <ul>
      <li v-for="(item, index) in prohibitions" :key="index">
        {{ item }}
      </li>
    </ul>

    <h3>{{ t('termsOfService.contentTitle') }}</h3>
    <p>{{ t('termsOfService.contentDescription') }}</p>

    <h3>{{ t('termsOfService.disclaimerTitle') }}</h3>
    <p>{{ t('termsOfService.disclaimerDescription') }}</p>
  </article>
</template>
