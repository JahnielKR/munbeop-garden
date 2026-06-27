<script setup lang="ts">
interface Props {
  choices: string[]
  disabled?: boolean
}
defineProps<Props>()
defineEmits<{ choose: [value: string] }>()
</script>

<template>
  <div class="choices" lang="ko">
    <button
      v-for="(c, i) in choices"
      :key="`${i}-${c}`"
      type="button"
      class="choice"
      data-testid="speed-choice"
      :disabled="disabled"
      @click="$emit('choose', c)"
    >{{ c }}</button>
  </div>
</template>

<style scoped>
.choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.choice {
  font-family: 'Noto Sans KR', sans-serif; font-size: 18px; padding: 16px 12px;
  background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer;
  transition: transform var(--motion-quick, 120ms) var(--ease-out, ease), border-color var(--motion-quick, 120ms) var(--ease-out, ease);
}
.choice:hover:not(:disabled) { border-color: var(--ink); transform: translate(-1px, -1px); }
.choice:disabled { opacity: 0.55; cursor: default; }
.choice:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
