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
  // floating after the sidebar is gone.
  dialogText.value = ''
}

function onThemeToggle() {
  scanlineDirection.value = theme.value === 'light' ? 'down' : 'up'
  scanlineActive.value = true
  // Intro lines are theme-specific — wipe before the scene flips.
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
  // The AuthOptions component already sets the localStorage flag; this
  // hook is reserved for future side-effects (analytics, toast, etc.).
}

onMounted(() => {
  hydrateTheme()
  hydrateMusic()
  if (route.query.open === 'signin' && route.path.startsWith('/welcome')) {
    openSidebar()
  }
})
</script>

<template>
  <div class="welcome-shell" :data-theme="theme">
    <!-- Everything that "belongs to the scene" lives inside .welcome and
         shifts left when the sidebar opens, so the visible portion of
         the chrome stays centered in the now-narrower visible area
         (the right ~360px gets covered by the sidebar). -->
    <div class="welcome" :class="{ 'welcome--shifted': sidebarOpen }">
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

      <WelcomeDialog
        :text="dialogText"
        :variant="dialogVariant"
        @dismiss="dialogText = ''"
      />

      <WelcomeScanlineOverlay :active="scanlineActive" :direction="scanlineDirection" />
    </div>

    <!-- Sidebar lives OUTSIDE .welcome so it stays pinned to the right
         edge of the panel while .welcome shifts left under it. -->
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
  </div>
</template>

<style scoped>
/* The welcome panel lives inside CameraStage's left half (100vw × 100vh).
 * The CameraStage panel applies `transform: translateZ(0)` to itself,
 * which establishes a containing block for descendant `position: fixed`
 * — so the chrome elements below resolve to THIS panel's bounds, not
 * the viewport's. That way they ride along with the camera pan and
 * never bleed onto the in-app panel during the slide.
 *
 * welcome-shell wraps both .welcome (scene + chrome) AND the sidebar
 * as siblings. The sidebar stays pinned to the right edge of the
 * containing panel; .welcome shifts left when sidebar is open so the
 * visible chrome stays centered in the now-narrower visible area.
 * Without that shift the brand + pulse + dialog stay at panel-center
 * (x=700 at 1400px viewport) but the sidebar covers the right 360px,
 * so the chrome reads as "shoved right" — what the user perceives as
 * "el fondo se jala".
 *
 * --sidebar-shift is half the sidebar width so the chrome re-centers
 * in the visible 1040px window. Matched to the sidebar's own 360ms
 * cubic-bezier easing so the two motions move in lockstep.
 */
.welcome-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.welcome {
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  transition: transform 360ms cubic-bezier(0.1, 0.8, 0.3, 1);
  will-change: transform;
}
.welcome--shifted {
  transform: translateX(-180px);
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

@media (prefers-reduced-motion: reduce) {
  .welcome { transition: none; }
}
</style>
