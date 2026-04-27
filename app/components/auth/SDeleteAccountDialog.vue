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
const { t } = useI18n()

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
    toast.add({ title: t('profile_actions.accountDeleted'), icon: 'i-lucide-check', color: 'success' })
    navigateTo('/', { replace: true })
  }
  catch (err) {
    toast.add({
      title: t('profile_actions.couldntDelete'),
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
  <SDialog v-model="open" :title="t('profile_actions.deleteAccountTitle')">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-twitter-slate-700 dark:text-twitter-slate-300">
        {{ t('profile_actions.deleteAccountDesc') }}
      </p>

      <UFormField :label="t('profile_actions.typeUsernameToConfirm', { username })" :ui="{ root: 'w-full' }">
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
          {{ t('common.cancel') }}
        </SButton>
        <SButton
          color="error"
          block
          :loading="loading"
          :disabled="!matches"
          @click="destroy"
        >
          {{ t('profile_actions.deleteBtn') }}
        </SButton>
      </div>
    </div>
  </SDialog>
</template>
