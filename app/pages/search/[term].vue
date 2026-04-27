<script setup lang="ts">
/*
 * Combined tweet + user search. `#foo`/`@foo` conventions are handled in the
 * SearchBar before we reach this route — by the time `/search/<term>` is hit,
 * we know it's a keyword, not a hashtag / user handle.
 * Tweets side paginates via cursor; users side is a single-shot response.
 */

const route = useRoute()
const term = computed(() => decodeURIComponent(String(route.params.term)))

const tab = ref<'tweets' | 'users'>('tweets')

const { data: tweetData } = await useAsyncData(
  () => `search-tweets-${term.value}`,
  async () => {
    const res = await useApi().search.tweet(term.value)
    return { tweets: res.data, after: res.after }
  },
  { default: () => ({ tweets: [], after: undefined }) },
)

const { data: users } = await useAsyncData(
  () => `search-users-${term.value}`,
  async () => {
    const res = await useApi().search.user(term.value)
    return res.data
  },
  { default: () => [] },
)

async function loadMoreTweets(after: string) {
  const res = await useApi().search.tweet(term.value, { after })
  return { items: res.data, after: res.after }
}

// `searchpage.meta.*` keys. v1 noindex'es search result pages
// (duplicate / low-quality content vs the sources). The `foundPeople`
// fragment appends user-name list to the description when matches exist.
const { t } = useI18n()
const peopleFragment = computed(() => {
  const list = (users.value || []).slice(0, 5).map(u => u.name).filter(Boolean).join(', ')
  return list ? t('searchpage.meta.foundPeople', { people: list }) : ''
})
useSotweMeta({
  title: t('searchpage.meta.title', { term: term.value }),
  description: t('searchpage.meta.description', { term: term.value }) + peopleFragment.value,
  noindex: true,
})
</script>

<template>
  <STopBar :title="term" :show-back="true" />

  <nav class="flex border-b border-twitter-slate-100 text-sm font-semibold dark:border-twitter-slate-700">
    <button
      :class="['flex-1 py-3 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900', tab === 'tweets' ? 'border-b-4 border-twitter-blue-500 text-twitter-slate-950 dark:text-twitter-slate-100' : 'text-twitter-slate-500']"
      @click="tab = 'tweets'"
    >
      {{ t('searchpage.tabTweets') }}
    </button>
    <button
      :class="['flex-1 py-3 transition-colors hover:bg-twitter-slate-50 dark:hover:bg-twitter-slate-900', tab === 'users' ? 'border-b-4 border-twitter-blue-500 text-twitter-slate-950 dark:text-twitter-slate-100' : 'text-twitter-slate-500']"
      @click="tab = 'users'"
    >
      {{ t('searchpage.tabUsers') }}
    </button>
  </nav>

  <SInfiniteTimeline
    v-if="tab === 'tweets'"
    :initial-items="tweetData?.tweets || []"
    :initial-after="tweetData?.after"
    :load-more="loadMoreTweets"
  >
    <template #default="{ items }">
      <STweet v-for="tw in items" :key="tw.id" :tweet="tw" />
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500">
        {{ t('searchpage.noTweetsForTerm', { term }) }}
      </p>
    </template>
  </SInfiniteTimeline>
  <div v-else>
    <NuxtLink
      v-for="u in users"
      :key="u.id"
      :to="`/${u.screenName}`"
      class="flex items-start gap-3 border-b border-twitter-slate-100 px-4 py-3 hover:bg-twitter-slate-50 dark:border-twitter-slate-700 dark:hover:bg-twitter-slate-900"
    >
      <SAvatar :user="u" size="md" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1 font-bold">
          <span class="truncate">{{ u.name }}</span>
          <SVerifiedBadge v-if="u.verified" class="size-4 text-twitter-blue-500" />
        </div>
        <div class="text-twitter-slate-500">@{{ u.screenName }}</div>
        <p v-if="u.description" class="mt-1 line-clamp-2 text-sm text-twitter-slate-900 dark:text-twitter-slate-100">
          {{ u.description }}
        </p>
      </div>
    </NuxtLink>
    <p v-if="!users.length" class="px-4 py-10 text-center text-twitter-slate-500">
      {{ t('searchpage.noUsersForTerm', { term }) }}
    </p>
  </div>
</template>
