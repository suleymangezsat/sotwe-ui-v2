<script setup lang="ts">
/*
 * Date + time filter for the trends topics panel. Reproduces the v1
 * `components/trend/topics/TopicsFilter.vue` contract:
 *
 *   - Quick links: Now, Yesterday, Week ago, Month ago
 *   - Explicit date picker (min 2020-10-01, max today)
 *   - Hour selector:
 *       * on today  → `ago=N` (0..23, "Now" / "{N} hours ago")
 *       * historical→ `time=HH`, encoded into `date=YYYYMMDD-HH`
 *
 * URL contract (v1 parity, consumed by pages + useTrendsData):
 *   ?date=YYYYMMDD-HH   → historical topics
 *   ?ago=N              → hours ago (today only)
 *   neither             → "now" (today, current hour)
 *
 * Backend endpoint: /v3/trend/topics/location accepts both `datetime`
 * (yyyyMMdd-HH) and `ago` (hours). See useApi().trend.topicsByLocation.
 */

const route = useRoute()
const router = useRouter()

const MIN_DATE = '2020-10-01'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function isoToUrlDate(iso: string, hour: number): string {
  return `${iso.replace(/-/g, '')}-${String(hour).padStart(2, '0')}`
}

function parseUrlDate(s: string | undefined): { iso: string, hour: number } | null {
  if (!s) return null
  const m = /^(\d{4})(\d{2})(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const [, y, mo, d, h] = m
  return { iso: `${y}-${mo}-${d}`, hour: Number(h) }
}

// Current state derived from the URL
const urlDate = computed(() => (typeof route.query.date === 'string' ? route.query.date : undefined))
const urlAgo = computed(() => {
  const raw = typeof route.query.ago === 'string' ? Number(route.query.ago) : NaN
  return Number.isFinite(raw) && raw >= 0 && raw <= 23 ? raw : undefined
})

const parsedHistorical = computed(() => parseUrlDate(urlDate.value))
const isToday = computed(() => !parsedHistorical.value || parsedHistorical.value.iso === todayIso())

const selectedIso = computed(() => parsedHistorical.value?.iso ?? todayIso())
const selectedHour = computed(() => {
  if (parsedHistorical.value) return parsedHistorical.value.hour
  // Today mode: ago offset from current hour
  const now = new Date().getHours()
  return urlAgo.value !== undefined ? (now - urlAgo.value + 24) % 24 : now
})

const dateLabel = computed(() => {
  if (isToday.value) return 'Today'
  return new Date(selectedIso.value).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
})

const timeLabel = computed(() => {
  if (isToday.value) {
    const ago = urlAgo.value ?? 0
    if (ago === 0) return 'Now'
    if (ago === 1) return '1 hour ago'
    return `${ago} hours ago`
  }
  return `${String(selectedHour.value).padStart(2, '0')}:00`
})

// --- navigation helpers --------------------------------------------------

function go(query: Record<string, string | undefined>) {
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...route.query, ...query })) {
    if (v !== undefined && v !== null && v !== '') next[k] = String(v)
  }
  router.push({ path: route.path, query: next })
}

function pickNow() {
  go({ date: undefined, ago: undefined })
}

function pickQuick(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  go({ date: isoToUrlDate(d.toISOString().slice(0, 10), 12), ago: undefined })
}

function pickDate(iso: string) {
  // Pick the noon hour by default when switching days (matches v1).
  if (iso === todayIso()) {
    go({ date: undefined, ago: undefined })
  }
  else {
    go({ date: isoToUrlDate(iso, parsedHistorical.value?.hour ?? 12), ago: undefined })
  }
}

function pickHour(hour: number) {
  if (isToday.value) {
    const nowHour = new Date().getHours()
    const ago = (nowHour - hour + 24) % 24
    go({ date: undefined, ago: ago === 0 ? undefined : String(ago) })
  }
  else {
    go({ date: isoToUrlDate(selectedIso.value, hour), ago: undefined })
  }
}

const open = ref(false)
const hours = Array.from({ length: 24 }, (_, i) => i)

function hourLabel(h: number) {
  if (isToday.value) {
    const nowHour = new Date().getHours()
    const ago = (nowHour - h + 24) % 24
    if (ago === 0) return 'Now'
    if (ago === 1) return '1 hour ago'
    return `${ago} hours ago`
  }
  return `${String(h).padStart(2, '0')}:00`
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-twitter-slate-50 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Icon name="i-lucide-clock" class="size-3.5 text-twitter-blue-500" />
      <span>{{ dateLabel }} · {{ timeLabel }}</span>
      <Icon name="i-lucide-chevron-down" class="size-3.5 text-twitter-slate-500" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-twitter-slate-100 bg-white p-3 shadow-lg dark:border-twitter-slate-700 dark:bg-twitter-slate-950"
    >
      <div class="flex flex-wrap gap-1 pb-3">
        <button
          type="button"
          class="rounded-full bg-twitter-slate-50 px-3 py-1 text-xs font-semibold hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
          @click="pickNow"
        >
          Now
        </button>
        <button
          type="button"
          class="rounded-full bg-twitter-slate-50 px-3 py-1 text-xs font-semibold hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
          @click="pickQuick(1)"
        >
          Yesterday
        </button>
        <button
          type="button"
          class="rounded-full bg-twitter-slate-50 px-3 py-1 text-xs font-semibold hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
          @click="pickQuick(7)"
        >
          Week ago
        </button>
        <button
          type="button"
          class="rounded-full bg-twitter-slate-50 px-3 py-1 text-xs font-semibold hover:bg-twitter-slate-100 dark:bg-twitter-slate-900 dark:hover:bg-twitter-slate-800"
          @click="pickQuick(30)"
        >
          Month ago
        </button>
      </div>

      <label class="mb-1 block text-xs font-semibold text-twitter-slate-500">Date</label>
      <input
        type="date"
        :value="selectedIso"
        :min="MIN_DATE"
        :max="todayIso()"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-2 py-1.5 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
        @change="(e) => pickDate((e.target as HTMLInputElement).value)"
      >

      <label class="mb-1 mt-3 block text-xs font-semibold text-twitter-slate-500">Time</label>
      <select
        :value="selectedHour"
        class="w-full rounded-lg border border-twitter-slate-100 bg-white px-2 py-1.5 text-sm focus:border-twitter-blue-500 focus:outline-none dark:border-twitter-slate-700 dark:bg-twitter-slate-900"
        @change="(e) => pickHour(Number((e.target as HTMLSelectElement).value))"
      >
        <option v-for="h in hours" :key="h" :value="h">{{ hourLabel(h) }}</option>
      </select>
    </div>
  </div>
</template>
