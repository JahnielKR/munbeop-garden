<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import GrammarCard from '~/components/practice/GrammarCard.vue'
import CompletionBanner from '~/components/practice/CompletionBanner.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Bomi from '~/components/bomi/Bomi.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import CardDraw from '~/components/games/ruleta/CardDraw.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import { buildDeckOptions, deckColorVar, type DrawCard } from '~/components/games/ruleta/cards'
import { useBomiStore } from '~/stores/bomi'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'

definePageMeta({ surface: 'game' })

/**
 * Deck-draw game, three phases:
 *   pick — choose a TOPIK deck (or "all levels") from the shelf
 *   draw — the deck shuffles, 3 face-down cards are dealt, tap to flip
 *   play — the classic sentence-production loop (3 grammars × 3 contexts)
 *
 * The session is created the moment a deck is picked; the draw scene only
 * reveals it. A `?focus=<ko>` query (library CTA) skips straight to play.
 */

const { session, error, completed, start, grammarOf, currentContextOf, persistEntry, reset } =
  usePractice()
const toast = useToast()
const { t } = useI18n()
const bomi = useBomiStore()
const grammarStore = useGrammarStore()
const contextsStore = useContextsStore()
const route = useRoute()
const router = useRouter()

const phase = ref<'pick' | 'draw' | 'play'>('pick')
// In-flight latch: a double-click on a deck mat must not run start() twice
// (the second run would overwrite the session and mark extra grammars as
// seen in the SRS without the user ever practicing them).
const starting = ref(false)

// Wrappers receive programmatic focus after each phase swap so keyboard
// and screen-reader users land inside the new scene instead of on <body>.
const pickWrap = ref<HTMLElement | null>(null)
const drawWrap = ref<HTMLElement | null>(null)
const playWrap = ref<HTMLElement | null>(null)

async function focusPhaseWrap(el: { value: HTMLElement | null }) {
  await nextTick()
  el.value?.focus()
}

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)

const drawCards = computed<DrawCard[]>(() => {
  const s = session.value
  if (!s) return []
  return s.picks.map((_, i) => {
    const g = grammarOf(i)
    const deck = g ? grammarStore.decks.find((d) => d.id === g.deckId) : undefined
    return {
      ko: g?.ko ?? '?',
      deckName: deck?.name ?? '',
      color: deck ? deckColorVar(deck.colorId) : 'var(--ink-soft)',
    }
  })
})

async function onDeckSelect(deckId: string | null) {
  if (starting.value || phase.value !== 'pick') return
  starting.value = true
  try {
    await start({ deckId })
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'draw'
    await focusPhaseWrap(drawWrap)
  } finally {
    starting.value = false
  }
}

async function onDrawDone() {
  bomi.react('happy')
  phase.value = 'play'
  await focusPhaseWrap(playWrap)
}

onMounted(async () => {
  // Focused round from the library study sheet: the grammar is already
  // chosen, so the deck shelf and the draw theater would just be noise.
  // On a hard refresh / deep link this page mounts BEFORE the layout's
  // store hydration, so hydrate here first (idempotent) — otherwise the
  // grammar list is empty and the focus lookup falls through.
  if (typeof route.query.focus === 'string' && route.query.focus) {
    // The adapter throws on a Supabase error now; if the focus-round hydrate
    // fails, fall back to the normal picker rather than leaving an unhandled
    // rejection / a blank deep-link page.
    try {
      await Promise.all([grammarStore.hydrate(), contextsStore.hydrate()])
    } catch (err) {
      console.error('ruleta: focus-round hydration failed', err)
      return
    }
    await start()
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'play'
  }
})

/**
 * After a save, scroll the next still-active card into view on mobile.
 * Within a card the context advances in place (no scroll needed). When
 * a card's 3rd context finishes, the card unmounts and the next one
 * shifts up via reflow — on mobile we explicitly scroll so the user
 * sees the new card at the top rather than ending up at whatever
 * scrollTop the reflow left them with. (G9 from audit.)
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
    if (payload.feedback === 'easy') {
      toast.success(t('practice.toast_saved_easy'))
    } else {
      toast.info(t('practice.toast_saved_hard'))
    }
    await nextTick()
    scrollNextCardIntoView()
  }
}

async function onRestart() {
  reset()
  // Consume a leftover ?focus= param: without this, every deck picked
  // after restarting a focused round would silently rebuild the same
  // single-grammar session.
  if (route.query.focus !== undefined) {
    await router.replace({ query: {} })
  }
  phase.value = 'pick'
  await focusPhaseWrap(pickWrap)
}
</script>

<template>
  <div class="page">
    <GameExitButton :confirm="phase !== 'pick'" />
    <BilingualTitle ko="연습" :latin="t('title.practice')" />

    <div class="bomi-row">
      <Bomi :pose="bomi.activePose" :scale="3" />
    </div>

    <div v-if="phase === 'pick'" ref="pickWrap" tabindex="-1" class="phase-wrap">
      <p class="lead">{{ t('practice.deck_lead') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
    </div>

    <div v-else-if="phase === 'draw'" ref="drawWrap" tabindex="-1" class="phase-wrap">
      <CardDraw :cards="drawCards" @done="onDrawDone" />
    </div>

    <div v-else ref="playWrap" tabindex="-1" class="session phase-wrap">
      <div v-for="(pick, i) in session?.picks" :key="i" class="card-slot">
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
.lead {
  margin: 0 0 16px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: var(--text-soft, var(--ink-soft));
  line-height: 1.6;
  text-align: center;
}
/* Programmatic focus target after phase swaps — no visible ring needed,
 * the moved focus is for keyboard/SR continuity, not a visual control. */
.phase-wrap {
  outline: none;
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
