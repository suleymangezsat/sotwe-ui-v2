import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/utils/**',
        'app/composables/**',
        'app/stores/**',
        'app/middleware/**',
        'server/**',
        'shared/**',
      ],
    },
  },
})
