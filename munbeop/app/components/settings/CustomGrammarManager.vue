<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'
import { useToast } from '~/composables/useToast'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import CustomGrammarAddForm from '~/components/settings/CustomGrammarAddForm.vue'

const { t } = useI18n()
const { tl } = useLocalized()
const { success } = useToast()
const store = useGrammarStore()

const pendingDelete = ref<Grammar | null>(null)
function askDelete(g: Grammar) {
  pendingDelete.value = g
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete() {
  const g = pendingDelete.value
  if (!g) return
  const ok = await store.removeCustomGrammar(g.ko)
  pendingDelete.value = null
  if (ok) success(t('settings.custom_grammar.deleted'))
}
function onCreated() {
  success(t('settings.custom_grammar.created'))
}
</script>

<template>
  <section class="cg-mgr" :aria-label="t('settings.custom_grammar.title')">
    <BilingualTitle ko="내 문법" :latin="t('settings.custom_grammar.title')" level="h2" />
    <p class="cg-mgr__subtitle">{{ t('settings.custom_grammar.subtitle') }}</p>

    <p v-if="store.customGrammars.length === 0" class="cg-mgr__empty">
      {{ t('settings.custom_grammar.empty') }}
    </p>
    <ul v-else class="cg-mgr__list">
      <li v-for="g in store.customGrammars" :key="g.ko" class="cg-row">
        <div class="cg-row__text">
          <span class="cg-row__ko">{{ g.ko }}</span>
          <span class="cg-row__meaning">{{ tl(g.meaning) }}</span>
        </div>
        <button
          type="button"
          class="cg-row__delete"
          :aria-label="t('settings.custom_grammar.delete')"
          @click="askDelete(g)"
        >
          ✕
        </button>
      </li>
    </ul>

    <CustomGrammarAddForm class="cg-mgr__add" @created="onCreated" />

    <Modal
      :open="pendingDelete !== null"
      :close-label="t('settings.custom_grammar.delete')"
      :title="t('settings.custom_grammar.delete_confirm_title')"
      @close="cancelDelete"
    >
      <h2 class="cg-del__title">{{ t('settings.custom_grammar.delete_confirm_title') }}</h2>
      <p class="cg-del__body">
        {{ t('settings.custom_grammar.delete_confirm_body', { ko: pendingDelete?.ko }) }}
      </p>
      <div class="cg-del__actions">
        <Button variant="secondary" size="sm" @click="cancelDelete">
          {{ t('settings.custom_grammar.delete') }}
        </Button>
        <Button variant="danger" size="sm" @click="confirmDelete">
          {{ t('settings.custom_grammar.delete') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.cg-mgr { display: flex; flex-direction: column; gap: 12px; }
.cg-mgr__subtitle, .cg-mgr__empty { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text-soft); margin: 0; }
.cg-mgr__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.cg-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; background: var(--surface); border: 2px solid var(--border); }
.cg-row__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cg-row__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; color: var(--text); }
.cg-row__meaning { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); }
.cg-row__delete { background: none; border: none; cursor: pointer; color: var(--text-soft); font-size: 14px; padding: 4px; line-height: 1; }
.cg-row__delete:hover { color: var(--danger); }
.cg-row__delete:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.cg-del__title { font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; margin: 0 0 12px; color: var(--ink); }
.cg-del__body { font-family: 'Inter', sans-serif; font-size: 14px; margin: 0 0 20px; color: var(--ink); }
.cg-del__actions { display: flex; justify-content: flex-end; gap: 10px; }
</style>
