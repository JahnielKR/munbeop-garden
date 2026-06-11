<script setup lang="ts">
import type { Grammar } from '~/lib/domain'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const router = useRouter()

async function onClick() {
  // /practice is the games hub; the focused round lives in the ruleta game.
  await router.push({ path: '/practice/ruleta', query: { focus: props.grammar.ko } })
}
</script>

<template>
  <div class="cta">
    <button type="button" class="cta__btn" @click="onClick">
      {{ t('library.modal.section.practice_cta') }}
    </button>
  </div>
</template>

<style scoped>
.cta {
  margin-top: 20px;
}
.cta__btn {
  width: 100%;
  padding: 12px 16px;
  background: var(--jade);
  color: var(--ink);
  border: 3px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-cream);
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick, 120ms) var(--ease-out, ease),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease);
}
.cta__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--shadow-cream);
}
.cta__btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--shadow-cream);
}
.cta__btn:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 3px;
}
</style>
