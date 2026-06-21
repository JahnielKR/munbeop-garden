<script setup lang="ts">
import { computed } from 'vue'
import type { LabToken, SpeechLevel } from '~/lib/domain'
import { tokenText } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'
import { particleById } from '~/seed/particles'

/**
 * One token of an explore sentence. Words render as plain hangul + gloss;
 * particles render as toggleable pixel chips colored by role (spec §2.2).
 */
interface Props {
  token: LabToken
  /** Particle currently toggled OFF (ghost look). */
  off?: boolean
  showGloss?: boolean
  level?: SpeechLevel
}
const props = withDefaults(defineProps<Props>(), { off: false, showGloss: true, level: 'polite' })
const emit = defineEmits<{ toggle: [] }>()
const { tl } = useLocalized()

const displayText = computed(() => tokenText(props.token, props.level))

const role = computed(() =>
  props.token.kind === 'particle'
    ? (particleById(props.token.particleId)?.role ?? 'addition')
    : null,
)
const ariaLabel = computed(() => {
  if (props.token.kind !== 'particle') return undefined
  const def = particleById(props.token.particleId)
  return def ? `${props.token.text} · ${tl(def.label)}` : props.token.text
})
</script>

<template>
  <button
    v-if="token.kind === 'particle'"
    type="button"
    class="chip"
    :class="[`chip--${role}`, { 'chip--off': off }]"
    :disabled="!token.toggleable"
    :aria-pressed="!off"
    :aria-label="ariaLabel"
    lang="ko"
    data-testid="particle-chip"
    @click="emit('toggle')"
  >
    {{ displayText }}
  </button>
  <span v-else class="word" data-testid="word-token">
    <span class="word__ko" lang="ko">{{ displayText }}</span>
    <span v-if="showGloss && token.gloss" class="word__gloss">{{ tl(token.gloss) }}</span>
  </span>
</template>

<style scoped>
.word {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.word__ko {
  font-family: var(--font-ko);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}
.word__gloss {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-soft);
}

.chip {
  align-self: flex-start;
  font-family: var(--font-ko);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  padding: 2px 7px;
  margin-left: 2px;
  border: 2px solid var(--always-dark);
  box-shadow: var(--shadow-pixel-sm);
  cursor: pointer;
  transition:
    opacity var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.chip:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--shadow-color);
}
.chip:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-color);
}
.chip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.chip:disabled {
  cursor: default;
}

/* Role colors — Badge.vue pattern: brand bg + always-dark text (§2.2). */
.chip--topic { background: var(--gold); color: var(--always-dark); }
.chip--subject { background: var(--jade); color: var(--always-dark); }
.chip--object { background: var(--sky); color: var(--always-dark); }
.chip--place { background: var(--red); color: var(--text-on-danger); }
.chip--addition {
  background: var(--paper-deep);
  color: var(--text);
  border-color: var(--border-strong);
}
.chip--recipient { background: var(--plum); color: var(--always-dark); }
.chip--means { background: var(--teal); color: var(--always-dark); }
.chip--connective { background: var(--rose); color: var(--always-dark); }

/* OFF = ghost: dashed border, faded, no fill. */
.chip--off {
  background: transparent;
  color: var(--text-soft);
  border: 2px dashed var(--border);
  box-shadow: none;
  opacity: 0.55;
}
</style>
