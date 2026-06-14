<script setup lang="ts">
import type { Context } from '~/lib/domain'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'
import { useToast } from '~/composables/useToast'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import ContextAddForm from '~/components/settings/ContextAddForm.vue'

const { t } = useI18n()
const { tl } = useLocalized()
const { success } = useToast()
const store = useContextsStore()

const CATEGORIES = ['formalidad', 'situacional', 'custom'] as const
type Category = (typeof CATEGORIES)[number]

function group(cat: Category): Context[] {
  return store.all.filter((c) => c.category === cat)
}
function isActive(id: string): boolean {
  return !store.inactiveIds.includes(id)
}
// Active contexts lock once we're at the floor; inactive ones can always
// be switched back on.
function toggleLocked(id: string): boolean {
  return isActive(id) && store.active.length <= MIN_ACTIVE_CONTEXTS
}
async function onToggle(id: string) {
  await store.toggleActive(id)
}

const pendingDelete = ref<Context | null>(null)
function askDelete(ctx: Context) {
  pendingDelete.value = ctx
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete() {
  const ctx = pendingDelete.value
  if (!ctx) return
  const ok = await store.removeCustom(ctx.id)
  pendingDelete.value = null
  if (ok) success(t('settings.contexts.deleted'))
}

function onCreated() {
  success(t('settings.contexts.created'))
}
</script>

<template>
  <section class="ctx-mgr" :aria-label="t('settings.contexts.title')">
    <BilingualTitle ko="연습 상황" :latin="t('settings.contexts.title')" level="h2" />
    <p class="ctx-mgr__subtitle">{{ t('settings.contexts.subtitle') }}</p>
    <p class="ctx-mgr__count">{{ t('settings.contexts.active_count', { count: store.active.length }) }}</p>

    <template v-for="cat in CATEGORIES" :key="cat">
      <div v-if="group(cat).length" class="ctx-mgr__group">
        <h3 class="ctx-mgr__group-title">{{ t(`settings.contexts.category.${cat}`) }}</h3>
        <ul class="ctx-mgr__list">
          <li v-for="ctx in group(cat)" :key="ctx.id" class="ctx-row">
            <div class="ctx-row__text">
              <span class="ctx-row__name">{{ ctx.name }}</span>
              <span class="ctx-row__scene">{{ tl(ctx.scene) }}</span>
            </div>
            <div class="ctx-row__actions">
              <button
                v-if="!ctx.builtin"
                type="button"
                class="ctx-row__delete"
                :aria-label="t('settings.contexts.delete')"
                @click="askDelete(ctx)"
              >
                ✕
              </button>
              <Toggle
                :model-value="isActive(ctx.id)"
                :disabled="toggleLocked(ctx.id)"
                :label="ctx.name"
                @update:model-value="onToggle(ctx.id)"
              />
            </div>
          </li>
        </ul>
      </div>
    </template>

    <p v-if="store.active.length <= MIN_ACTIVE_CONTEXTS" class="ctx-mgr__hint">
      {{ t('settings.contexts.min_active_hint') }}
    </p>

    <ContextAddForm class="ctx-mgr__add" @created="onCreated" />

    <Modal
      :open="pendingDelete !== null"
      :close-label="t('settings.contexts.cancel')"
      :title="t('settings.contexts.delete_confirm_title')"
      @close="cancelDelete"
    >
      <h2 class="ctx-del__title">{{ t('settings.contexts.delete_confirm_title') }}</h2>
      <p class="ctx-del__body">
        {{ t('settings.contexts.delete_confirm_body', { name: pendingDelete?.name }) }}
      </p>
      <div class="ctx-del__actions">
        <Button variant="secondary" size="sm" @click="cancelDelete">
          {{ t('settings.contexts.cancel') }}
        </Button>
        <Button variant="danger" size="sm" @click="confirmDelete">
          {{ t('settings.contexts.delete') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.ctx-mgr {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ctx-mgr__subtitle,
.ctx-mgr__count {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
}
.ctx-mgr__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.ctx-mgr__group-title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}
.ctx-mgr__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ctx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.ctx-row__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ctx-row__name {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--text);
}
.ctx-row__scene {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
}
.ctx-row__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.ctx-row__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-soft);
  font-size: 14px;
  padding: 4px;
  line-height: 1;
}
.ctx-row__delete:hover {
  color: var(--danger);
}
.ctx-row__delete:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.ctx-mgr__hint {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--danger);
  margin: 0;
}
.ctx-del__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 13px;
  margin: 0 0 12px;
  color: var(--ink);
}
.ctx-del__body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  margin: 0 0 20px;
  color: var(--ink);
}
.ctx-del__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
