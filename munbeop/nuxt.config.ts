// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-01',
  devtools: { enabled: true },
  // SPA mode: the app is a learning game that stores everything in
  // localStorage on the client. SSR + hydration with Nuxt 4 + @nuxtjs/i18n v9
  // was producing 'SyntaxError: 26' in devalue's payload parser on the
  // client during hydration, blocking the whole app from initializing.
  // SPA mode eliminates hydration entirely. SEO/first-paint trade-off
  // is acceptable for a logged-in app behind auth; we can re-enable SSR
  // in a later plan once a known-good config is confirmed.
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],
  // Values default to empty strings here; Nuxt overrides them at runtime
  // from environment variables (NUXT_PUBLIC_* on the client, others server-only).
  runtimeConfig: {
    supabaseServiceRoleKey: '',
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
    // on hydration (SyntaxError: 26). LocaleSwitcher + the i18n-persist
    // client plugin handle locale selection without needing this.
    detectBrowserLanguage: false,
    bundle: {
      optimizeTranslationDirective: false,
    },
    // Lazy-load locale messages: only the active (and fallback 'en') locale's
    // JSON ships in the entry bundle; the other six split into async chunks
    // fetched on demand when the user switches. Safe here because every locale
    // switch goes through i18n's setLocale() (LocaleSwitcher.vue,
    // lib/i18n/sync-locale.ts) — which triggers the async message load — and
    // never assigns locale.value directly. fallbackLocale 'en'
    // (i18n/i18n.config.ts) is loaded eagerly by @nuxtjs/i18n.
    lazy: true,
  },
  app: {
    head: {
      title: 'Munbeop Garden',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        // Browser chrome / PWA splash tint per system scheme: pergamino
        // (light --paper) and abisal (dark --paper).
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f4ecd8' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0c1220' },
      ],
    },
  },
})
