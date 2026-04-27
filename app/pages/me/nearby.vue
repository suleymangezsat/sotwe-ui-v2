<script setup lang="ts">
/*
 * Nearby users — paged by `?country=XX`. CF-IPCountry sets the default;
 * visitors can override via a query string (`/me/nearby?country=TR`).
 *
 * Each row links to the user's profile. We don't surface a "Message"
 * affordance — Sotwe is read-only and doesn't proxy direct messages back
 * to X. The whole row is a NuxtLink for a generous tap-target.
 */

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const headerCountry = (useRequestHeader('cf-ipcountry') || '').toUpperCase()
const country = computed(() => {
  const q = (route.query.country as string | undefined)?.toUpperCase()
  return q || headerCountry || 'TR'
})

const { data } = await useAsyncData(
  () => `nearby-${country.value}`,
  async () => useApi().location.nearby({ country: country.value, random: 30 }),
  { default: () => [] },
)

const { t } = useI18n()
useSotweMeta({
  title: t('nearbypage.meta.title'),
  description: t('nearbypage.meta.description'),
  noindex: true,
})
</script>

<template>
  <STopBar :title="t('navigation.nearby')" />
  <section class="divide-y divide-twitter-slate-100 dark:divide-twitter-slate-700">
    <NuxtLink
      v-for="u in data"
      :key="u.userId"
      :to="`/${u.username}`"
      class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
    >
      <UAvatar
        :src="u.profilePic"
        :alt="u.fullname"
        size="md"
        class="ring-1 ring-twitter-slate-100 dark:ring-twitter-slate-700"
      />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1 font-bold">
          <span class="truncate">{{ u.fullname }}</span>
          <SVerifiedBadge v-if="u.verified" class="size-4 text-twitter-blue-500" />
        </div>
        <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          @{{ u.username }} · {{ t('nearby.km_unit', { number: u.distance.toFixed(1) }) }}
        </div>
      </div>
    </NuxtLink>
    <p v-if="!data?.length" class="px-4 py-10 text-center text-twitter-slate-500">
      {{ t('nearbypage.noUsers') }}
    </p>
  </section>
</template>
