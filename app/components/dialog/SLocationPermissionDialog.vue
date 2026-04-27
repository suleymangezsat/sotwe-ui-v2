<script setup lang="ts">
/*
 * Geolocation pre-prompt — port of v1
 * `components/common/LocationPermissionDialog.vue`. We show this BEFORE
 * calling `navigator.geolocation.getCurrentPosition()` so the visitor
 * understands *why* the browser is about to ask for location access
 * (denying it permanently from the browser's chrome banner is a worse
 * outcome than denying it from our own dialog, which leaves the door
 * open to a future re-prompt).
 *
 * Two outcomes:
 *   "Allow"   — emits `granted` so the caller fires the actual geo API
 *               call. The browser's native prompt then renders.
 *   "Not now" — closes silently; caller is expected to fall back to
 *               IP-based country detection (Cf-IPCountry header).
 */

const ui = useUiStore()
const open = computed({
  get: () => ui.locationPermissionDialog.display,
  set: v => (ui.locationPermissionDialog.display = v),
})

const emit = defineEmits<{ granted: []; denied: [] }>()

function allow() {
  open.value = false
  emit('granted')
}

function deny() {
  open.value = false
  emit('denied')
}
</script>

<template>
  <SDialog v-model="open" title="Allow your location" persistent>
    <div class="flex flex-col items-center gap-4 py-2 text-center">
      <div class="inline-flex size-16 items-center justify-center rounded-full bg-twitter-blue-50 text-twitter-blue-500 dark:bg-twitter-blue-950">
        <Icon name="i-lucide-map-pin" class="size-8" />
      </div>
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        Sotwe uses your approximate location to surface trends and people
        nearby. Your coordinates never leave your browser — we only use
        them locally to query the closest country / city.
      </p>
      <div class="flex w-full gap-2">
        <SButton block variant="ghost" @click="deny">Not now</SButton>
        <SButton block @click="allow">Allow</SButton>
      </div>
    </div>
  </SDialog>
</template>
