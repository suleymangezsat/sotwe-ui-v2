<script setup lang="ts">
/*
 * Modal wrapper that re-uses the same multi-step signup the `/signup`
 * page renders. Visitors who hit "Create account" inside a login modal
 * get a single uninterrupted flow without losing the page they came from.
 * State (`useSignupStore`) is shared with the page route so the user can
 * dismiss the dialog mid-flow and resume on `/signup` if they want.
 *
 * On step-3 success the profile sub-component bounces to `/me/profile`
 * via `navigateTo`; the dialog closes itself before navigation so the
 * destination doesn't render behind a still-open backdrop.
 */

import { useSignupStore } from '~/stores/signup'

const ui = useUiStore()
const store = useSignupStore()

const open = computed({
  get: () => ui.signupDialog.display,
  set: v => (ui.signupDialog.display = v),
})

watch(open, (v) => {
  if (v && store.step === 1 && !store.email) store.reset()
})

const stepLabel = computed(() => {
  if (store.step === 1) return 'Create your account'
  if (store.step === 2) return 'Verify your email'
  return 'Tell us about you'
})

function onProfileDone() {
  store.reset()
  open.value = false
  navigateTo('/me/profile', { replace: true })
}
</script>

<template>
  <SDialog v-model="open" :title="stepLabel">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-center gap-2" aria-label="Signup progress">
        <span
          v-for="n in 3"
          :key="n"
          :aria-current="store.step === n ? 'step' : undefined"
          class="h-1.5 rounded-full transition-all"
          :class="[
            store.step === n ? 'w-6 bg-twitter-blue-500' : 'w-3 bg-twitter-slate-200 dark:bg-twitter-slate-700',
          ]"
        />
      </div>

      <SSignupStepInit v-if="store.step === 1" />
      <SSignupStepOtp v-else-if="store.step === 2" />
      <SSignupStepProfile v-else @done="onProfileDone" />

      <p class="text-center text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
        Already have an account?
        <button
          type="button"
          class="font-semibold text-twitter-blue-500 hover:underline"
          @click="open = false; ui.loginDialog.display = true"
        >
          Sign in
        </button>
      </p>
    </div>
  </SDialog>
</template>
