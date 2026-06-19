<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

/**
 * Fatal error boundary. Nuxt renders this OUTSIDE NuxtLayout when an error
 * bubbles past the page tree — a throw in page setup, a render error, a 404
 * on a mistyped route, or (the common one for this SPA, ssr:false) a
 * chunk-load failure when a stale client requests a hash a fresh deploy no
 * longer serves. So it carries its own minimal wood-frame chrome and a way
 * back in, instead of falling through to Nuxt's unstyled default screen.
 *
 * The error prop shape is declared locally rather than imported from '#app'
 * so the component also resolves under vitest (where '#app' isn't aliased);
 * it mirrors the NuxtError fields we actually read.
 */
const props = defineProps<{
  error: { statusCode?: number; statusMessage?: string; message?: string }
}>()

const { t } = useI18n()

// A stale SPA bundle requesting a missing chunk throws this; a hard reload
// fetches index.html plus the fresh build, so we lead with reload there.
const isChunkError = computed(() =>
  /dynamically imported module|module script failed|chunk/i.test(props.error?.message ?? ''),
)

function reload() {
  window.location.reload()
}
function goHome() {
  // clearError unmounts the error page; redirect re-enters the app shell.
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="fatal">
    <div class="fatal__card" role="alert">
      <h1 class="fatal__title">{{ t('errors.fatal_title') }}</h1>
      <p class="fatal__body">{{ t('errors.fatal_body') }}</p>
      <p v-if="error?.statusCode" class="fatal__code" aria-hidden="true">{{ error.statusCode }}</p>
      <div class="fatal__actions">
        <Button :variant="isChunkError ? 'primary' : 'secondary'" @click="reload">
          {{ t('errors.reload') }}
        </Button>
        <Button :variant="isChunkError ? 'secondary' : 'primary'" @click="goHome">
          {{ t('errors.go_home') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fatal {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--paper);
}
.fatal__card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
  padding: 28px 24px;
  text-align: center;
}
.fatal__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.fatal__body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-soft);
}
.fatal__code {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--ink-soft);
  opacity: 0.7;
}
.fatal__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 6px;
}
</style>
