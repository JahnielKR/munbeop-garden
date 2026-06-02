// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],
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
    lazy: false,
  },
  app: {
    head: {
      title: 'Munbeop Garden',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1a1f1a' },
      ],
    },
  },
})
