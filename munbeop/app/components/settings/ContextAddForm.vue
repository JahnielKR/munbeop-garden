<script setup lang="ts">
import type { LocalizedString } from '~/lib/domain'
import { isHangulName, LOCALE_CODES } from '~/lib/domain'
import { useContextsStore } from '~/stores/contexts'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const { t } = useI18n()
const store = useContextsStore()
const emit = defineEmits<{ created: [name: string] }>()

const name = ref('')
const scene = ref('')
const nameError = ref('')
const sceneError = ref('')

// Custom contexts are per-user; the same description fills every locale slot
// so the author always sees their own wording regardless of interface language.
function buildScene(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

async function submit() {
  nameError.value = ''
  sceneError.value = ''
  const trimmedName = name.value.trim()
  const trimmedScene = scene.value.trim()
  if (!isHangulName(trimmedName)) {
    nameError.value = t('settings.contexts.error_korean')
    return
  }
  if (!trimmedScene) {
    sceneError.value = t('settings.contexts.error_scene_required')
    return
  }
  const created = await store.addCustom(trimmedName, buildScene(trimmedScene))
  if (!created) {
    nameError.value = t('settings.contexts.error_duplicate')
    return
  }
  name.value = ''
  scene.value = ''
  emit('created', created.name)
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <Field :label="t('settings.contexts.name_label')" html-for="ctx-name" :error="nameError">
      <Input
        id="ctx-name"
        v-model="name"
        :placeholder="t('settings.contexts.name_placeholder')"
        :error="!!nameError"
      />
    </Field>
    <Field :label="t('settings.contexts.scene_label')" html-for="ctx-scene" :error="sceneError">
      <Input
        id="ctx-scene"
        v-model="scene"
        :placeholder="t('settings.contexts.scene_placeholder')"
        :error="!!sceneError"
      />
    </Field>
    <Button type="submit" size="sm">{{ t('settings.contexts.add') }}</Button>
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
