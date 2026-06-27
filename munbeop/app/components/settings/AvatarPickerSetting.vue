<!-- munbeop/app/components/settings/AvatarPickerSetting.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAvatars } from '~/composables/useAvatars'
import { AVATAR_TIERS, requirementLabel } from '~/lib/avatars/catalog'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const { byTier, ownedCount, totalCount, chosenId, choose, syncUnlocks, avatarUrl } = useAvatars()

onMounted(() => {
  void syncUnlocks()
})

const initial = computed(() => (auth.user?.email?.trim()[0] ?? '?').toUpperCase())

function reqText(rule: Parameters<typeof requirementLabel>[0]): string {
  const r = requirementLabel(rule)
  return r ? t(r.key, r.params) : ''
}
function pct(current: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}
</script>

<template>
  <section class="ava" :aria-label="t('settings.avatar.title')">
    <header class="ava__head">
      <h2 class="ava__title">{{ t('settings.avatar.title') }}</h2>
      <span class="ava__count">{{ t('settings.avatar.owned', { owned: ownedCount, total: totalCount }) }}</span>
    </header>
    <p class="ava__hint">{{ t('settings.avatar.hint') }}</p>

    <div class="ava__preview">
      <button
        type="button"
        class="ava__tile ava__tile--preview"
        :class="{ 'ava__tile--on': chosenId === null }"
        data-avatar="__initial"
        :aria-pressed="chosenId === null"
        @click="choose(null)"
      >
        <span class="ava__initial">{{ initial }}</span>
        <span class="ava__tilelabel">{{ t('settings.avatar.use_initial') }}</span>
      </button>
    </div>

    <div
      v-for="tier in AVATAR_TIERS"
      :key="tier"
      class="ava__group"
      role="group"
      :aria-label="t(`settings.avatar.tier.${tier}`)"
    >
      <h3 class="ava__tier" :class="`ava__tier--${tier}`">{{ t(`settings.avatar.tier.${tier}`) }}</h3>
      <ul class="ava__grid">
        <li v-for="a in byTier[tier]" :key="a.id">
          <button
            type="button"
            class="ava__tile"
            :class="[
              `ava__tile--${a.tier}`,
              { 'ava__tile--on': chosenId === a.id, 'ava__tile--locked': !a.unlocked },
            ]"
            :data-avatar="a.id"
            :disabled="!a.unlocked"
            :aria-pressed="chosenId === a.id"
            @click="choose(a.id)"
          >
            <img class="ava__img" :src="avatarUrl(a.id)" :alt="a.name.en" >
            <span class="ava__name">{{ a.name.ko }} · {{ a.name.en }}</span>
            <template v-if="!a.unlocked">
              <span class="ava__req">{{ reqText(a.rule) }}</span>
              <span class="ava__bar"><span class="ava__barfill" :style="{ width: pct(a.progress.current, a.progress.target) + '%' }" /></span>
            </template>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ava { display: flex; flex-direction: column; gap: 10px; }
.ava__head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ava__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px; margin: 0; color: var(--ink);
}
.ava__count {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px; color: var(--ink-soft);
}
.ava__hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); margin: 0; }
.ava__group { display: flex; flex-direction: column; gap: 6px; }
.ava__tier {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px; letter-spacing: 0.08em; margin: 4px 0 0; text-transform: uppercase;
  color: var(--tier, var(--ink-soft));
}
.ava__tier--common { --tier: var(--jade); }
.ava__tier--rare { --tier: var(--sky); }
.ava__tier--epic { --tier: #8a5cd0; }
.ava__tier--legendary { --tier: var(--gold); }
[data-theme='dark'] .ava__tier--epic { --tier: #a982f0; }

.ava__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px;
}
.ava__tile {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px; cursor: pointer; text-align: center;
  background: var(--surface); border: 2px solid var(--tier, var(--border)); color: var(--text);
}
.ava__tile--common { --tier: var(--jade); }
.ava__tile--rare { --tier: var(--sky); }
.ava__tile--epic { --tier: #8a5cd0; box-shadow: 0 0 8px 0 #8a5cd0; }
.ava__tile--legendary { --tier: var(--gold); box-shadow: 0 0 10px 1px var(--gold); }
[data-theme='dark'] .ava__tile--epic { --tier: #a982f0; box-shadow: 0 0 8px 0 #a982f0; }
.ava__tile:hover:not(:disabled) { border-color: var(--border-strong); }
.ava__tile:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.ava__tile--on { box-shadow: inset 0 0 0 3px var(--tier, var(--accent)); }
.ava__tile--locked { cursor: not-allowed; opacity: 0.85; }
.ava__tile--locked .ava__img { filter: grayscale(1) brightness(0.55); }
.ava__tile--preview { flex-direction: row; gap: 8px; justify-content: center; }

.ava__img { width: 64px; height: 64px; image-rendering: pixelated; }
.ava__initial {
  width: 48px; height: 48px; display: grid; place-items: center;
  background: var(--accent); color: var(--text-on-accent);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace; font-size: 18px;
}
.ava__tilelabel, .ava__name {
  font-family: 'Inter', sans-serif; font-size: 10px; color: var(--text-soft); line-height: 1.2;
}
.ava__req { font-family: 'Inter', sans-serif; font-size: 9px; color: var(--ink-soft); }
.ava__bar { width: 100%; height: 4px; background: var(--border); overflow: hidden; }
.ava__barfill { display: block; height: 100%; background: var(--tier, var(--accent)); }
</style>
