<script setup lang="ts">
/** Calm progress strip for the 활용 마스터 achievement (mode-independent). */
interface PerClass {
  klass: string
  ko: string
  done: boolean
}

interface Props {
  perClass: PerClass[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section class="master" :class="{ 'master--earned': earned }" data-testid="conj-master">
    <div class="master__head">
      <span class="master__badge" aria-hidden="true">{{ earned ? '🏅' : '📚' }}</span>
      <span class="master__label" lang="ko">활용 마스터</span>
      <span class="master__caption">
        {{ earned ? t('conjugation.master.earned') : t('conjugation.master.progress', { done: doneCount, total }) }}
      </span>
    </div>
    <ul class="master__pips" :aria-label="t('conjugation.master.progress', { done: doneCount, total })">
      <li
        v-for="p in perClass"
        :key="p.klass"
        class="master__pip"
        :class="p.done ? 'master__pip--done' : 'master__pip--todo'"
        data-testid="conj-pip"
        :aria-label="t(p.done ? 'conjugation.master.pip_done' : 'conjugation.master.pip_todo', { ko: p.ko })"
      >
        <span lang="ko" aria-hidden="true">{{ p.ko }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.master {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.master--earned {
  border-color: var(--gold);
  box-shadow: inset 0 0 0 1px var(--gold);
}
.master__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.master__badge {
  font-size: var(--text-md);
}
.master__label {
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--text);
}
.master__caption {
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  /* Caption text — ink-soft so it reads in light theme
   * (no gold override on earned — gold-on-surface was ~1.5:1).
   * The earned cue is the gold border + 🏅 + gold pips. */
  color: var(--text-soft);
}
.master__pips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.master__pip {
  padding: 3px 8px;
  border: 2px solid var(--border);
  font-family: var(--font-ko);
  font-size: var(--text-xs);
  color: var(--text-soft);
  /* Raised tier so an unlit slot separates from the --surface strip
   * (--paper barely lifted off the strip — ~1.2:1 body separation). */
  background: var(--paper-deep);
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.master__pip--done {
  background: var(--jade);
  border-color: var(--ink-line);
  color: var(--always-dark);
}
.master--earned .master__pip--done {
  background: var(--gold);
}
</style>
