<script setup lang="ts">
/*
 * Delete-account confirmation dialog. The destructive action is gated by
 * a "type your username to confirm" pattern (Stripe / GitHub style) so
 * that misclicks can't wipe an account. On success we sign the visitor
 * out and redirect home.
 */

const open = defineModel<boolean>({ required: true })
const props = defineProps<{ username: string }>()

const auth = useAuth()
const toast = useToast()

const confirmInput = ref('')
const loading = ref(false)

const matches = computed(() => confirmInput.value.trim().toLowerCase() === props.username.toLowerCase())

watch(open, (v) => {
  if (!v) confirmInput.value = ''
})

async function destroy() {
  if (!matches.value || loading.value) return
  loading.value = true
  try {
    await useApi().me.deleteAccount()
    auth.signOut()
    toast.add({ title: 'Account deleted', icon: 'i-lucide-check', color: 'success' })
    navigateTo('/', { replace: true })
  }
  catch (err) {
    toast.add({
      title: 'Could not delete account',
      description: (err as Error).message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
  finally {
    loading.value = false
    open.value = false
  }
}
</script>

<template>
  <SDialog v-model="open" title="Delete your account">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        This will permanently delete your account and all associated
        bookmarks. This cannot be undone.
      </p>

      <UFormField :label="`Type your username @${username} to confirm`" :ui="{ root: 'w-full' }">
        <UInput
          v-model="confirmInput"
          type="text"
          autocomplete="off"
          :placeholder="username"
          class="w-full"
        />
      </UFormField>

      <div class="flex gap-2">
        <SButton
          variant="ghost"
          block
          @click="open = false"
        >
          Cancel
        </SButton>
        <SButton
          color="error"
          block
          :loading="loading"
          :disabled="!matches"
          @click="destroy"
        >
          Delete account
        </SButton>
      </div>
    </div>
  </SDialog>
</template>
