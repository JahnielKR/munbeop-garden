<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import HeaderRow from './GrammarStudySheet/HeaderRow.vue'
import MeaningSection from './GrammarStudySheet/MeaningSection.vue'
import UsageNotesSection from './GrammarStudySheet/UsageNotesSection.vue'
import SrsProgressSection from './GrammarStudySheet/SrsProgressSection.vue'
import PracticeCtaSection from './GrammarStudySheet/PracticeCtaSection.vue'
import ParticleLabSection from './GrammarStudySheet/ParticleLabSection.vue'
import PronunciationSection from './GrammarStudySheet/PronunciationSection.vue'
import ExamplesSection from './GrammarStudySheet/ExamplesSection.vue'
import ConfusedWithSection from './GrammarStudySheet/ConfusedWithSection.vue'
import AchievementsSection from './GrammarStudySheet/AchievementsSection.vue'

interface Props {
  grammar: Grammar
}
defineProps<Props>()
const emit = defineEmits<{ navigate: [ko: string] }>()
</script>

<template>
  <article class="study-sheet">
    <HeaderRow :grammar="grammar" />
    <MeaningSection :grammar="grammar" />
    <UsageNotesSection :grammar="grammar" />
    <SrsProgressSection :grammar="grammar" />
    <PracticeCtaSection :grammar="grammar" />
    <ParticleLabSection :grammar="grammar" />
    <PronunciationSection :grammar="grammar" />
    <ExamplesSection :grammar="grammar" />
    <ConfusedWithSection :grammar="grammar" @navigate="(ko) => emit('navigate', ko)" />
    <AchievementsSection :grammar="grammar" />
  </article>
</template>

<style scoped>
.study-sheet {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
