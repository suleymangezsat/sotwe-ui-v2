<script setup lang="ts">
/*
 * Legacy alias for STweet. Every timeline page in Faz 5 referenced
 * <STweetRow>; Faz 6.1 now swaps in the full STweet component, and this
 * thin re-export keeps the old call sites working without a sweep.
 */

import type { Tweet } from '~shared/types'

defineProps<{ tweet: Tweet }>()
</script>

<template>
  <STweet :tweet="tweet" />
</template>
