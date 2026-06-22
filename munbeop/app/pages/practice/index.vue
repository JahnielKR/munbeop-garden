<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameCard from '~/components/games/GameCard.vue'

/**
 * Practice hub — every game mode as a selectable card.
 *
 * Each card routes to its own game page: the ruleta keeps the classic
 * sentence-production loop, the escape room opens its level notebook.
 * The third slot stays locked until that game exists.
 */

definePageMeta({ surface: 'game' })

const { t } = useI18n()
</script>

<template>
  <div class="hub">
    <BilingualTitle ko="연습" :latin="t('title.practice')" />
    <p class="hub__lead">{{ t('games.lead') }}</p>

    <div class="hub__grid">
      <GameCard
        to="/practice/ruleta"
        :name="t('games.ruleta.name')"
        :description="t('games.ruleta.desc')"
        image="/games/ruleta-cover.svg"
      />
      <GameCard
        to="/escape-room"
        :name="t('games.escape.name')"
        :description="t('games.escape.desc')"
        image="/escape-room/covers/level-01.png"
      />
      <GameCard
        to="/practice/particles"
        :name="t('games.particles.name')"
        :description="t('games.particles.desc')"
        emoji="🧩"
      />
      <GameCard
        to="/practice/conjugation"
        :name="t('games.conjugation.name')"
        :description="t('games.conjugation.desc')"
        emoji="🔀"
      />
      <GameCard
        to="/practice/register"
        :name="t('games.register.name')"
        :description="t('games.register.desc')"
        emoji="🙇"
      />
      <GameCard
        to="/practice/cloze"
        :name="t('games.cloze.name')"
        :description="t('games.cloze.desc')"
        emoji="📝"
      />
      <GameCard
        to="/practice/counters"
        :name="t('games.counters.name')"
        :description="t('games.counters.desc')"
        emoji="🔢"
      />
    </div>
  </div>
</template>

<style scoped>
.hub {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.hub__lead {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: var(--ink-soft, var(--text-soft));
  line-height: 1.6;
}
.hub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
</style>
