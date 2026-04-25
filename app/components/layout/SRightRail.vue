<script setup lang="ts">
/*
 * Right rail — sticky ~350px column. Widgets match v1 sidebar content:
 *   - SSearchBar: quick search
 *   - SAdFreePromoCard: Premium upsell (v1 Highlight card)
 *   - SPopularUsersCard: /v3/user/popular (client-fetched on mount)
 *   - SLastSeenHashtagsCard: /v3/tag/lastViewed
 *   - SLastSeenUsersCard: /v3/user/lastViewed
 *   - SFooterNav: legal links
 *
 * All data widgets fetch on the client (below-the-fold; not SSR-critical).
 */
</script>

<template>
  <aside
    class="sticky top-0 hidden h-dvh flex-col gap-4 overflow-y-auto px-4 py-3 lg:flex"
  >
    <SSearchBar />
    <SAdFreePromoCard />
    <slot name="before" />
    <SPopularUsersCard />
    <SLastSeenHashtagsCard />
    <SLastSeenUsersCard />
    <slot name="after" />
    <SFooterNav />
  </aside>
</template>
