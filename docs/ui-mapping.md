# Vuetify 1 → Nuxt UI v4 component mapping

Reference table used during the component port in Faz 6. When a sotwe-ui v1
component reaches for a `v-*` element, replace it with the row's target.
Primitives prefixed `S*` are in `app/components/ui/` — use those instead of
reaching directly for Nuxt UI where we have a wrapper.

| Vuetify 1 (v1) | Nuxt UI v4 (v2) | Sotwe primitive | Notes |
|---|---|---|---|
| `<v-app dark>` | Plain `<div>` + `dark:` classes | — | Color mode lives in `useColorMode()`; no root provider needed |
| `<v-app-bar>` | Custom `<header>` + sticky | `SToolbar` (Faz 4) | Twitter pattern: 56px, `border-b`, sticky top |
| `<v-main>` + `<v-container>` | Plain `<main class="mx-auto max-w-3xl">` | — | Drop the container / gutter system; use grid on `layouts/default.vue` |
| `<v-row>` / `<v-col>` | Tailwind grid / flex | — | The v1 site barely used the Vuetify grid — only the home rail needs `md:grid-cols-3` |
| `<v-btn>` | `UButton` | `SButton`, `SIconButton` | Pill shape + X blue, text-only via `variant="ghost"` |
| `<v-card>` + `<v-sheet>` | `UCard` / plain | `SCard` | Adds X surface radius (2xl), border vs shadow (v1 shadow dropped) |
| `<v-dialog>` | `UModal` | `SDialog` | `v-model` maps to `:open` |
| `<v-menu>` | `UDropdownMenu` | `SMenu` | |
| `<v-tooltip>` | `UTooltip` | `STooltip` | |
| `<v-text-field>` | `UInput` + `UFormField` | — | Used via `UForm` in auth flows |
| `<v-form>` | `UForm` + zod schema | — | Replaces Vuetify validation rules |
| `<v-avatar>` | `UAvatar` | `SAvatar` | Wraps for verified tick + `NuxtLink` |
| `<v-icon>` | `<Icon>` (`@nuxt/icon`) | — | FontAwesome → Lucide / Remix Icons by default |
| `<v-img>` | `<NuxtImg>` (`@nuxt/image`) | — | Drop v1's custom `common/Image.vue` lazy loader — `<NuxtImg loading="lazy">` + Intersection Observer fallback |
| `<v-divider>` | `USeparator` | `SDivider` | |
| `<v-progress-circular>` | `UIcon` + animate-spin | — | Use `i-lucide-loader-circle` + `.animate-spin` |
| `<v-skeleton-loader>` | — | `SSkeleton` | Pulse box with slate-100 / slate-800 |
| `<v-snackbar>` / `vue-toastification` | `useToast` | — | Drop `vue-toastification` |
| `<v-chip>` | `UBadge` | — | For hashtag tag lists, user categories |
| `<v-list>` / `<v-list-item>` | Plain `<ul>` + Tailwind | — | Last-seen + popular-users widgets |
| `<v-carousel>` | Custom | — | `common/Carousel.vue` → `swiper` or custom scroll-snap (few call sites) |
| `<v-tabs>` | `UTabs` | — | Search page tweet/user split |
| `<v-pagination>` | — | — | Not used in v1 (all infinite scroll) |
| `vue-infinite-scroll` | `@vueuse/core useInfiniteScroll` | `SInfiniteScroll` | Generic slot over items |
| `vue-timeago` | `date-fns/formatDistanceToNowStrict` | — | Wrap in `app/utils/timeago.ts` with locale map |
| `vue-social-sharing` | — | `useShare` composable | See Faz 6 — share modal |

## Color tokens

All colors flow through `app/assets/css/main.css`'s `@theme static` block and
the Nuxt UI aliases in `app/app.config.ts`:

- `primary` → `twitter-blue` (500 default)
- `neutral` → `twitter-slate`
- Light surface: `bg-white`, text `twitter-slate-900`, muted `twitter-slate-500`, border `twitter-slate-100`, hover `twitter-slate-50`
- Dark surface: `bg-black`, text `twitter-slate-100`, muted `twitter-slate-400`, border `twitter-slate-700`, hover `twitter-slate-900`

If a component reaches for `primary-500` or `slate-*` without the `twitter-`
prefix, you're bypassing the design system — stop and plumb it through the
theme tokens instead.

## When to add a new `S*` primitive

- If the same Nuxt UI component is wrapped identically in 3+ places (e.g.
  every `UButton` uses `rounded-full` + `font-semibold`).
- If we need to decorate Nuxt UI's output (verified tick on avatar, counter
  badge on icon button).
- If Nuxt UI doesn't ship the primitive at all (infinite scroll, custom
  carousel, theme toggle).

Do NOT wrap a Nuxt UI component just to rename it.
