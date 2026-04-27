<script setup lang="ts">
/*
 * Catch-all error surface — port of v1 `components/common/GenericErrorDialog
 * .vue`. Whenever an action surfaces an unexpected failure (subscription
 * gate, network glitch, backend 500) we drop the API code into
 * `useUiStore().genericErrorDialog.props` and let this dialog do the
 * "we're sorry / try again / go home" framing for us. Any caller that
 * just wants to inform the user without a custom dialog of its own can
 * write `ui.genericErrorDialog.display = true`.
 *
 * The dialog reads from `useErrorCode()` so the message text matches the
 * shared i18n keys (`errors.<CODE>.title|message`) — Faz 7 wires those to
 * `$t()`. Until then the keys render verbatim, which is still informative
 * enough during dev.
 */

const ui = useUiStore()

const open = computed({
  get: () => ui.genericErrorDialog.display,
  set: v => (ui.genericErrorDialog.display = v),
})

interface ErrorProps {
  title?: string
  message?: string
  /** Optional ErrorCode we feed to useErrorCode() for localized title. */
  code?: string
  /** Where the primary "Try again" button navigates. Defaults to `/`. */
  nextUrl?: string
}

const props = computed<ErrorProps>(() => ui.genericErrorDialog.props as ErrorProps)

function close() {
  ui.genericErrorDialog.display = false
  ui.genericErrorDialog.props = {} as ErrorProps
}

const router = useRouter()
function tryAgain() {
  const next = props.value.nextUrl
  close()
  if (next) router.push(next)
  else if (import.meta.client) location.reload()
}
</script>

<template>
  <SDialog v-model="open" :title="props.title || 'Something went wrong'">
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <Icon name="i-lucide-alert-triangle" class="mt-0.5 size-6 shrink-0 text-amber-500" />
        <div class="flex flex-col gap-1">
          <p v-if="props.code" class="text-xs font-mono text-twitter-slate-400">
            {{ props.code }}
          </p>
          <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
            {{ props.message || 'An unexpected error happened. Please try again in a moment.' }}
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <SButton block variant="ghost" @click="close">Dismiss</SButton>
        <SButton block @click="tryAgain">
          {{ props.nextUrl ? 'Continue' : 'Try again' }}
        </SButton>
      </div>
    </div>
  </SDialog>
</template>
