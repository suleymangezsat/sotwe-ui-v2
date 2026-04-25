// https://eslint.nuxt.com
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // `client<void>()` is a legitimate way to type an endpoint that returns
    // no body; we don't want to paper over it with `client<undefined>`.
    '@typescript-eslint/no-invalid-void-type': 'off',
  },
})
