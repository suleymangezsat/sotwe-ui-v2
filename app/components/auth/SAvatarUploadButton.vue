<script setup lang="ts">
/*
 * Profile picture upload control. Wraps a hidden <input type="file"> + a
 * visible click target, validates the chosen file (image-only, ≤ 5 MB),
 * uploads via `POST /me/profile/picture`, and refreshes the user state.
 *
 * 5 MB cap matches v1 (sotwe-ui/components/auth/SelectProfilePic.vue) — the
 * backend silently truncates anything bigger but we want to surface the
 * limit before the network round-trip.
 */

const MAX_BYTES = 5 * 1024 * 1024

const auth = useAuth()
const toast = useToast()
const input = ref<HTMLInputElement | null>(null)
const loading = ref(false)

function pick() {
  input.value?.click()
}

async function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Pick an image file', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  if (file.size > MAX_BYTES) {
    toast.add({ title: 'File too large (max 5 MB)', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }

  const form = new FormData()
  form.append('image', file)

  loading.value = true
  try {
    await useApi().me.uploadPicture(form)
    await auth.fetchUser()
    toast.add({ title: 'Profile picture updated', icon: 'i-lucide-check', color: 'success' })
  }
  catch (err) {
    toast.add({
      title: 'Upload failed',
      description: (err as Error).message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
  finally {
    loading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onChange"
    >
    <SButton
      variant="outline"
      size="sm"
      icon="i-lucide-camera"
      :loading="loading"
      @click="pick"
    >
      Change picture
    </SButton>
  </div>
</template>
