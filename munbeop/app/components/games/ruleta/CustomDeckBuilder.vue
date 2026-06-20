<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'
import {
  deckColorVar, DECK_COLOR_IDS, DECK_ICONS, MIN_CUSTOM_PLAYABLE,
} from '~/components/games/ruleta/cards'
import { DEFAULT_DECK_COLOR_ID, DEFAULT_DECK_ICON } from '~/lib/domain'

const props = defineProps<{ deckId: string | null }>()
const emit = defineEmits<{ saved: [] }>()

const { t, locale } = useI18n()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()

const name = ref('')
const colorId = ref<string>(DEFAULT_DECK_COLOR_ID)
const icon = ref<string>(DEFAULT_DECK_ICON)
const selected = ref<string[]>([])
const search = ref('')
const confirmingDelete = ref(false)

onMounted(() => {
  if (props.deckId) {
    const d = customDecks.deckById(props.deckId)
    if (d) {
      name.value = d.name
      colorId.value = d.colorId
      icon.value = d.icon
      selected.value = [...d.grammarKos]
    }
  }
})

const selectedSet = computed(() => new Set(selected.value))
const canSave = computed(() => name.value.trim().length > 0)

/** Grammar grouped by level (deck order), filtered by the search query. */
const groups = computed(() => {
  const q = search.value.trim().toLowerCase()
  const loc = (locale?.value ?? 'en') as keyof (typeof grammarStore.items)[number]['meaning']
  const matches = (g: (typeof grammarStore.items)[number]) =>
    !q ||
    g.ko.toLowerCase().includes(q) ||
    String(g.meaning[loc] ?? '').toLowerCase().includes(q)
  return [...grammarStore.decks]
    .sort((a, b) => a.order - b.order)
    .map((deck) => ({
      deck,
      items: grammarStore.items.filter((g) => g.deckId === deck.id && matches(g)),
    }))
    .filter((group) => group.items.length > 0)
})

function toggle(ko: string) {
  selected.value = selectedSet.value.has(ko)
    ? selected.value.filter((k) => k !== ko)
    : [...selected.value, ko]
}

async function save() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  const payload = { name: trimmed, colorId: colorId.value, icon: icon.value, grammarKos: [...selected.value] }
  if (props.deckId) await customDecks.updateDeck(props.deckId, payload)
  else await customDecks.addDeck(payload)
  emit('saved')
}

async function remove() {
  if (props.deckId) await customDecks.removeDeck(props.deckId)
  emit('saved')
}
</script>

