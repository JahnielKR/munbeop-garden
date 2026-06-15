<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import { NuxtLink } from '#components'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'

const { t } = useI18n()
const { theme } = useTheme()
const authStore = useAuthStore()
const settings = useSettingsStore()
const { signOutAndExit } = useAuth()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const email = computed(() => authStore.user?.email ?? '')
const initial = computed(() => (email.value.trim()[0] ?? '?').toUpperCase())
const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

function close() {
  open.value = false
}
async function onSignOut() {
  await signOutAndExit()
}
function onDocClick(e: MouseEvent) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) close()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="acct">
    <button
      type="button"
      class="acct__avatar"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="email || t('settings.menu.account')"
      @click.stop="open = !open"
    >
      {{ initial }}
    </button>

    <div v-if="open" class="acct__menu" role="menu">
      <p class="acct__email">{{ email }}</p>
      <div class="acct__row">
        <Field :label="t('settings.dark_mode')" html-for="acct-dark" orientation="horizontal">
          <Toggle id="acct-dark" v-model="isDark" :label="t('settings.dark_mode')" />
        </Field>
      </div>
      <div class="acct__row">
        <LocaleSwitcher />
      </div>
      <NuxtLink to="/settings" class="acct__item" role="menuitem" @click="close">
        {{ t('nav.settings') }}
      </NuxtLink>
      <button type="button" class="acct__item acct__signout" role="menuitem" @click="onSignOut">
        {{ t('auth.sign_out') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.acct {
  position: relative;
  display: flex;
  justify-content: center;
}
.acct__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  cursor: pointer;
  box-shadow: var(--shadow-button);
}
.acct__avatar:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.acct__menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 220px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-color);
  padding: 14px;
}
.acct__email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-soft);
  word-break: break-all;
  margin: 0;
}
.acct__row {
  display: flex;
  flex-direction: column;
}
.acct__item {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  text-align: left;
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  padding: 10px;
  cursor: pointer;
  text-decoration: none;
}
.acct__item:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
.acct__item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.acct__signout {
  color: var(--danger);
}
:lang(th) .acct__item,
:lang(vi) .acct__item,
:lang(ja) .acct__item {
  font-size: 11px;
}
</style>
