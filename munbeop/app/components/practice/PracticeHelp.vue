<!-- app/components/practice/PracticeHelp.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { helpFor } from '~/seed/practice-help'
import type { PracticeHelpMode } from '~/lib/domain'

const props = defineProps<{ mode: PracticeHelpMode }>()
const { t } = useI18n()
const { tl } = useLocalized()

const content = computed(() => helpFor(props.mode))
const open = ref(false)
</script>

<template>
  <div v-if="content" class="practice-help">
    <button type="button" class="practice-help__trigger" @click="open = true">
      <span aria-hidden="true">?</span> {{ t('practiceHelp.button') }}
    </button>

    <Modal
      :open="open"
      :title="content.ko"
      :close-label="t('practiceHelp.close')"
      @close="open = false"
    >
      <div class="practice-help__head">
        <h2 class="practice-help__title">
          {{ content.ko }}
          <span v-if="content.romanization" class="practice-help__rom">{{ content.romanization }}</span>
        </h2>
        <p class="practice-help__subtitle">{{ tl(content.subtitle) }}</p>
      </div>

      <section class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.concept') }}</h3>
        <p class="practice-help__p">{{ tl(content.concept) }}</p>
      </section>

      <section v-if="content.types && content.types.length" class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.types') }}</h3>
        <ul class="practice-help__types">
          <li v-for="type in content.types" :key="type.ko" class="practice-help__type">
            <p class="practice-help__type-name"><strong>{{ type.ko }}</strong> · {{ tl(type.label) }}</p>
            <p class="practice-help__p">{{ tl(type.desc) }}</p>
            <p class="practice-help__example">
              <span lang="ko">{{ type.example }}</span>
              <span class="practice-help__gloss">{{ tl(type.gloss) }}</span>
            </p>
          </li>
        </ul>
      </section>

      <section class="practice-help__section">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.howToPlay') }}</h3>
        <ol class="practice-help__steps">
          <li v-for="(step, i) in content.howToPlay" :key="i">{{ tl(step) }}</li>
        </ol>
      </section>

      <section v-if="content.tip" class="practice-help__section practice-help__section--tip">
        <h3 class="practice-help__h">{{ t('practiceHelp.section.tip') }}</h3>
        <p class="practice-help__p">{{ tl(content.tip) }}</p>
      </section>
    </Modal>
  </div>
</template>

<style scoped>
.practice-help { align-self: flex-start; }
.practice-help__trigger {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--ink); background: var(--surface); border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream); padding: 6px 12px; cursor: pointer;
}
.practice-help__trigger:hover { background: var(--paper-deep, var(--paper)); }
.practice-help__trigger:focus-visible { outline: 2px solid var(--focus-ring, var(--gold)); outline-offset: 2px; }

.practice-help__head { margin-bottom: 16px; }
.practice-help__title { margin: 0; font-family: var(--font-pixel); font-size: var(--text-lg); color: var(--ink); }
.practice-help__rom { margin-left: 8px; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.practice-help__subtitle { margin: 4px 0 0; font-family: var(--font-ui); color: var(--text-soft); }

.practice-help__section { margin-top: 18px; }
.practice-help__section--tip {
  background: var(--surface); border: 2px dashed var(--border); padding: 10px 14px;
}
.practice-help__h {
  margin: 0 0 8px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-soft);
}
.practice-help__p { margin: 0; font-family: var(--font-ui); line-height: 1.6; color: var(--ink); white-space: pre-line; }

.practice-help__types { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.practice-help__type-name { margin: 0 0 4px; font-family: var(--font-ui); color: var(--ink); }
.practice-help__example { margin: 6px 0 0; display: flex; flex-direction: column; gap: 2px; }
.practice-help__example span[lang="ko"] { font-family: var(--font-ko, 'Noto Sans KR', sans-serif); color: var(--ink); }
.practice-help__gloss { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }

.practice-help__steps { margin: 0; padding-left: 20px; font-family: var(--font-ui); line-height: 1.7; color: var(--ink); }
</style>
