<script setup lang="ts">
/*
 * Signed-in user's profile editor (`/me/profile`, v1 URL scheme). Shows:
 *
 *   - Avatar + name + handle, with an "upload picture" affordance
 *   - SEditProfileForm (name / gender / birth date)
 *   - Subscription banner (read-only here; cancel flow lives on /pricing)
 *   - "Account & security" section: change password, delete account
 *   - Sign-out button
 *
 * SSR fetches `/me/profile` once via `useAsyncData`; the auth composable's
 * shared `user` ref keeps the page in sync after edits without a refetch.
 *
 * `definePageMeta({ middleware: 'auth' })` redirects unauthenticated
 * visitors to `/login?redirect=/me/profile`.
 */

definePageMeta({ middleware: 'auth' })

const auth = useAuth()
const toast = useToast()

const { data: profile, refresh } = await useAsyncData(
  'me-profile',
  async () => {
    try { return await useApi().me.profile() }
    catch { return null }
  },
)

// Hydrate the shared `useAuth().user` ref from the SSR fetch so the
// rest of the layout (toolbar avatar, etc.) sees the same user without
// a second request once we navigate here.
watchEffect(() => {
  if (profile.value) auth.user.value = profile.value
})

const { t } = useI18n()
useSotweMeta({
  title: t('myProfilePage.meta.title'),
  description: t('myProfilePage.meta.description'),
  noindex: true,
})

const changePasswordOpen = ref(false)
const deleteOpen = ref(false)
const cancelRenewalOpen = ref(false)

function signOut() {
  auth.signOut()
  toast.add({ title: t('edit_profile.signedOut'), icon: 'i-lucide-check', color: 'success' })
  navigateTo('/', { replace: true })
}
</script>

<template>
  <STopBar :title="t('navigation.myProfile')" />

  <section v-if="profile" class="flex flex-col gap-6 px-4 py-6">
    <div class="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
      <UAvatar
        :src="profile.profilePic || undefined"
        :alt="profile.name"
        size="xl"
        class="size-20 ring-1 ring-twitter-slate-100 dark:ring-twitter-slate-700"
      />
      <div class="flex flex-1 flex-col gap-1">
        <div class="text-xl font-bold">{{ profile.name }}</div>
        <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          @{{ profile.username }}
        </div>
        <div class="text-sm text-twitter-slate-500 dark:text-twitter-slate-400">
          {{ profile.email }}
        </div>
      </div>
      <SAvatarUploadButton />
    </div>

    <div
      v-if="profile.subscription"
      class="flex flex-col gap-3 rounded-2xl border border-twitter-blue-200 bg-twitter-blue-50 p-4 dark:border-twitter-blue-700 dark:bg-twitter-blue-950"
    >
      <div class="flex items-center gap-2 font-bold">
        <Icon name="i-lucide-badge-check" class="size-5 text-twitter-blue-500" />
        {{ profile.subscription.name }}
      </div>
      <p v-if="profile.subscription.description" class="text-sm text-twitter-slate-600 dark:text-twitter-slate-300">
        {{ profile.subscription.description }}
      </p>
      <p class="text-xs text-twitter-slate-500 dark:text-twitter-slate-400">
        {{ t('me_profile.renewsRow', {
          renewal: profile.subscription.renewal,
          endDate: new Date(profile.subscription.endDate).toLocaleDateString(),
        }) }}
      </p>
      <!-- Cancel-renewal trigger only shows for paid tiers (priority > 0).
           Free-tier users have nothing to cancel — the button would 4xx
           from the backend. -->
      <div v-if="profile.subscription.priority > 0" class="flex flex-wrap gap-2">
        <SButton size="sm" variant="ghost" color="error" icon="i-lucide-x-circle" @click="cancelRenewalOpen = true">
          {{ t('me_profile.cancelRenewal') }}
        </SButton>
        <SButton size="sm" variant="ghost" to="/pricing" icon="i-lucide-arrow-up-right">
          {{ t('me_profile.managePlan') }}
        </SButton>
      </div>
      <SButton v-else size="sm" to="/pricing" icon="i-lucide-sparkles">
        {{ t('me_profile.upgradeToPremium') }}
      </SButton>
    </div>

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold">{{ t('me_profile.profileInformation') }}</h2>
      <SEditProfileForm :profile="profile" @updated="refresh" />
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold">{{ t('me_profile.accountSecurity') }}</h2>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SButton
          variant="outline"
          icon="i-lucide-key-round"
          @click="changePasswordOpen = true"
        >
          {{ t('me_profile.changePassword') }}
        </SButton>
        <SButton
          variant="ghost"
          icon="i-lucide-log-out"
          @click="signOut"
        >
          {{ t('me_profile.signOut') }}
        </SButton>
        <SButton
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          @click="deleteOpen = true"
        >
          {{ t('me_profile.deleteAccount') }}
        </SButton>
      </div>
    </section>

    <SChangePasswordDialog v-model="changePasswordOpen" />
    <SDeleteAccountDialog v-model="deleteOpen" :username="profile.username" />
    <SCancelRenewalDialog v-model="cancelRenewalOpen" @done="refresh" />
  </section>

  <section v-else class="flex min-h-dvh items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <Icon name="i-lucide-loader-circle" class="size-8 animate-spin text-twitter-blue-500" />
      <p class="text-sm text-twitter-slate-500">{{ t('me_profile.loading') }}</p>
    </div>
  </section>
</template>
