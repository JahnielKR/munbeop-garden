<!-- app/components/register-drill/RegisterMasterStrip.vue -->
<script setup lang="ts">
interface PerSet { id: string; mode: string; ko: string; done: boolean }

interface Props {
  perSet: PerSet[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section class="master" :class="{ 'master--earned': earned }" data-testid="register-master">
    <div class="master__head">
      <span class="master__badge" aria-hidden="true">{{ earned ? '🏅' : '🙇' }}</span>
      <span class="master__label" lang="ko">높임법 마스터</span>
      <span class="master__caption">
        {{ earned ? t('register.master.earned') : t('register.master.progress', { done: doneCount, total }) }}
      </span>
    </div>
    <ul class="master__pips" :aria-label="t('register.master.progress', { done: doneCount, total })">
      <li
        v-for="p in perSet"
        :key="`${p.mode}:${p.id}`"
        class="master__pip"
        :class="p.done ? 'master__pip--done' : 'master__pip--todo'"
        data-testid="register-pip"
        :aria-label="t(p.done ? 'register.master.pip_done' : 'register.master.pip_todo', { ko: p.ko })"
      >
        <span lang="ko" aria-hidden="true">{{ p.ko }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.master { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; background: var(--surface); border: 2px solid var(--border); }
.master--earned { border-color: var(--gold); box-shadow: inset 0 0 0 1px var(--gold); }
.master__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.master__badge { font-size: var(--text-md); }
.master__label { font-family: var(--font-ko); font-weight: 700; font-size: var(--text-sm); color: var(--text); }
.master__caption { font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--text-soft); }
.master__pips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.master__pip {
  padding: 3px 8px; border: 2px solid var(--border); font-family: var(--font-ko); font-size: var(--text-xs);
  color: var(--text-soft); background: var(--paper-deep);
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.master__pip--done { background: var(--jade); border-color: var(--ink-line); color: var(--always-dark); }
.master--earned .master__pip--done { background: var(--gold); }
</style>
