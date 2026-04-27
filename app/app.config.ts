// https://ui.nuxt.com/getting-started/theme#design-system
export default defineAppConfig({
  ui: {
    colors: {
      // Map Nuxt UI aliases to our Twitter tokens so `color="primary"` yields
      // the Twitter blue everywhere and `color="neutral"` uses the X slate.
      primary: 'twitter-blue',
      neutral: 'twitter-slate',
    },
    button: {
      defaultVariants: {
        color: 'primary',
        size: 'md',
      },
      slots: {
        base: ['rounded-full font-semibold'],
      },
    },
    card: {
      slots: {
        root: 'rounded-2xl',
      },
    },
    // Inputs intentionally use `rounded-lg`, not the pill shape we apply to
    // buttons. When inputs and buttons share the same radius the form starts
    // to look like a stack of buttons — visual hierarchy collapses, and the
    // visitor can't tell at a glance which element accepts text and which
    // submits. Pills for actions; soft rectangles for fields.
    input: {
      slots: {
        base: 'rounded-lg',
      },
    },
    textarea: {
      slots: {
        base: 'rounded-lg',
      },
    },
    select: {
      slots: {
        base: 'rounded-lg',
      },
    },
    selectMenu: {
      slots: {
        base: 'rounded-lg',
      },
    },
  },
})
