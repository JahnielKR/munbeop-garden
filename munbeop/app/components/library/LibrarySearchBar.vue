<script setup lang="ts">
/**
 * Library search + filter bar. Free-text input (ko / meaning), a TOPIK level
 * select, a grammar-category select (only categories present in the spine),
 * a result count, a clear button, and the active-zone banner for ?theme=
 * deep-links. Pure presentational: it emits intent; useLibrarySearch owns
 * the URL and the data.
 */
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { TOPIK_LEVELS, presentCategories, type GrammarType, type TopikLevel } from '~/lib/domain'
import { MASTERY_FILTER_VALUES, type MasteryFilterValue } from '~/lib/library/mastery-filter'

const props = defineProps<{
  query: string
  level: TopikLevel | null
  category: GrammarType | null
  mastery: MasteryFilterValue | null
  zoneLabel: string | null
  resultCount: number
}>()

const emit = defineEmits<{
  'update:query': [string]
  'set-level': [TopikLevel | null]
  'set-category': [GrammarType | null]
  'set-mastery': [MasteryFilterValue | null]
  clear: []
}>()

const { t } = useI18n()

const categories = presentCategories()
const masteryValues = MASTERY_FILTER_VALUES
const hasFilter = computed(
  () => props.query.trim() !== '' || props.level !== null
     || props.category !== null || props.mastery !== null || props.zoneLabel !== null,
)

function onLevel(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('set-level', v === '' ? null : (Number(v) as TopikLevel))
}
function onCategory(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('set-category', v === '' ? null : (v as GrammarType))
}
function onMastery(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  emit('set-mastery', v === '' ? null : (v as MasteryFilterValue))
}
</script>

<template>
  <div class="library-search">
    <div class="library-search__row">
      <Input
        class="library-search__input"
        type="text"
        inputmode="search"
        :model-value="query"
        :placeholder="t('library.search.placeholder')"
        @update:model-value="emit('update:query', $event)"
      />

      <select
        class="library-search__level"
        :value="level ?? ''"
        :aria-label="t('library.search.filter_level')"
        @change="onLevel"
      >
        <option value="">{{ t('library.search.filter_all_levels') }}</option>
        <option v-for="n in TOPIK_LEVELS" :key="n" :value="n">
          {{ t('garden.level', { n }) }}
        </option>
      </select>

      <select
        class="library-search__category"
        :value="category ?? ''"
        :aria-label="t('library.search.filter_category')"
        @change="onCategory"
      >
        <option value="">{{ t('library.search.filter_all_categories') }}</option>
        <option v-for="c in categories" :key="c" :value="c">
          {{ t(`library.search.category.${c}`) }}
        </option>
      </select>

      <select
        class="library-search__mastery"
        :value="mastery ?? ''"
        :aria-label="t('library.search.filter_mastery')"
        @change="onMastery"
      >
        <option value="">{{ t('library.search.filter_all_mastery') }}</option>
        <option v-for="m in masteryValues" :key="m" :value="m">
          {{ t(`library.search.mastery.${m}`) }}
        </option>
      </select>

      <Button
        v-if="hasFilter"
        variant="secondary"
        size="sm"
        data-testid="library-search-clear"
        @click="emit('clear')"
      >
        {{ t('library.search.clear') }}
      </Button>
    </div>

    <div v-if="zoneLabel" class="library-search__zone" role="status">
      {{ t('library.search.active_zone', { zone: zoneLabel }) }}
    </div>
    <p v-if="hasFilter" class="library-search__count" aria-live="polite">
      {{ t('library.search.result_count', { n: resultCount }) }}
    </p>
  </div>
</template>

<style scoped>
.library-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.library-search__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.library-search__input {
  flex: 1 1 220px;
}
.library-search__level,
.library-search__category,
.library-search__mastery {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  padding: 10px 12px;
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: var(--text-base);
  box-shadow: var(--shadow-input);
  cursor: pointer;
}
.library-search__level:focus-visible,
.library-search__category:focus-visible,
.library-search__mastery:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--border-strong);
}
.library-search__zone {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  padding: 8px 12px;
  background: var(--surface-hover);
  border: 2px solid var(--border);
}
.library-search__count {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 9px;
  color: var(--text-soft);
  margin: 0;
}
</style>
