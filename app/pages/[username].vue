<script setup lang="ts">
/*
 * User profile page — root-level `/:username` to match v1 URL scheme
 * (Twitter-style `sotwe.com/elonmusk`). This is an SEO-critical URL
 * pattern — the entire search index and inbound link graph assumes it.
 *
 * /v3/user/{screenName} returns both `data: Tweet[]` (timeline) and
 * `info: User` (profile) in one call, so a single fetch hydrates both.
 *
 * The header replicates v1 `components/user/profile/*`:
 *   - banner (3:1 aspect)
 *   - avatar overlapping the banner/content seam (size-32 disc, 4px
 *     ring against bg)
 *   - action button row to the right of the avatar (Share + 3-dot menu
 *     — Open on X / Account ownership / Report user)
 *   - h1 = display name + verified tick + protected lock
 *   - @screenName + bio (with mention/hashtag/url linkification) + website
 *     link from `urlEntity` + location + joined date + category badges
 *   - stats row: posts / following / followers (compact format)
 *
 * The page-level h1 is the visible name in the header — STopBar drops to
 * h2 so we keep exactly one h1 per page (SEO + a11y).
 */

import { parseTweetText } from '~/utils/tweetEntities'
import { formatCount } from '~/utils/formatCount'

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
const initialAfter = data.value.after
const whoToFollow = data.value.whoToFollow

// Track every tweet the visitor has loaded — initial SSR batch + every
// page that infinite scroll has pulled in. SDownloadAllButton reads from
// this ref so the ZIP includes exactly the media that's been seen so far,
// matching v1's `user/timeline/findAllMediaUrls` Vuex getter behaviour.
const loadedTweets = ref([...data.value.tweets])

async function loadMoreTweets(after: string) {
  const res = await useApi().user.get(screenName.value, { after })
  // Backend omits `info` on paginated fetches and leaves `tweet.user` off
  // the page owner's own tweets. The useApi() wrapper can only patch with
  // the info from THIS response, so we manually copy the profile already
  // resolved during the initial SSR fetch.
  for (const t of res.data) {
    if (!t.user) t.user = profile
  }
  loadedTweets.value.push(...res.data)
  return { items: res.data, after: res.after }
}

// Bio entity linkification. v1 stripped raw URLs from the description and
// surfaced the user's website as a separate `urlEntity` link below — the
// raw `t.co/…` stub shouldn't show up in body text. We mirror that:
//   1. strip every `https?://…` token from the description
//   2. parse what's left for mention + hashtag entities
// If the description is JUST a URL (a common case for power users like
// elonmusk who use the bio as the website field) the cleaned text is
// empty and the bio paragraph hides entirely.
const cleanBio = computed(() => {
  const raw = profile.description ?? ''
  return raw.replace(/(?:https?|ftp):\/\/\S+/g, '').trim()
})
const bioSegments = computed(() => {
  if (!cleanBio.value) return []
  return parseTweetText({
    text: cleanBio.value,
    userMentionEntities: profile.userMentionEntities,
    tagEntities: profile.tagEntities,
  })
})

const websiteUrl = computed(() => profile.urlEntity?.expandedURL || profile.url || undefined)
const websiteDisplay = computed(() => profile.urlEntity?.displayURL || websiteUrl.value)

const joinedDate = computed(() =>
  profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : undefined,
)

