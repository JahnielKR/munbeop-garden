<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
import { achievementsFor, type AchievementId } from '~/lib/achievements'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const srs = useSrsStore()
const log = useLogStore()

const ICONS: Record<AchievementId, string> = {
  sprouted: '🌱',
  practiced_10: '🔁',
  practiced_25: '📚',
  streak_5: '🔥',
  comeback: '💪',
  mastered: '🌳',
}

const badges = computed(() =>
  achievementsFor(
    srs.peek(props.grammar.ko),
    log.entries.filter((e) => e.ko === props.grammar.ko),
  ),
)
</script>

<template>
  <section class="ach-section">
    <h3 class="section-title">{{ t('library.achievements.title') }}</h3>
    <ul class="ach-grid">
      <li
        v-for="b in badges"
        :key="b.id"
        class="ach"
        :class="{ 'ach--earned': b.earned, 'ach--locked': !b.earned }"
        :aria-label="b.earned
          ? t(`library.achievements.${b.id}.name`)
          : `${t(`library.achievements.${b.id}.name`)} — ${t(`library.achievements.${b.id}.desc`)}`"
        :title="b.earned
          ? t(`library.achievements.${b.id}.name`)
          : t(`library.achievements.${b.id}.desc`)"
      >
        <span class="ach__icon" aria-hidden="true">{{ ICONS[b.id] }}</span>
        <span class="ach__name">{{ t(`library.achievements.${b.id}.name`) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.ach-grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ach {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 88px;
  padding: 10px 6px;
  border: 2px solid var(--ink-line);
  background: var(--paper-deep, var(--surface));
  text-align: center;
  transition: opacity var(--motion-quick) var(--ease-out);
}
.ach__icon {
  font-size: 22px;
  line-height: 1;
}
.ach__name {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--ink);
  line-height: 1.2;
}
/* Earned = full strength; locked = greyed + faded so the case reads as a goal. */
.ach--locked {
  opacity: 0.45;
  filter: grayscale(1);
}
.ach--earned {
  border-color: var(--gold, var(--ink));
}
</style>
