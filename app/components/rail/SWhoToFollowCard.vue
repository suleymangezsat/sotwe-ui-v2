<script setup lang="ts">
/*
 * Prop-driven "Who to follow" — used on user profile pages where the
 * backend response already includes a `whoToFollow: User[]` array.
 * Skips rendering when the list is empty so the rail collapses silently.
 */

import type { User } from '~shared/types'
import { formatCount } from '~/utils/formatCount'

defineProps<{
  users: User[]
  title?: string
}>()

const { t } = useI18n()
</script>

<template>
  <SCard v-if="users.length" padded>
    <h2 class="mb-3 text-xl font-bold">{{ title || t('rail.whoToFollow') }}</h2>
    <ul class="-mx-2">
      <li v-for="u in users" :key="u.id">
        <SUserRow :user="u" :subtitle="u.followerCount ? t('rail.followersCount', { count: formatCount(u.followerCount) }) : undefined" />
      </li>
    </ul>
  </SCard>
</template>