// SEO meta from v1's `userpage.meta.*` keys — preserves the indexed
// title pattern Google has crawled against `sotwe.com/{username}` for
// years. The bio fragment ({bio}) is pre-pended with " " so it reads
// naturally even when empty (per v1).
const { t } = useI18n()
const bioFragment = computed(() => {
  const trimmed = profile.description?.slice(0, 200).trim()
  return trimmed ? ` ${trimmed}` : ''
})
useSotweMeta({
  title: t('userpage.meta.title', {
    fullname: profile.name,
    username: profile.screenName,
  }),
  description: t('userpage.meta.description', {
    username: profile.screenName,
    followers: profile.followerCount ?? 0,
    following: profile.followingCount ?? 0,
    bio: bioFragment.value,
  }),
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
  <!-- Page hero (the user's name) is the sole h1 — topbar demotes to h2
       so the page has exactly one h1 (SEO + a11y). -->
  <STopBar :title="profile.name" :show-back="true" :as="'h2'" />

  <header class="relative">
    <!-- Banner. Twitter ships banners at 3:1 (1500×500). Empty state is a
         neutral grey rectangle of the same aspect to keep CLS stable when
         the avatar/content row mounts before the image loads. -->
    <div class="aspect-[3/1] bg-twitter-slate-100 dark:bg-twitter-slate-900">
      <img
        v-if="profile.profileBannerOriginal"
        :src="profile.profileBannerOriginal"
        :alt="`${profile.name} banner`"
        class="h-full w-full object-cover"
      >
    </div>

    <!-- Avatar + action button row, sitting on the banner/content seam.
         -mt-16 lifts both surfaces by half the avatar's height (size-32 ÷
         2 = 64px) so the avatar visually overlaps the banner. items-end
         keeps the button row baseline-aligned with the avatar's bottom. -->
    <div class="flex items-end justify-between px-4 -mt-16">
      <NuxtLink
        :to="`/${profile.screenName}`"
        class="rounded-full ring-4 ring-white dark:ring-black"
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

      <div class="flex items-center gap-2 pb-2">
        <SDownloadAllButton :username="profile.screenName" :tweets="loadedTweets" />
        <SProfileShareButton :profile="profile" />
        <SProfileMenu :profile="profile" />
      </div>
    </div>

    <div class="px-4 pt-4 pb-3">
      <!-- Display name (h1) + verified + protected indicators. -->
      <h1 class="flex items-center gap-1 text-xl font-bold">
        <span class="break-word">{{ profile.name }}</span>
        <SVerifiedBadge v-if="profile.verified" class="size-5 shrink-0 text-twitter-blue-500" />
        <Icon
          v-if="profile.userProtected"
          name="i-lucide-lock"
          class="size-4 shrink-0 text-twitter-slate-500"
          :aria-label="t('userpage.protectedAccount')"
        />
      </h1>
      <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        @{{ profile.screenName }}
      </div>

      <!-- Bio with mention/hashtag linkification. URLs are rendered as a
           separate "website" link below to match v1's stripped-bio
           pattern. -->
      <p
        v-if="bioSegments.length"
        class="mt-2 whitespace-pre-wrap break-word text-[15px] text-twitter-slate-900 dark:text-twitter-slate-100"
      >
        <template v-for="(seg, i) in bioSegments" :key="i">
          <template v-if="seg.kind === 'text'">{{ seg.text }}</template>
          <NuxtLink
            v-else-if="seg.kind === 'mention'"
            :to="`/${seg.screenName}`"
            class="text-twitter-blue-500 hover:underline"
          >{{ seg.text }}</NuxtLink>
          <NuxtLink
            v-else-if="seg.kind === 'hashtag'"
            :to="`/hashtag/${encodeURIComponent(seg.tag)}`"
            class="text-twitter-blue-500 hover:underline"
          >{{ seg.text }}</NuxtLink>
        </template>
      </p>

      <!-- Inline meta row: website / location / joined / category. Each
           item gets its own icon for quick scan. Items only render when
           the underlying field is non-empty so absent metadata doesn't
           leave dangling icons. -->
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        <a
          v-if="websiteUrl"
          :href="websiteUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="inline-flex items-center gap-1 text-twitter-blue-500 hover:underline"
        >
          <Icon name="i-lucide-link" class="size-4" />
          {{ websiteDisplay }}
        </a>
        <span v-if="profile.location" class="inline-flex items-center gap-1">
          <Icon name="i-lucide-map-pin" class="size-4" /> {{ profile.location }}
        </span>
        <span v-if="joinedDate" class="inline-flex items-center gap-1">
          <Icon name="i-lucide-calendar" class="size-4" /> {{ t('userpage.joinedOn', { date: joinedDate }) }}
        </span>
      </div>

      <!-- Category badges (e.g. "News", "Sports") if the backend tagged
           the user. Hidden for the vast majority of profiles. -->
      <div
        v-if="profile.category && profile.category.length"
        class="mt-2 flex flex-wrap gap-1.5"
      >
        <span
          v-for="c in profile.category"
          :key="c"
          class="rounded-full bg-twitter-slate-100 px-2.5 py-0.5 text-xs font-semibold text-twitter-slate-700 dark:bg-twitter-slate-800 dark:text-twitter-slate-200"
        >
          {{ c }}
        </span>
      </div>

      <!-- Stats row: posts / following / followers. Numeric counts use the
           same compact formatter as the tweet action row (1.2K / 5M). -->
      <!--
        Stats row (posts / following / followers). Vue's default
        `whitespace: 'condense'` strips the leading space inside
        `<span> {{ ... }}</span>`, which would otherwise separate the
        number from the localized label — TR rendered "101.9KGönderi"
        before the fix. Embed the leading space inside the mustache
        itself so Vue can't strip it.
      -->
      <div class="mt-3 flex flex-wrap gap-5 text-sm">
        <span v-if="profile.postCount != null">
          <b>{{ formatCount(profile.postCount) }}</b>
          <span class="text-twitter-slate-500 dark:text-twitter-slate-400">{{ ` ${t('userpage.posts')}` }}</span>
        </span>
        <span v-if="profile.followingCount != null">
          <b>{{ formatCount(profile.followingCount) }}</b>
          <span class="text-twitter-slate-500 dark:text-twitter-slate-400">{{ ` ${t('userpage.following')}` }}</span>
        </span>
        <span v-if="profile.followerCount != null">
          <b>{{ formatCount(profile.followerCount) }}</b>
          <span class="text-twitter-slate-500 dark:text-twitter-slate-400">{{ ` ${t('userpage.followers')}` }}</span>
        </span>
      </div>
    </div>
  </header>

  <SInfiniteTimeline
    :initial-items="loadedTweets"
    :initial-after="initialAfter"
    :load-more="loadMoreTweets"
  >
    <template #default="{ items }">
      <template v-for="(tw, i) in items" :key="tw.id">
        <STweet :tweet="tw" />
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
