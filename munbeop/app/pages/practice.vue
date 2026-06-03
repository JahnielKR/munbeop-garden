<script setup lang="ts">
import { nextTick } from 'vue'
import GrammarCard from '~/components/practice/GrammarCard.vue'
import CompletionBanner from '~/components/practice/CompletionBanner.vue'
import Button from '~/components/ui/Button.vue'
import Bomi from '~/components/bomi/Bomi.vue'
import { useBomiStore } from '~/stores/bomi'

definePageMeta({ surface: 'game' })

const { session, error, completed, start, grammarOf, currentContextOf, persistEntry, reset } =
  usePractice()
const toast = useToast()
const { t } = useI18n()
const bomi = useBomiStore()

async function onStart() {
  await start()
  if (error.value) toast.show(error.value)
}

/**
 * After a save, scroll the next still-active card into view on mobile.
 * Within a card the context advances in place (no scroll needed). When
 * a card's 3rd context finishes, the card unmounts and the next one
 * shifts up via reflow — on mobile we explicitly scroll so the user
 * sees the new card at the top rather than ending up at whatever
 * scrollTop the reflow left them with. Desktop already shows all cards
 * stacked, no scroll needed. (G9 from audit.)
 */
function scrollNextCardIntoView() {
  if (window.innerWidth >= 768) return
  const slots = document.querySelectorAll('.card-slot')
  for (const slot of slots) {
    const card = slot.querySelector('.card')
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' })
      break
    }
  }
}

async function onSubmit(payload: {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
}) {
  const entry = await persistEntry(payload)
  if (entry) {
    bomi.react(payload.feedback === 'easy' ? 'happy' : 'sad')
    toast.show(
      payload.feedback === 'easy'
        ? t('practice.toast_saved_easy')
        : t('practice.toast_saved_hard'),
    )
    await nextTick()
    scrollNextCardIntoView()
  }
}

async function onRestart() {
  reset()
  await onStart()
}
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">연습</span>
      <span class="title__es">{{ t('title.practice') }}</span>
    </h1>

    <div class="bomi-row">
      <Bomi :pose="bomi.activePose" :scale="3" />
    </div>

    <div v-if="!session" class="intro">
      <p class="intro__text">{{ t('practice.intro_lead') }}</p>
      <Button variant="primary" @click="onStart">{{ t('practice.spin') }}</Button>
    </div>

    <div v-else class="session">
      <div v-for="(pick, i) in session.picks" :key="i" class="card-slot">
        <GrammarCard
          v-if="grammarOf(i) && currentContextOf(i) && pick.progress < 3"
          :grammar="grammarOf(i)!"
          :context="currentContextOf(i)!"
          :progress="pick.progress"
          :pick-index="i"
          @submit="onSubmit"
        />
      </div>
      <CompletionBanner v-if="completed" @restart="onRestart" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.title__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: var(--accent);
}
.title__es {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  color: var(--text);
}
.intro {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  text-align: center;
}
.intro__text {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  margin-bottom: 18px;
  line-height: 1.5;
}
.session {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.bomi-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
</style>
