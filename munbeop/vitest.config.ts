import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // The Vue plugin lets component tests import .vue SFCs directly. Without
  // it Vite fails on the first `<template>` block in any imported component.
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/lib/**/*.ts',
        'app/composables/**/*.ts',
        'app/stores/**/*.ts',
      ],
    },
  },
  resolve: {
    alias: {
      // '~' mirrors Nuxt 4 convention: points to the srcDir (app/), so '~/lib/domain'
      // resolves consistently in source files and tests.
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
