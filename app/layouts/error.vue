<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const status = computed(() => props.error?.statusCode ?? 500)
const isNotFound = computed(() => status.value === 404)

// 404 / 410 responses should never be indexed.
useSeoMeta({
  title: isNotFound.value ? 'Not found · Sotwe' : 'Error · Sotwe',
  robots: 'noindex',
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div
    class="mx-auto grid min-h-dvh w-full max-w-[1280px] gap-x-4 px-0 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[80px_600px_320px] lg:gap-x-8 xl:grid-cols-[275px_600px_350px] xl:px-4"
  >
    <SSidebar />

    <main class="flex min-w-0 flex-col border-x border-twitter-slate-100 px-6 py-16 pb-16 md:pb-6 dark:border-twitter-slate-700">
      <div class="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <Icon
          :name="isNotFound ? 'i-lucide-compass' : 'i-lucide-cloud-alert'"
          class="size-14 text-twitter-slate-400"
        />
        <h1 class="text-3xl font-bold">{{ status }}</h1>
        <p class="text-twitter-slate-500 dark:text-twitter-slate-400">
          {{ isNotFound ? "The page you're looking for doesn't exist." : 'Something went wrong on our end.' }}
        </p>
        <SButton color="primary" @click="goHome">Back to home</SButton>
      </div>
    </main>

    <SRightRail />
    <SBottomNav />
  </div>
</template>
