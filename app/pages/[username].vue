<script setup lang="ts">
/*
 * User profile page — root-level `/:username` to match v1 URL scheme
 * (Twitter-style `sotwe.com/elonmusk`). This is an SEO-critical URL
 * pattern — the entire search index and inbound link graph assumes it.
 *
 * /v3/user/{screenName} returns both `data: Tweet[]` (timeline) and
 * `info: User` (profile) in one call, so a single fetch hydrates both.
 */

const route = useRoute()
const screenName = computed(() => String(route.params.username))

const { data } = await useAsyncData(
  () => `user-${screenName.value}`,
  async () => {
    try {
      const res = await useApi().user.get(screenName.value)
      return {
        info: res.info,
        tweets: res.data,
        after: res.after,
        sensitive: res.sensitive,
        whoToFollow: res.whoToFollow ?? [],
      }
    }
    catch {
      return null
    }
  },
)

if (!data.value?.info) {
  throw createError({ statusCode: 404, statusMessage: 'User not found', fatal: true })
}

const profile = data.value.info
const tweets = data.value.tweets
const initialAfter = data.value.after
const whoToFollow = data.value.whoToFollow

async function loadMoreTweets(after: string) {
  const res = await useApi().user.get(screenName.value, { after })
  // Backend omits `info` on paginated fetches and leaves `tweet.user` off
  // the page owner's own tweets. The useApi() wrapper can only patch with
  // the info from THIS response, so we manually copy the profile already
  // resolved during the initial SSR fetch.
  for (const t of res.data) {
    if (!t.user) t.user = profile
  }
  return { items: res.data, after: res.after }
}

useSotweMeta({
  title: `${profile.name} (@${profile.screenName}) · Sotwe`,
  description: profile.description?.slice(0, 200)
    || `Read @${profile.screenName}'s tweets on Sotwe without a Twitter account.`,
  image: profile.profileImageOriginal,
  isSensitive: profile.possiblySensitive,
  ogType: 'profile',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'mainEntity': {
      '@type': 'Person',
      'name': profile.name,
      'alternateName': `@${profile.screenName}`,
      'description': profile.description,
      'image': profile.profileImageOriginal,
    },
  },
})
</script>

<template>
  <STopBar :title="profile.name" :show-back="true" />

  <header class="relative">
    <div class="aspect-[3/1] bg-twitter-slate-100 dark:bg-twitter-slate-900">
      <img
        v-if="profile.profileBannerOriginal"
        :src="profile.profileBannerOriginal"
        :alt="`${profile.name} banner`"
        class="h-full w-full object-cover"
      >
    </div>
    <!--
      Twitter-style profile avatar: a fixed-size 128px disc whose vertical
      centre sits on the banner/content seam (translate-y 50% upward).
      Positioned absolutely so it overlaps without pushing the content row
      down; the content row below reserves `pt-20` to skip the avatar.
      No verified tick here — the name row underneath already shows it.
    -->
    <div class="relative px-4">
      <NuxtLink
        :to="`/${profile.screenName}`"
        class="absolute left-4 top-0 -translate-y-1/2 rounded-full ring-4 ring-white dark:ring-black"
        :aria-label="profile.name"
      >
        <img
          :src="profile.profileImageOriginal || profile.profileImageMedium"
          :alt="profile.name"
          width="128"
          height="128"
          class="size-32 rounded-full object-cover bg-twitter-slate-100 dark:bg-twitter-slate-900"
        >
      </NuxtLink>
    </div>
    <div class="px-4 pb-3 pt-20">
      <div class="flex items-center gap-1 text-xl font-bold">
        <span>{{ profile.name }}</span>
        <SVerifiedBadge v-if="profile.verified" class="size-5 text-twitter-blue-500" />
      </div>
      <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        @{{ profile.screenName }}
      </div>
      <p v-if="profile.description" class="mt-2 whitespace-pre-wrap break-word">
        {{ profile.description }}
      </p>
      <div class="mt-3 flex flex-wrap gap-4 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        <span v-if="profile.location">
          <Icon name="i-lucide-map-pin" class="mr-1 inline size-4" /> {{ profile.location }}
        </span>
        <span v-if="profile.createdAt">
          <Icon name="i-lucide-calendar" class="mr-1 inline size-4" />
          Joined {{ new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) }}
        </span>
      </div>
      <div class="mt-3 flex gap-5 text-sm">
        <span><b>{{ profile.followingCount?.toLocaleString() }}</b> <span class="text-twitter-slate-500 dark:text-twitter-slate-400">Following</span></span>
        <span><b>{{ profile.followerCount?.toLocaleString() }}</b> <span class="text-twitter-slate-500 dark:text-twitter-slate-400">Followers</span></span>
      </div>
    </div>
  </header>

  <SInfiniteTimeline
    :initial-items="tweets"
    :initial-after="initialAfter"
    :load-more="loadMoreTweets"
  >
    <template #default="{ items }">
      <template v-for="(t, i) in items" :key="t.id">
        <STweet :tweet="t" />
        <!-- V1 parity: inline "Who to follow" block between tweets #3 and
             #4. Renders once, only when the API returned suggestions and
             the feed is long enough to surround it. Uses the flat inline
             variant (no card chrome) to blend with the tweet stream. -->
        <SWhoToFollowInline
          v-if="i === 2 && whoToFollow.length && items.length > 3"
          :users="whoToFollow"
        />
      </template>
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500">
        No tweets yet.
      </p>
    </template>
  </SInfiniteTimeline>
</template>
