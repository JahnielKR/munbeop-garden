// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-01',
  // Opt in explicitly when needed. Keeping the DevTools RPC off by default
  // narrows the local dev-server attack surface on shared networks.
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  // SPA mode: this is an authenticated learning game whose account data lives
  // in Supabase (only device preferences such as locale/theme use localStorage).
  // SSR hydration with Nuxt 4 + @nuxtjs/i18n v9 previously hit 'SyntaxError: 26'
  // in devalue's payload parser and blocked client initialization. The
  // SEO/first-paint trade-off remains acceptable for the product behind auth.
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],
  // Values default to empty strings here; Nuxt overrides them at runtime
  // from environment variables (NUXT_PUBLIC_* on the client, others server-only).
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      appUrl: '',
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' },
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
    ],
    // detectBrowserLanguage disabled: with strategy: 'no_prefix' the
    // 'redirectOn: root' rewrite was producing a malformed SSR path
    // ('/?%2F' decodes to '/?/'), which broke devalue's payload parser
    // on hydration (SyntaxError: 26). LocaleSwitcher + the reactive locale
    // bridge handle persisted locale selection without this redirect layer.
    detectBrowserLanguage: false,
    // @nuxtjs/i18n v10 lazy-loads configured locale files: only the active
    // locale and fallback English ship initially; the others are async chunks
    // fetched on demand when the user switches. Safe here because every locale
    // switch goes through i18n's setLocale() (LocaleSwitcher.vue,
    // lib/i18n/sync-locale.ts) — which triggers the async message load — and
    // never assigns locale.value directly. fallbackLocale 'en'
    // (i18n/i18n.config.ts) is loaded eagerly by @nuxtjs/i18n.
  },
  app: {
    head: {
      title: 'Munbeop Garden',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        // Browser chrome tint per system scheme: pergamino (light --paper)
        // and abisal (dark --paper).
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f4ecd8' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0c1220' },
      ],
    },
  },
})