<template>
  <article class="builder">
    <label class="builder__field">
      <span class="builder__label">{{ t('practice.custom.name') }}</span>
      <input
        v-model="name"
        type="text"
        class="builder__input"
        data-testid="builder-name"
        :placeholder="t('practice.custom.name_placeholder')"
      >
    </label>

    <div class="builder__field">
      <span class="builder__label">{{ t('practice.custom.color') }}</span>
      <div class="swatches">
        <button
          v-for="c in DECK_COLOR_IDS"
          :key="c"
          type="button"
          class="swatch"
          :class="{ 'swatch--on': colorId === c }"
          :style="{ '--swatch': deckColorVar(c) }"
          :data-testid="`color-${c}`"
          :aria-label="c"
          :aria-pressed="colorId === c"
          @click="colorId = c"
        />
      </div>
    </div>

    <div class="builder__field">
      <span class="builder__label">{{ t('practice.custom.icon') }}</span>
      <div class="icons">
        <button
          v-for="ic in DECK_ICONS"
          :key="ic"
          type="button"
          class="icon-opt"
          :class="{ 'icon-opt--on': icon === ic }"
          :data-testid="`icon-${ic}`"
          :aria-label="ic"
          :aria-pressed="icon === ic"
          @click="icon = ic"
        >
          <Icon :name="(ic as IconName)" :size="20" />
        </button>
      </div>
    </div>

    <div class="builder__field">
      <div class="builder__grammar-head">
        <span class="builder__label">{{ t('practice.custom.grammar') }}</span>
        <span
          class="builder__count"
          :class="{ 'builder__count--ok': selected.length >= MIN_CUSTOM_PLAYABLE }"
        >
          {{ t('practice.custom.selected_count', { count: selected.length }) }}
        </span>
      </div>
      <p v-if="selected.length < MIN_CUSTOM_PLAYABLE" class="builder__hint">
        {{ t('practice.custom.need_six_hint') }}
      </p>
      <input
        v-model="search"
        type="search"
        class="builder__input"
        data-testid="builder-search"
        :placeholder="t('practice.custom.search_placeholder')"
      >
      <div class="grammar-groups">
        <div v-for="group in groups" :key="group.deck.id" class="grammar-group">
          <p class="grammar-group__title">{{ group.deck.name }}</p>
          <div class="grammar-list">
            <button
              v-for="g in group.items"
              :key="g.ko"
              type="button"
              class="grammar-opt"
              :class="{ 'grammar-opt--on': selectedSet.has(g.ko) }"
              :data-testid="`grammar-opt-${g.ko}`"
              :aria-pressed="selectedSet.has(g.ko)"
              @click="toggle(g.ko)"
            >
              <span class="grammar-opt__check" aria-hidden="true">
                <Icon v-if="selectedSet.has(g.ko)" name="deck-star" :size="12" />
              </span>
              <span class="grammar-opt__ko">{{ g.ko }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="builder__actions">
      <template v-if="props.deckId">
        <button
          v-if="!confirmingDelete"
          type="button"
          class="builder__btn builder__btn--danger"
          data-testid="builder-delete"
          @click="confirmingDelete = true"
        >
          {{ t('practice.custom.delete') }}
        </button>
        <button
          v-else
          type="button"
          class="builder__btn builder__btn--danger"
          data-testid="builder-delete-confirm"
          @click="remove"
        >
          {{ t('practice.custom.confirm_delete') }}
        </button>
      </template>
      <span class="builder__spacer" />
      <button
        type="button"
        class="builder__btn builder__btn--primary"
        data-testid="builder-save"
        :disabled="!canSave"
        @click="save"
      >
        {{ t('practice.custom.save') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.builder { display: flex; flex-direction: column; gap: 18px; min-width: min(520px, 80vw); }
.builder__field { display: flex; flex-direction: column; gap: 8px; }
.builder__label { font-weight: 600; font-size: 0.9rem; }
.builder__input {
  font: inherit; padding: 8px 10px;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
}
.builder__input:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 1px; }

.swatches, .icons { display: flex; flex-wrap: wrap; gap: 8px; }
.swatch {
  width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
  background: var(--swatch); border: 3px solid transparent;
}
.swatch--on { border-color: var(--ink, var(--ink-soft)); }
.swatch:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.icon-opt {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit; cursor: pointer;
}
.icon-opt--on { border-color: var(--focus-ring, #d8842f); background: var(--paper-warm, var(--surface)); }
.icon-opt:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }

.builder__grammar-head { display: flex; align-items: baseline; justify-content: space-between; }
.builder__count { font-size: 0.85rem; color: var(--text-soft, var(--ink-soft)); }
.builder__count--ok { color: var(--jade-deep, var(--jade)); font-weight: 600; }
.builder__hint { margin: 0; font-size: 0.8rem; color: var(--text-soft, var(--ink-soft)); }

.grammar-groups { display: flex; flex-direction: column; gap: 12px; max-height: 40vh; overflow-y: auto; padding-right: 4px; }
.grammar-group__title { margin: 0 0 6px; font-size: 0.8rem; color: var(--text-soft, var(--ink-soft)); }
.grammar-list { display: flex; flex-wrap: wrap; gap: 6px; }
.grammar-opt {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 9px; font: inherit; cursor: pointer;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
}
.grammar-opt--on { border-color: var(--jade-deep, var(--jade)); background: color-mix(in srgb, var(--jade) 16%, var(--surface)); }
.grammar-opt:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 1px; }
.grammar-opt__check { width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; }

.builder__actions { display: flex; align-items: center; gap: 10px; }
.builder__spacer { flex: 1; }
.builder__btn {
  font: inherit; font-weight: 600; padding: 9px 16px; cursor: pointer;
  border: 3px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
}
.builder__btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.builder__btn:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.builder__btn--primary { background: var(--gold, var(--paper-warm)); }
.builder__btn--danger { color: var(--red-deep, var(--red)); border-color: var(--red-deep, var(--red)); box-shadow: none; }
</style>
