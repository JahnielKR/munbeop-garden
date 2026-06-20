<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { STARTER, parseTemplate } from '~/lib/onboarding/starter'

/**
 * One guided sentence: a near-complete model with the grammar conjugation
 * blanked. No auto-grading — on reveal we show the model and celebrate. The
 * composed sentence (their fill, or the model answer if they left it empty)
 * is emitted on `complete`. Closing the modal emits `skip`.
 */
defineProps<{ open: boolean }>()
const emit = defineEmits<{ complete: [string]; skip: [] }>()
const { t } = useI18n()

const parts = parseTemplate(STARTER.templateKo)
const answer = ref('')
const revealed = ref(false)

const composed = computed(
  () => parts.before + (answer.value.trim() || STARTER.blankAnswer) + parts.after,
)

function reveal() {
  revealed.value = true
}
function done() {
  emit('complete', composed.value)
}
</script>

<template>
  <Modal
    :open="open"
    :title="t('onboarding.title')"
    :close-label="t('onboarding.skip')"
    @close="emit('skip')"
  >
    <div class="onb">
      <p class="onb__intro">{{ t('onboarding.intro') }}</p>
      <p class="onb__prompt">
        <strong>{{ STARTER.grammarKo }}</strong> · {{ t('onboarding.prompt') }}
      </p>

      <p class="onb__template">
        <span>{{ parts.before }}</span>
        <Input
          v-model="answer"
          data-testid="onboarding-blank"
          class="onb__blank"
          :placeholder="STARTER.blankAnswer"
        />
        <span>{{ parts.after }}</span>
      </p>

      <div v-if="!revealed" class="onb__actions">
        <Button data-testid="onboarding-reveal" @click="reveal">
          {{ t('onboarding.reveal_label') }}
        </Button>
      </div>

      <div v-else class="onb__reveal">
        <p class="onb__model">{{ STARTER.modelSentenceKo }}</p>
        <p class="onb__celebrate">
          <span class="onb__sprout" aria-hidden="true">🌱</span> {{ t('onboarding.celebrate') }}
        </p>
        <Button data-testid="onboarding-done" @click="done">
          {{ t('onboarding.cta') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.onb {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}
.onb__intro,
.onb__prompt,
.onb__model {
  margin: 0;
  line-height: 1.6;
  color: var(--text);
}
.onb__template {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: var(--text-lg, 18px);
  color: var(--text);
}
.onb__blank {
  width: 5ch;
  display: inline-block;
}
.onb__reveal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.onb__model {
  font-weight: 600;
}
.onb__celebrate {
  margin: 0;
  color: var(--text-soft);
}
.onb__sprout {
  display: inline-block;
  animation: sprout-pop 360ms var(--ease-out, ease);
}
@keyframes sprout-pop {
  from { transform: scale(0.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .onb__sprout { animation: none; }
}
</style>
