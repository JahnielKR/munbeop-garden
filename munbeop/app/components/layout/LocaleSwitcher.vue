<script setup lang="ts">
/**
 * LocaleSwitcher — UI locale picker.
 *
 * Renders a native <select> so screen readers and keyboards get their
 * standard combobox behaviour for free; the styling below kills the
 * native chrome (appearance: none + custom chevron) so the control
 * sits inside the LADX surface like the Input primitive does.
 */
import type { LocaleCode } from '~/lib/domain'
import { useLocaleStore } from '~/stores/locale'

const { locale, locales, setLocale, t } = useI18n()
const localeStore = useLocaleStore()

const options = computed(() => locales.value as Array<{ code: string; name: string }>)

function onChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value as LocaleCode
  void setLocale(code)
  localeStore.set(code)
}
</script>

<template>
  <label class="loc">
    <span class="loc__label">{{ t('common.language') }}</span>
    <select class="loc__select" :value="locale" @change="onChange">
      <option v-for="o in options" :key="o.code" :value="o.code">{{ o.name }}</option>
    </select>
  </label>
</template>

<style scoped>
.loc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.loc__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  color: var(--text-soft);
  text-transform: uppercase;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.loc__select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: var(--surface);
  /* Two diagonal linear-gradients fake a pixel-art chevron-down with
   * no extra SVG asset. The same pair scales with the chrome via
   * --text-soft so it remains visible across the theme toggle. */
  background-image:
    linear-gradient(45deg, transparent 50%, var(--text-soft) 50%),
    linear-gradient(135deg, var(--text-soft) 50%, transparent 50%);
  background-position: calc(100% - 14px) center, calc(100% - 10px) center;
  background-size: 5px 5px;
  background-repeat: no-repeat;
  color: var(--text);
  border: 2px solid var(--border);
  padding: 8px 28px 8px 10px;
  /* Pixel-art per user feedback. PS2P renders the Latin locale
   * names; CJK option labels (日本語) fall through to Noto Sans KR
   * so they read; Thai falls to system-ui. font-smoothing disabled
   * so the closed-state label looks identical to other pixel labels. */
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  line-height: 1.4;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  cursor: pointer;
}
/* Thai locale name "ไทย" at 10 px has unreadable tone marks. */
:lang(th) .loc__select,
:lang(vi) .loc__select {
  font-size: 13px;
}
.loc__select {
  outline: none;
  box-shadow: var(--shadow-input);
  transition:
    border-color var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.loc__select:hover {
  border-color: var(--border-strong);
}
.loc__select:focus-visible {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-input-focus);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
/* The dropdown menu itself stays native (browser-rendered popup).
 * Forcing it custom would require a portal + focus-trap rewrite that
 * the audit notes as a future Select primitive (02-primitives §13
 * stub). For now we own the closed-state chrome only. */
.loc__select option {
  /* The native dropdown menu uses OS chrome — most browsers ignore the
   * font-family on <option> in the open menu (Chrome / Safari), but
   * Firefox honours it. We declare the pixel chain anyway so any browser
   * that does render it stays on-brand. */
  background: var(--surface);
  color: var(--text);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
}
</style>
