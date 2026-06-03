<script setup lang="ts">
import GrammarCard from '~/components/practice/GrammarCard.vue'
import CompletionBanner from '~/components/practice/CompletionBanner.vue'
import PixelButton from '~/components/ui/PixelButton.vue'

const { session, error, completed, start, grammarOf, currentContextOf, persistEntry, reset } =
  usePractice()
const toast = useToast()
const { t } = useI18n()

async function onStart() {
  await start()
  if (error.value) toast.show(error.value)
}

async function onSubmit(payload: {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
}) {
  const entry = await persistEntry(payload)
  if (entry) {
    toast.show(
      payload.feedback === 'easy'
        ? t('practice.toast_saved_easy')
        : t('practice.toast_saved_hard'),
    )
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

    <div v-if="!session" class="intro">
      <p class="intro__text">{{ t('practice.intro_lead') }}</p>
      <PixelButton variant="primary" @click="onStart">{{ t('practice.spin') }}</PixelButton>
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
  color: var(--jade);
}
.title__es {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink);
}
.intro {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  text-align: center;
}
.intro__text {
  font-family: 'Inter', sans-serif;
  color: var(--muted);
  margin-bottom: 18px;
  line-height: 1.5;
}
.session {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
