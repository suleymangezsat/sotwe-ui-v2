<script setup lang="ts">
/*
 * Default layout — Twitter-style 3-column shell.
 *
 *   [  sidebar  |  main (NuxtPage)  |  right rail  ]
 *     ~275px         flex-1 max-600px    ~350px
 *
 * Breakpoints (tailwind defaults, `md`=768 / `lg`=1024 / `xl`=1280):
 *   < md    : sidebar hidden, right rail hidden, bottom nav visible
 *   md..lg  : icon-only sidebar (80px), right rail hidden
 *   lg..xl  : icon-only sidebar + right rail
 *   >= xl   : full labelled sidebar + right rail
 *
 * The sidebar / right rail are sticky at `top: 0` with their own scroll,
 * so only the middle column scrolls the page — same pattern as x.com.
 *
 * Modal stack (LoginDialog, SignupDialog, MessageDialog, MediaModal, ...)
 * is rendered inside <ClientOnly> at the bottom so it doesn't bloat SSR
 * HTML. Each dialog reads its own state from `useUiStore()` so the
 * layout doesn't need to pipe props through.
 */

/*
 * Per-locale `<html lang>` attribute. With `strategy: 'no_prefix'` every
 * URL is shared across locales (matches v1 — see `nuxt.config.ts` i18n
 * comment), so there's no hreflang chain to emit; `useLocaleHead({ seo:
 * false })` just gives us the language code for the html tag without
 * generating misleading alternate links that would all point to the same
 * URL.
 *
 * `useSotweMeta` keeps owning the canonical link + OG / Twitter cards.
 */
const localeHead = useLocaleHead({ dir: true, lang: true, seo: false })
useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs ?? {},
}))
</script>

<template>
  <!--
    CSS Grid — deterministic column tracks that don't reflow with content.
    Tracks chosen to match the X.com spacing:
      < md  : 1 column (main) + bottom nav
      md..lg: 80px sidebar | main | — (no right rail)
      lg..xl: 80px sidebar | 600px main | 320px right rail
      >= xl : 275px sidebar | 600px main | 350px right rail
    Grid column sizes are fixed once the breakpoint matches — no
    intermediate flex-grow recalculation during hydration.
  -->
  <div
    class="mx-auto grid min-h-dvh w-full max-w-[1280px] gap-x-4 px-0 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[80px_600px_320px] lg:gap-x-8 xl:grid-cols-[275px_600px_350px] xl:px-4"
  >
    <SSidebar />

    <main class="flex min-w-0 flex-col border-x border-twitter-slate-100 pb-16 md:pb-0 dark:border-twitter-slate-700">
      <slot />
    </main>

    <SRightRail />
    <SBottomNav />

    <!--
      Global dialog stack. Each component mounts once and reads its open
      state from `useUiStore()` so any tweet row, sidebar action, or
      composable can trigger one with a single store write — no
      v-model plumbing through every parent. <ClientOnly> prevents the
      backdrop / portal markup from bloating the SSR HTML.
    -->
    <ClientOnly>
      <SMediaDialog />
      <SReportDialog />
      <SLoginDialog />
      <SSignupDialog />
      <SForgotPasswordDialogGlobal />
      <SGenericErrorDialog />
      <SSocialShareDialog />
      <SLocationPermissionDialog />
      <SCampaignDialog />
      <SNearbyDialog />
    </ClientOnly>
  </div>
</template>
