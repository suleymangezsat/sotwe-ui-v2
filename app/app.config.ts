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
    input: {
      slots: {
        base: 'rounded-full',
      },
    },
  },
})
