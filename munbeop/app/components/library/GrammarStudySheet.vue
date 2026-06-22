<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import HeaderRow from './GrammarStudySheet/HeaderRow.vue'
import MeaningSection from './GrammarStudySheet/MeaningSection.vue'
import UsageNotesSection from './GrammarStudySheet/UsageNotesSection.vue'
import SrsProgressSection from './GrammarStudySheet/SrsProgressSection.vue'
import PracticeCtaSection from './GrammarStudySheet/PracticeCtaSection.vue'
import ParticleLabSection from './GrammarStudySheet/ParticleLabSection.vue'
import ComingSoonSection from './GrammarStudySheet/ComingSoonSection.vue'
import ExamplesSection from './GrammarStudySheet/ExamplesSection.vue'
import ConfusedWithSection from './GrammarStudySheet/ConfusedWithSection.vue'

interface Props {
  grammar: Grammar
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <article class="study-sheet">
    <HeaderRow :grammar="grammar" />
    <MeaningSection :grammar="grammar" />
    <UsageNotesSection :grammar="grammar" />
    <SrsProgressSection :grammar="grammar" />
    <PracticeCtaSection :grammar="grammar" />
    <ParticleLabSection :grammar="grammar" />
    <ComingSoonSection
      :title="t('library.modal.section.audio')"
      :body="t('library.modal.coming_soon.audio')"
    />
    <ExamplesSection :grammar="grammar" />
    <ConfusedWithSection :grammar="grammar" />
    <ComingSoonSection
      :title="t('library.modal.section.achievements')"
      :body="t('library.modal.coming_soon.achievements')"
    />
  </article>
</template>

<style scoped>
.study-sheet {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
