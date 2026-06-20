<script setup lang="ts">
import type { LocalizedString } from '~/lib/domain'
import { isHangulName, LOCALE_CODES } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const { t } = useI18n()
const store = useGrammarStore()
const emit = defineEmits<{ created: [ko: string] }>()

const ko = ref('')
const meaning = ref('')
const example = ref('')
const koError = ref('')

// Custom grammar is per-user; the same meaning text fills every locale slot so
// the author always sees their own wording regardless of interface language.
function buildMeaning(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

async function submit() {
  koError.value = ''
  const trimmedKo = ko.value.trim()
  if (!isHangulName(trimmedKo)) {
    koError.value = t('settings.custom_grammar.error_korean')
    return
  }
  const created = await store.addCustomGrammar({
    ko: trimmedKo,
    meaning: buildMeaning(meaning.value.trim()),
    example: example.value.trim() || undefined,
  })
  if (!created) {
    koError.value = t('settings.custom_grammar.error_duplicate')
    return
  }
  ko.value = ''
  meaning.value = ''
  example.value = ''
  emit('created', created.ko)
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <Field :label="t('settings.custom_grammar.ko_label')" html-for="cg-ko" :error="koError">
      <Input id="cg-ko" v-model="ko" :placeholder="t('settings.custom_grammar.ko_placeholder')" :error="!!koError" />
    </Field>
    <Field :label="t('settings.custom_grammar.meaning_label')" html-for="cg-meaning">
      <Input id="cg-meaning" v-model="meaning" :placeholder="t('settings.custom_grammar.meaning_placeholder')" />
    </Field>
    <Field :label="t('settings.custom_grammar.example_label')" html-for="cg-example">
      <Input id="cg-example" v-model="example" :placeholder="t('settings.custom_grammar.example_placeholder')" />
    </Field>
    <Button type="submit" size="sm">{{ t('settings.custom_grammar.add') }}</Button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}
</style>
