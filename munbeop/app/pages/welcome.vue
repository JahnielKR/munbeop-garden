<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import WelcomeStage from '~/components/welcome/WelcomeStage.vue'
import WelcomeScanlineOverlay from '~/components/welcome/WelcomeScanlineOverlay.vue'
import WelcomeBrandMark from '~/components/welcome/WelcomeBrandMark.vue'
import WelcomeThemeToggle from '~/components/welcome/WelcomeThemeToggle.vue'
import WelcomeMusicToggle from '~/components/welcome/WelcomeMusicToggle.vue'
import WelcomePulseButton from '~/components/welcome/WelcomePulseButton.vue'
import WelcomeSidebar from '~/components/welcome/WelcomeSidebar.vue'
import WelcomeAuthOptions from '~/components/welcome/WelcomeAuthOptions.vue'
import WelcomeDialog from '~/components/welcome/WelcomeDialog.vue'

definePageMeta({ layout: 'welcome', surface: 'welcome' })

const { t } = useI18n()
const { theme, setTheme, hydrate: hydrateTheme } = useTheme()
const { hydrate: hydrateMusic, ensurePlaying: ensureMusicPlaying } = useWelcomeMusic()

const sidebarOpen = ref(false)
const dialogText = ref('')
const dialogVariant = ref<'normal' | 'error'>('normal')

const scanlineActive = ref(false)
const scanlineDirection = ref<'up' | 'down'>('down')

const route = useRoute()

const initialEmailMode = computed<'signin' | 'signup' | 'magic' | null>(() => {
  const m = route.query.mode
  if (m === 'signin' || m === 'signup' || m === 'magic') return m
  return null
})

function showDialog(text: string, variant: 'normal' | 'error' = 'normal') {
  // Clearing then setting on the next tick forces useTypewriter's watcher
  // to fire even when the same text is passed twice in a row.
  dialogText.value = ''
  dialogVariant.value = variant
  setTimeout(() => { dialogText.value = text }, 16)
}

function openSidebar() {
  sidebarOpen.value = true
  showDialog(theme.value === 'light' ? t('welcome.dialog.intro_day') : t('welcome.dialog.intro_night'))
  // ENTER counts as the user's "intent to enter" — auto-start music so
  // the experience has a soundtrack. Catches autoplay-blocked errors
  // silently; the music toggle remains the manual recourse.
  ensureMusicPlaying().catch(() => { /* autoplay blocked — silent */ })
}

function closeSidebar() {
  sidebarOpen.value = false
  // Clear any lingering dialog so the user can't end up with stale copy
  // floating after the sidebar is gone (e.g. an intro line the user
  // didn't dismiss). If they had wanted to keep reading they would not
  // have closed the sidebar.
  dialogText.value = ''
}

function onThemeToggle() {
  scanlineDirection.value = theme.value === 'light' ? 'down' : 'up'
  scanlineActive.value = true
  // Clear any open dialog before the scene flips. The intro lines are
  // theme-specific ("the sun is up" / "the sky is purple") — leaving
  // the day intro visible after the night scene loads would read as a
  // bug. If the user wanted to keep reading they would have dismissed
  // the scanline trigger, not started a theme change mid-conversation.
  dialogText.value = ''
  // Flip the theme at the midpoint of the sweep so the new scene is fully
  // revealed by the time the line reaches the far edge.
  setTimeout(() => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }, 350)
  setTimeout(() => {
    scanlineActive.value = false
  }, 720)
}

function onWelcomed() {
  // The AuthOptions component already sets the localStorage flag; this hook
  // is reserved for future side-effects (analytics, toast, etc.).
}

onMounted(() => {
  hydrateTheme()
  hydrateMusic()
  if (route.query.open === 'signin') {
    openSidebar()
  }
})
</script>

<template>
  <div class="welcome" :data-theme="theme">
    <WelcomeStage :theme="theme" />

    <div class="welcome__chrome welcome__chrome--top-right">
      <WelcomeMusicToggle />
      <WelcomeThemeToggle :theme="theme" :disabled="scanlineActive" @toggle="onThemeToggle" />
    </div>

    <div class="welcome__brand">
      <WelcomeBrandMark />
    </div>

    <div class="welcome__cta">
      <WelcomePulseButton
        :expanded="sidebarOpen"
        controls="welcome-sidebar"
        @activate="openSidebar"
      />
    </div>

    <WelcomeSidebar
      id="welcome-sidebar"
      :open="sidebarOpen"
      title-id="welcome-sidebar-title"
      @close="closeSidebar"
    >
      <WelcomeAuthOptions
        :initial-email-mode="initialEmailMode"
        @dialog="(text, variant) => showDialog(text, variant ?? 'normal')"
        @welcomed="onWelcomed"
      />
    </WelcomeSidebar>

    <WelcomeDialog
      :text="dialogText"
      :variant="dialogVariant"
      @dismiss="dialogText = ''"
    />

    <WelcomeScanlineOverlay :active="scanlineActive" :direction="scanlineDirection" />
  </div>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}
.welcome__chrome {
  position: fixed;
  display: flex;
  gap: 10px;
  z-index: 15;
}
.welcome__chrome--top-right {
  top: 16px;
  right: 16px;
}
.welcome__brand {
  position: fixed;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}
.welcome__cta {
  position: fixed;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style>
