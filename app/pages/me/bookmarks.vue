<script setup lang="ts">
/*
 * Saved tweets (`/me/bookmarks`, v1 URL scheme). Auth-required —
 * middleware redirects to `/login` when the visitor isn't signed in.
 * /me/bookmark/content uses integer page pagination (not a cursor
 * string), hence the `<number>` generic on the infinite timeline.
 */

definePageMeta({ middleware: 'auth' })

const { data } = await useAsyncData('bookmarks-0', async () => {
  const res = await useApi().me.bookmarks(0)
  return { tweets: res.data, after: res.after }
}, { default: () => ({ tweets: [], after: undefined as number | undefined }) })

async function loadMore(page: number) {
  const res = await useApi().me.bookmarks(page)
  return { items: res.data, after: res.after }
}

const { t } = useI18n()
useSotweMeta({
  title: t('bookmarkpage.meta.title'),
  description: t('bookmarkpage.meta.description'),
  noindex: true,
})
</script>

<template>
  <STopBar :title="t('bookmarkpage.title')" />
  <SInfiniteTimeline
    :initial-items="data.tweets"
    :initial-after="data.after"
    :load-more="loadMore"
  >
    <template #default="{ items }">
      <STweet v-for="tw in items" :key="tw.id" :tweet="tw" />
    </template>
    <template #empty>
      <p class="px-4 py-10 text-center text-twitter-slate-500">
        {{ t('bookmarkpage.notfound.title') }}
      </p>
    </template>
  </SInfiniteTimeline>
</template>
