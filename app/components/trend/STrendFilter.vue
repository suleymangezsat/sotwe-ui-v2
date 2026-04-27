<script setup lang="ts">
/*
 * Country / city picker — v1 `components/trend/Filter.vue`.
 *
 * Data source: the `useCountriesStore` hydrates from `/v3/trend/woeids` on
 * first open (client-only). Each Woeid may carry a `cities[]` array; the
 * picker shows countries in a searchable list and expands cities inline.
 *
 * Selection writes to the URL via `/trends/:country/:city?` navigation so
 * it's bookmarkable, shareable, and crawlable.
 */

import type { Woeid } from '~shared/types'

defineProps<{
  placeLabel: string
}>()

const open = ref(false)
const search = ref('')
const countries = useCountriesStore()
const router = useRouter()
const { t } = useI18n()

function toggle() {
  open.value = !open.value
  if (open.value && !countries.data.length) countries.fetchOnce()
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return countries.data
  return countries.data.filter((w) => {
    if (w.fullname?.toLowerCase().includes(q) || w.name?.toLowerCase().includes(q)) return true
    return (w.cities || []).some(c => c.fullname?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q))
  })
})

function selectCountry(w: Woeid) {
  open.value = false
  router.push(w.fullname === 'worldwide' ? '/' : `/trends/${encodeURIComponent(w.fullname)}`)
}

function selectCity(country: Woeid, city: Woeid) {
  open.value = false
  router.push(`/trends/${encodeURIComponent(country.fullname)}/${encodeURIComponent(city.fullname)}`)
}

const expandedCountry = ref<string | null>(null)
function toggleExpand(code: string) {
  expandedCountry.value = expandedCountry.value === code ? null : code
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-twitter-slate-50 px-4 py-2 text-sm font-semibold transition-colors hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
      :aria-expanded="open"
      @click="toggle"
    >
      <Icon name="i-lucide-globe" class="size-4 text-twitter-blue-500" />
      <span>{{ placeLabel }}</span>
      <Icon name="i-lucide-chevron-down" class="size-4 text-twitter-slate-500" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full z-20 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-twitter-slate-100 bg-white p-2 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
    >
      <div class="sticky top-0 bg-white pb-2 dark:bg-twitter-slate-950">
        <input
          v-model="search"
          type="search"
          :placeholder="t('common.search_places')"
          class="w-full rounded-full bg-twitter-slate-50 px-3 py-2 text-sm placeholder:text-twitter-slate-500 focus:outline-none dark:bg-twitter-slate-900"
        >
      </div>

      <ul v-if="countries.loading" class="py-6 text-center text-sm text-twitter-slate-500">
        {{ t('common.loading') }}
      </ul>
      <ul v-else-if="!filtered.length" class="py-6 text-center text-sm text-twitter-slate-500">
        {{ t('common.noResults') }}
      </ul>
      <ul v-else>
        <li v-for="w in filtered" :key="w.fullname" class="border-b border-twitter-slate-100 last:border-b-0 dark:border-twitter-slate-800">
          <div class="flex items-center">
            <button
              class="flex-1 truncate px-3 py-2 text-left text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
              type="button"
              @click="selectCountry(w)"
            >
              {{ w.name }}
            </button>
            <button
              v-if="(w.cities || []).length"
              type="button"
              class="rounded-full p-1 hover:bg-twitter-slate-100 dark:hover:bg-twitter-slate-800"
              :aria-label="t('trendspage.showCitiesIn', { name: w.name })"
              @click="toggleExpand(w.fullname)"
            >
              <Icon :name="expandedCountry === w.fullname ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 text-twitter-slate-500" />
            </button>
          </div>
          <ul v-if="expandedCountry === w.fullname && w.cities?.length" class="pl-6">
            <li v-for="c in w.cities" :key="c.fullname">
              <button
                type="button"
                class="w-full truncate px-3 py-1.5 text-left text-sm hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900"
                @click="selectCity(w, c)"
              >
                {{ c.name }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
