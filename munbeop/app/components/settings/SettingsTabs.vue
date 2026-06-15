<script setup lang="ts">
interface Tab {
  id: string
  labelKey: string
}

const props = defineProps<{ tabs: Tab[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()

const tabRefs = ref<HTMLButtonElement[]>([])
function setTabRef(el: Element | null, i: number) {
  if (el) tabRefs.value[i] = el as HTMLButtonElement
}

function select(id: string) {
  emit('update:modelValue', id)
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  const count = props.tabs.length
  const next = e.key === 'ArrowRight' ? (index + 1) % count : (index - 1 + count) % count
  const nextTab = props.tabs[next]
  if (!nextTab) return
  emit('update:modelValue', nextTab.id)
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="t('title.settings')">
    <button
      v-for="(tab, i) in tabs"
      :id="`tab-${tab.id}`"
      :key="tab.id"
      :ref="(el) => setTabRef(el as Element | null, i)"
      type="button"
      role="tab"
      :aria-selected="tab.id === modelValue"
      :aria-controls="`panel-${tab.id}`"
      :tabindex="tab.id === modelValue ? 0 : -1"
      class="tab"
      :class="{ 'tab--active': tab.id === modelValue }"
      @click="select(tab.id)"
      @keydown="onKeydown($event, i)"
    >
      {{ t(tab.labelKey) }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tab {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  color: var(--text-soft);
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-button);
  padding: 10px 14px;
  cursor: pointer;
  transition:
    background-color var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.tab:hover {
  border-color: var(--border-strong);
}
.tab--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--border-strong);
}
.tab:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
:lang(th) .tab,
:lang(vi) .tab,
:lang(ja) .tab {
  font-size: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .tab {
    transition: none;
  }
}
</style>
