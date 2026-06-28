// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', 'app/i18n/locales/**', 'supabase/functions/**'],
  },
  {
    // Layer boundary: domain code (lib / stores / composables) must not import
    // upward from components/. Shared constants/types belong in lib/ — this is
    // what kept the garden-tree and Bomi-pose data trapped in .vue files.
    files: ['app/lib/**/*.ts', 'app/stores/**/*.ts', 'app/composables/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['~/components/*', '~/components/**', '**/components/*', '**/components/**'],
              message:
                'Domain code (lib/stores/composables) must not import from components/. Move shared constants/types into lib/.',
            },
          ],
        },
      ],
    },
  },
)
