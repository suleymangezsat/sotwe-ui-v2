<script setup lang="ts">
/*
 * "Ad-Free Browsing" promo card — v1 `components/layout/Highlight.vue` /
 * `highlightCard`. Strings pulled verbatim from app/locales/en.js :
 *   adFreePromotionCard.{title,description,button_text}.
 *
 * V1 placement: desktop right rail (d-none d-md-block) AND mobile inline
 * on the trends page (d-block d-md-none, my-5). We render the same card
 * in both spots via dedicated callers.
 */
</script>

<template>
  <SCard padded>
    <div class="flex items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-twitter-blue-50 dark:bg-twitter-blue-950">
        <Icon name="i-lucide-badge-check" class="size-5 text-twitter-blue-500" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-bold text-twitter-slate-950 dark:text-twitter-slate-100">
          Ad-Free Browsing
        </h3>
        <p class="mt-1 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          Enjoy Sotwe without ads and experience a more enjoyable browsing. More content, zero ads 🚀
        </p>
        <SButton to="/pricing" size="sm" class="mt-3">Subscribe now</SButton>
      </div>
    </div>
  </SCard>
</template>
