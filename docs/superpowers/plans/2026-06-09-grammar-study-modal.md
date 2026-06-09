# Grammar Study Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Click any grammar card in `/library` → opens a centered modal "study sheet" with full meaning, usage notes, SRS progress, "Practice this now" CTA, and reserved sections for audio/extra examples/achievements. Deep-linkable via `?grammar=<ko>`. TOPIK 1–2 entries get seeded usage notes in 8 locales; TOPIK 3–6 show "Coming soon" placeholders.

**Architecture:** One shared `<Modal>` primitive (teleport + focus trap + Esc + click-outside + scroll-lock) mounted in `pages/library.vue`, driven by a `useGrammarModal` composable that syncs open/closed state to `?grammar=<ko>` in the URL. Content lives in `GrammarStudySheet.vue` orchestrator + six small section sub-components. No global state — URL is the source of truth.

**Tech Stack:** Nuxt 4 SPA, Vue 3 Composition API, TypeScript, Pinia, vue-i18n, vitest + happy-dom + @vue/test-utils, pnpm.

**Spec:** `docs/superpowers/specs/2026-06-09-grammar-study-modal-design.md` (commit `5b07db2`).

**Naming correction vs spec:** vitest config (`vitest.config.ts`) requires test files end with `.test.ts`, not `.spec.ts`. This plan uses `.test.ts` throughout. The spec text mentions `.spec.ts` — that is the only typo; everything else in the spec is accurate.

---

## Task 1: `Modal.vue` Primitive

The shared modal scaffolding: teleport, overlay, scale-in transition, click-outside, Esc, focus trap, scroll-lock. Content goes in via the default slot. No domain knowledge.

**Files:**
- Create: `munbeop/app/components/ui/Modal.vue`
- Test: `munbeop/tests/components/Modal.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `munbeop/tests/components/Modal.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import Modal from '~/components/ui/Modal.vue'

async function flushTransitions() {
  await nextTick()
  await nextTick()
}

describe('Modal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  function mountModal(open: boolean, slotContent = '<p>hello</p>') {
    return mount(Modal, {
      attachTo: document.body,
      props: { open, title: 'Test', closeLabel: 'Close' },
      slots: { default: () => h('div', { innerHTML: slotContent }) },
      global: { stubs: { Teleport: false } },
    })
  }

  it('renders nothing when open=false', async () => {
    mountModal(false)
    await flushTransitions()
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders overlay and slot content when open=true', async () => {
    mountModal(true, '<span class="payload">PAYLOAD</span>')
    await flushTransitions()
    const overlay = document.body.querySelector('.modal-overlay')
    expect(overlay).not.toBeNull()
    expect(document.body.querySelector('.payload')?.textContent).toBe('PAYLOAD')
  })

  it('emits "close" when overlay is clicked (not the modal body)', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    const overlay = document.body.querySelector('.modal-overlay') as HTMLElement
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    // Synthetic event lands on overlay (target === overlay) — Vue's @click.self emits.
    // We rely on the wrapper hearing the emitted event.
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does NOT emit "close" when click lands inside the modal body', async () => {
    const wrapper = mountModal(true, '<button class="inner">x</button>')
    await flushTransitions()
    const inner = document.body.querySelector('.inner') as HTMLElement
    inner.click()
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('emits "close" when Escape is pressed', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits "close" when the X button is clicked', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    const closeBtn = document.body.querySelector('.modal-close') as HTMLElement
    closeBtn.click()
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('locks document.body scroll while open and restores on close', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ open: false })
    await flushTransitions()
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps focus inside the modal when Tab is pressed at the last focusable', async () => {
    mountModal(
      true,
      '<button class="a">a</button><button class="b">b</button>',
    )
    await flushTransitions()
    const b = document.body.querySelector('.b') as HTMLElement
    b.focus()
    expect(document.activeElement).toBe(b)
    // Tab from last focusable — trap should cycle to first (close button is first).
    const evt = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(evt)
    await flushTransitions()
    const closeBtn = document.body.querySelector('.modal-close')
    expect(document.activeElement).toBe(closeBtn)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd munbeop && pnpm test tests/components/Modal.test.ts
```

Expected: all tests FAIL with "Cannot find module ~/components/ui/Modal.vue".

- [ ] **Step 3: Implement `Modal.vue`**

Create `munbeop/app/components/ui/Modal.vue`:

```vue
<script setup lang="ts">
/**
 * Generic modal primitive — teleported overlay with scale-in transition,
 * Esc / click-outside / X close, focus trap, body scroll-lock. The default
 * slot owns the content; this file owns the scaffolding.
 */
import { onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  open: boolean
  /** Label for the close button (already-translated string). */
  closeLabel: string
  /** Visible title used for aria-labelledby — passed in by the consumer. */
  title?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const modalRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function focusableElements(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled'))
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  if (e.key === 'Tab') {
    const focusables = focusableElements()
    if (focusables.length === 0) return
    const first = focusables[0]!
    const last = focusables[focusables.length - 1]!
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function lockBodyScroll(lock: boolean) {
  document.body.style.overflow = lock ? 'hidden' : ''
}

watch(
  () => props.open,
  async (nowOpen) => {
    if (nowOpen) {
      previouslyFocused = document.activeElement as HTMLElement | null
      lockBodyScroll(true)
      window.addEventListener('keydown', onKeydown)
      document.addEventListener('keydown', onKeydown)
      // Wait for teleport + render before focusing.
      await Promise.resolve()
      const first = focusableElements()[0]
      first?.focus()
    } else {
      lockBodyScroll(false)
      window.removeEventListener('keydown', onKeydown)
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  lockBodyScroll(false)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keydown', onKeydown)
})

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-overlay"
        role="presentation"
        @click.self="onOverlayClick"
      >
        <div
          ref="modalRef"
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <button
            type="button"
            class="modal-close"
            :aria-label="closeLabel"
            @click="emit('close')"
          >
            [X]
          </button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999;
}

@media (min-width: 640px) {
  .modal-overlay {
    padding: 24px;
  }
}

.modal {
  position: relative;
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: var(--paper-deep, var(--paper));
  color: var(--ink);
  border: 4px solid var(--ink-line);
  box-shadow: 8px 8px 0 var(--shadow-cream);
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: var(--ink);
  cursor: pointer;
  padding: 4px 6px;
}
.modal-close:hover {
  color: var(--red);
}
.modal-close:focus-visible {
  outline: 2px solid var(--focus-ring, var(--gold));
  outline-offset: 2px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--motion-quick, 120ms) var(--ease-out, ease);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--motion-quick, 120ms) steps(4);
}
.modal-enter-from .modal {
  transform: scale(0.8);
}
.modal-leave-to .modal {
  transform: scale(0.8);
}
</style>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd munbeop && pnpm test tests/components/Modal.test.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/ui/Modal.vue munbeop/tests/components/Modal.test.ts
git commit -m "feat(ui): add Modal primitive (teleport + focus trap + scroll lock)"
```

---

## Task 2: `useGrammarModal` Composable

Syncs the modal's open/closed state with `?grammar=<ko>` query param. Pure logic — no DOM. Resolves the grammar from the store.

**Files:**
- Create: `munbeop/app/composables/useGrammarModal.ts`
- Test: `munbeop/tests/composables/useGrammarModal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/composables/useGrammarModal.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

// Mock vue-router's useRoute/useRouter — they aren't auto-imported in tests.
const routeQuery = ref<Record<string, string | undefined>>({})
const pushSpy = vi.fn(async () => {})
const replaceSpy = vi.fn(async () => {})

vi.stubGlobal('useRoute', () => ({ query: routeQuery.value }))
vi.stubGlobal('useRouter', () => ({ push: pushSpy, replace: replaceSpy }))

const fakeGrammar = {
  ko: '-(으)니까',
  meaning: { en: 'because', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}

const grammarByKo = vi.fn((ko: string) => (ko === fakeGrammar.ko ? fakeGrammar : undefined))
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({ grammarByKo, items: [fakeGrammar] }),
}))

// Import AFTER mocks are in place.
import { useGrammarModal } from '~/composables/useGrammarModal'

describe('useGrammarModal', () => {
  beforeEach(() => {
    routeQuery.value = {}
    pushSpy.mockClear()
    replaceSpy.mockClear()
    grammarByKo.mockClear()
  })

  it('selected is null when ?grammar= is absent', () => {
    const { selected, isOpen } = useGrammarModal()
    expect(selected.value).toBe(null)
    expect(isOpen.value).toBe(false)
  })

  it('selected resolves the grammar when ?grammar= matches a known ko', () => {
    routeQuery.value = { grammar: '-(으)니까' }
    const { selected, isOpen } = useGrammarModal()
    expect(selected.value).toEqual(fakeGrammar)
    expect(isOpen.value).toBe(true)
  })

  it('selected is null and replace is called when ?grammar= is unknown', async () => {
    routeQuery.value = { grammar: 'fake-pattern' }
    const { selected } = useGrammarModal()
    // computed reads happen at .value access — trigger it
    expect(selected.value).toBe(null)
    // sync cleanup (one tick)
    await Promise.resolve()
    expect(replaceSpy).toHaveBeenCalledTimes(1)
  })

  it('open(ko) calls router.push with the grammar query merged in', async () => {
    routeQuery.value = { theme: 'dark' }
    const { open } = useGrammarModal()
    await open('-(으)니까')
    expect(pushSpy).toHaveBeenCalledWith({ query: { theme: 'dark', grammar: '-(으)니까' } })
  })

  it('close() calls router.replace and preserves other query params', async () => {
    routeQuery.value = { theme: 'dark', grammar: '-(으)니까' }
    const { close } = useGrammarModal()
    await close()
    expect(replaceSpy).toHaveBeenCalledWith({ query: { theme: 'dark' } })
  })

  it('open() with the same ko already present is a no-op (no duplicate push)', async () => {
    routeQuery.value = { grammar: '-(으)니까' }
    const { open } = useGrammarModal()
    await open('-(으)니까')
    expect(pushSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd munbeop && pnpm test tests/composables/useGrammarModal.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the composable**

Create `munbeop/app/composables/useGrammarModal.ts`:

```ts
import { computed, watch } from 'vue'
import type { Grammar } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'

/**
 * Wraps the `?grammar=<ko>` query-param convention used by the Library
 * study-sheet modal. State lives in the URL (and only in the URL) — refresh,
 * deep-link, and browser back-button "just work" without component-local
 * booleans to keep in sync.
 */
export function useGrammarModal() {
  const route = useRoute()
  const router = useRouter()
  const grammarStore = useGrammarStore()

  const selected = computed<Grammar | null>(() => {
    const raw = route.query.grammar
    if (typeof raw !== 'string' || !raw) return null
    return grammarStore.grammarByKo(raw) ?? null
  })

  const isOpen = computed(() => selected.value !== null)

  // If ?grammar= points at a value the store doesn't know (deleted entry,
  // mistyped deep link), wipe the query so the URL doesn't lie about state.
  watch(
    () => route.query.grammar,
    async (raw) => {
      if (typeof raw !== 'string' || !raw) return
      if (!grammarStore.grammarByKo(raw)) {
        const { grammar: _omit, ...rest } = route.query
        await router.replace({ query: rest })
      }
    },
    { immediate: true },
  )

  async function open(ko: string) {
    if (route.query.grammar === ko) return
    await router.push({ query: { ...route.query, grammar: ko } })
  }

  async function close() {
    const { grammar: _omit, ...rest } = route.query
    await router.replace({ query: rest })
  }

  return { selected, isOpen, open, close }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd munbeop && pnpm test tests/composables/useGrammarModal.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useGrammarModal.ts munbeop/tests/composables/useGrammarModal.test.ts
git commit -m "feat(library): add useGrammarModal composable for ?grammar= sync"
```

---

## Task 3: Extend `Grammar` Domain with `usageNotes`

Single-field, backwards-compatible additive change to the Grammar interface.

**Files:**
- Modify: `munbeop/app/lib/domain/grammar.ts`

- [ ] **Step 1: Apply the edit**

Edit `munbeop/app/lib/domain/grammar.ts`. Replace the entire file content with:

```ts
import type { LocalizedString } from './i18n'

export interface Grammar {
  /** Korean grammar pattern, e.g. "-(으)니까". Unique identifier in v1. NOT translated. */
  ko: string
  /** Explanation of meaning/usage per locale. */
  meaning: LocalizedString
  /** Optional canonical example sentence in Korean. NOT translated. */
  example?: string
  /** Optional translation of the example per locale. */
  trans?: LocalizedString
  /** Deck this grammar belongs to. */
  deckId: string
  /**
   * Usage notes per locale — when to use the pattern, common pitfalls,
   * register (formal/informal), confusion with similar patterns.
   * Multi-paragraph free text. Optional: entries without notes render
   * the "Coming soon" placeholder in the study sheet.
   */
  usageNotes?: LocalizedString
}

export interface Deck {
  id: string
  name: string
  colorId: string
  order: number
  collapsed: boolean
}
```

- [ ] **Step 2: Run typecheck to confirm nothing breaks**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors. The field is optional — no existing seed needs to change.

- [ ] **Step 3: Run full test suite**

```bash
cd munbeop && pnpm test
```

Expected: same number passing as before (no new tests yet, no regressions).

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/lib/domain/grammar.ts
git commit -m "feat(domain): add optional Grammar.usageNotes (LocalizedString)"
```

---

## Task 4: i18n Keys for Modal Chrome (8 Locales)

Adds `library.modal.*` keys across all 8 locale JSON files. Only structural UI strings — content stays in `Grammar.usageNotes`.

**Files:**
- Modify: `munbeop/i18n/locales/en.json`
- Modify: `munbeop/i18n/locales/es.json`
- Modify: `munbeop/i18n/locales/fr.json`
- Modify: `munbeop/i18n/locales/id.json`
- Modify: `munbeop/i18n/locales/ja.json`
- Modify: `munbeop/i18n/locales/pt-BR.json`
- Modify: `munbeop/i18n/locales/th.json`
- Modify: `munbeop/i18n/locales/vi.json`

- [ ] **Step 1: Edit `en.json`**

Find the `"library": { "lead": "..." }` block. Replace it with:

```jsonc
  "library": {
    "lead": "All the grammar points that show up in your wheel. Each one grows as you practice.",
    "modal": {
      "close": "Close",
      "section": {
        "meaning": "Meaning",
        "usage_notes": "Usage notes",
        "your_progress": "Your progress",
        "examples": "Examples",
        "audio": "Pronunciation",
        "achievements": "Achievements",
        "practice_cta": "Practice this now"
      },
      "srs": {
        "mastery_label": "Mastery",
        "last_seen": "Last seen",
        "last_seen_never": "Never practiced yet",
        "times_practiced": "Times practiced"
      },
      "coming_soon": {
        "audio": "Pronunciation audio is coming soon. 화이팅!",
        "examples": "More example sentences are coming soon.",
        "achievements": "Achievements you can earn with this grammar are coming soon.",
        "usage_notes": "Detailed usage notes for this grammar are coming soon."
      }
    }
  },
```

(Preserve the existing `lead` value verbatim. If your file's `lead` differs from the snippet, keep yours.)

- [ ] **Step 2: Edit `es.json`**

Same structure under `library`:

```jsonc
  "library": {
    "lead": "Todos los puntos de gramática que aparecen en tu rueda. Cada uno crece a medida que practicas.",
    "modal": {
      "close": "Cerrar",
      "section": {
        "meaning": "Significado",
        "usage_notes": "Notas de uso",
        "your_progress": "Tu progreso",
        "examples": "Ejemplos",
        "audio": "Pronunciación",
        "achievements": "Logros",
        "practice_cta": "Practícala ahora"
      },
      "srs": {
        "mastery_label": "Dominio",
        "last_seen": "Vista por última vez",
        "last_seen_never": "Nunca practicada",
        "times_practiced": "Veces practicada"
      },
      "coming_soon": {
        "audio": "El audio de pronunciación llegará pronto. 화이팅!",
        "examples": "Más oraciones de ejemplo llegarán pronto.",
        "achievements": "Los logros que puedes ganar con esta gramática llegarán pronto.",
        "usage_notes": "Las notas de uso detalladas llegarán pronto."
      }
    }
  },
```

(Preserve the existing `lead` if it differs — only add the `modal` subtree.)

- [ ] **Step 3: Edit `fr.json`**

```jsonc
  "library": {
    "lead": "Tous les points de grammaire qui apparaissent dans ta roue. Chacun grandit à mesure que tu pratiques.",
    "modal": {
      "close": "Fermer",
      "section": {
        "meaning": "Signification",
        "usage_notes": "Notes d'usage",
        "your_progress": "Ta progression",
        "examples": "Exemples",
        "audio": "Prononciation",
        "achievements": "Succès",
        "practice_cta": "Pratique-la maintenant"
      },
      "srs": {
        "mastery_label": "Maîtrise",
        "last_seen": "Vue pour la dernière fois",
        "last_seen_never": "Jamais pratiquée",
        "times_practiced": "Fois pratiquée"
      },
      "coming_soon": {
        "audio": "L'audio de prononciation arrive bientôt. 화이팅!",
        "examples": "D'autres phrases d'exemple arrivent bientôt.",
        "achievements": "Les succès que tu peux gagner arriveront bientôt.",
        "usage_notes": "Les notes d'usage détaillées arrivent bientôt."
      }
    }
  },
```

- [ ] **Step 4: Edit `pt-BR.json`**

```jsonc
  "library": {
    "lead": "Todos os pontos de gramática que aparecem na sua roleta. Cada um cresce conforme você pratica.",
    "modal": {
      "close": "Fechar",
      "section": {
        "meaning": "Significado",
        "usage_notes": "Notas de uso",
        "your_progress": "Seu progresso",
        "examples": "Exemplos",
        "audio": "Pronúncia",
        "achievements": "Conquistas",
        "practice_cta": "Pratique agora"
      },
      "srs": {
        "mastery_label": "Domínio",
        "last_seen": "Vista pela última vez",
        "last_seen_never": "Nunca praticada",
        "times_practiced": "Vezes praticada"
      },
      "coming_soon": {
        "audio": "O áudio de pronúncia chega em breve. 화이팅!",
        "examples": "Mais frases de exemplo chegam em breve.",
        "achievements": "As conquistas que você pode ganhar chegam em breve.",
        "usage_notes": "Notas de uso detalhadas chegam em breve."
      }
    }
  },
```

- [ ] **Step 5: Edit `th.json`**

```jsonc
  "library": {
    "lead": "ไวยากรณ์ทั้งหมดที่ปรากฏในวงล้อของคุณ แต่ละข้อจะเติบโตเมื่อคุณฝึก",
    "modal": {
      "close": "ปิด",
      "section": {
        "meaning": "ความหมาย",
        "usage_notes": "หมายเหตุการใช้งาน",
        "your_progress": "ความก้าวหน้าของคุณ",
        "examples": "ตัวอย่าง",
        "audio": "การออกเสียง",
        "achievements": "ความสำเร็จ",
        "practice_cta": "ฝึกข้อนี้เลย"
      },
      "srs": {
        "mastery_label": "ระดับความเชี่ยวชาญ",
        "last_seen": "เห็นล่าสุด",
        "last_seen_never": "ยังไม่เคยฝึก",
        "times_practiced": "จำนวนครั้งที่ฝึก"
      },
      "coming_soon": {
        "audio": "เสียงการออกเสียงกำลังจะมา 화이팅!",
        "examples": "ประโยคตัวอย่างเพิ่มเติมกำลังจะมา",
        "achievements": "ความสำเร็จที่คุณจะได้รับกำลังจะมา",
        "usage_notes": "หมายเหตุการใช้งานโดยละเอียดกำลังจะมา"
      }
    }
  },
```

- [ ] **Step 6: Edit `id.json`**

```jsonc
  "library": {
    "lead": "Semua poin tata bahasa yang muncul di roda kamu. Setiap poin tumbuh saat kamu berlatih.",
    "modal": {
      "close": "Tutup",
      "section": {
        "meaning": "Arti",
        "usage_notes": "Catatan penggunaan",
        "your_progress": "Progres kamu",
        "examples": "Contoh",
        "audio": "Pelafalan",
        "achievements": "Pencapaian",
        "practice_cta": "Latih sekarang"
      },
      "srs": {
        "mastery_label": "Penguasaan",
        "last_seen": "Terakhir dilihat",
        "last_seen_never": "Belum pernah dilatih",
        "times_practiced": "Berapa kali dilatih"
      },
      "coming_soon": {
        "audio": "Audio pelafalan segera hadir. 화이팅!",
        "examples": "Lebih banyak kalimat contoh segera hadir.",
        "achievements": "Pencapaian yang bisa kamu raih segera hadir.",
        "usage_notes": "Catatan penggunaan rinci segera hadir."
      }
    }
  },
```

- [ ] **Step 7: Edit `vi.json`**

```jsonc
  "library": {
    "lead": "Tất cả các điểm ngữ pháp xuất hiện trong vòng quay của bạn. Mỗi điểm lớn lên khi bạn luyện tập.",
    "modal": {
      "close": "Đóng",
      "section": {
        "meaning": "Ý nghĩa",
        "usage_notes": "Ghi chú cách dùng",
        "your_progress": "Tiến độ của bạn",
        "examples": "Ví dụ",
        "audio": "Phát âm",
        "achievements": "Thành tựu",
        "practice_cta": "Luyện ngay"
      },
      "srs": {
        "mastery_label": "Mức độ thành thạo",
        "last_seen": "Lần xem gần nhất",
        "last_seen_never": "Chưa luyện lần nào",
        "times_practiced": "Số lần đã luyện"
      },
      "coming_soon": {
        "audio": "Âm thanh phát âm sắp ra mắt. 화이팅!",
        "examples": "Thêm câu ví dụ sắp ra mắt.",
        "achievements": "Các thành tựu bạn có thể đạt được sắp ra mắt.",
        "usage_notes": "Ghi chú cách dùng chi tiết sắp ra mắt."
      }
    }
  },
```

- [ ] **Step 8: Edit `ja.json`**

```jsonc
  "library": {
    "lead": "あなたのルーレットに出てくる全文法ポイント。練習するたびに育ちます。",
    "modal": {
      "close": "閉じる",
      "section": {
        "meaning": "意味",
        "usage_notes": "使い方ノート",
        "your_progress": "あなたの進捗",
        "examples": "例文",
        "audio": "発音",
        "achievements": "アチーブメント",
        "practice_cta": "今すぐ練習する"
      },
      "srs": {
        "mastery_label": "習熟度",
        "last_seen": "最終確認",
        "last_seen_never": "まだ練習していません",
        "times_practiced": "練習回数"
      },
      "coming_soon": {
        "audio": "発音音声は近日対応予定。화이팅!",
        "examples": "例文の追加は近日対応予定。",
        "achievements": "この文法で獲得できるアチーブメントは近日対応予定。",
        "usage_notes": "詳しい使い方ノートは近日対応予定。"
      }
    }
  },
```

- [ ] **Step 9: Validate JSON**

```bash
cd munbeop && node -e "['en','es','fr','id','ja','pt-BR','th','vi'].forEach(l => JSON.parse(require('fs').readFileSync('i18n/locales/'+l+'.json','utf8')))"
```

Expected: no output (silent success). Any error → fix that file before continuing.

- [ ] **Step 10: Typecheck and lint**

```bash
cd munbeop && pnpm typecheck && pnpm lint
```

Expected: 0 errors.

- [ ] **Step 11: Commit**

```bash
git add munbeop/i18n/locales/
git commit -m "feat(i18n): add library.modal.* keys across all 8 locales"
```

---

## Task 5: `ComingSoonSection` Component

The simplest section. Reused by 4 placeholder slots in the sheet (audio, examples, achievements, and — when undefined — usage notes).

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/ComingSoonSection.vue`

- [ ] **Step 1: Create directory + component**

Create `munbeop/app/components/library/GrammarStudySheet/ComingSoonSection.vue`:

```vue
<script setup lang="ts">
/**
 * Inert placeholder block for sections without data yet. Visual style is a
 * dashed-border card so it reads "future content" at a glance, not "broken".
 */
interface Props {
  /** Already-translated heading, e.g. "Pronunciation". */
  title: string
  /** Already-translated body, e.g. "Pronunciation audio is coming soon. 화이팅!". */
  body: string
}
defineProps<Props>()
</script>

<template>
  <section class="coming-soon">
    <h3 class="coming-soon__title">{{ title }}</h3>
    <p class="coming-soon__body">{{ body }}</p>
  </section>
</template>

<style scoped>
.coming-soon {
  border: 2px dashed var(--ink-line);
  background: var(--paper);
  padding: 12px 14px;
  margin-top: 16px;
  opacity: 0.8;
}
.coming-soon__title {
  margin: 0 0 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}
.coming-soon__body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
</style>
```

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/ComingSoonSection.vue
git commit -m "feat(library): add ComingSoonSection placeholder for future modal sections"
```

---

## Task 6: `MeaningSection` Component

Renders `meaning`, optional `example` (Korean), optional `trans` (localized example translation).

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/MeaningSection.vue`

- [ ] **Step 1: Implement**

Create `munbeop/app/components/library/GrammarStudySheet/MeaningSection.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'

interface Props {
  grammar: Grammar
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <section class="meaning-section">
    <h3 class="section-title">{{ t('library.modal.section.meaning') }}</h3>
    <p class="meaning">{{ tl(grammar.meaning) }}</p>
    <div v-if="grammar.example" class="example">
      <p class="example__ko">{{ grammar.example }}</p>
      <p v-if="grammar.trans" class="example__trans">{{ tl(grammar.trans) }}</p>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.meaning {
  margin: 0 0 12px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--ink);
}
.example {
  background: var(--paper);
  border-left: 4px solid var(--jade);
  padding: 10px 12px;
}
.example__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
}
.example__trans {
  margin: 4px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
</style>
```

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/MeaningSection.vue
git commit -m "feat(library): add MeaningSection (modal block for meaning + example)"
```

---

## Task 7: `UsageNotesSection` Component

Renders `grammar.usageNotes` when present; renders `ComingSoonSection` otherwise.

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/UsageNotesSection.vue`

- [ ] **Step 1: Implement**

Create `munbeop/app/components/library/GrammarStudySheet/UsageNotesSection.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import ComingSoonSection from './ComingSoonSection.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const notes = computed(() => (props.grammar.usageNotes ? tl(props.grammar.usageNotes) : ''))
</script>

<template>
  <ComingSoonSection
    v-if="!grammar.usageNotes"
    :title="t('library.modal.section.usage_notes')"
    :body="t('library.modal.coming_soon.usage_notes')"
  />
  <section v-else class="usage-notes-section">
    <h3 class="section-title">{{ t('library.modal.section.usage_notes') }}</h3>
    <p class="notes">{{ notes }}</p>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.notes {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  line-height: 1.55;
  white-space: pre-wrap;
}
</style>
```

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/UsageNotesSection.vue
git commit -m "feat(library): add UsageNotesSection (renders usageNotes or Coming Soon)"
```

---

## Task 8: `SrsProgressSection` Component

Reads mastery + lastSeen + practice-count from the SRS / log stores. Read-only — does not write SRS.

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue`

- [ ] **Step 1: Implement**

Create `munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const srs = useSrsStore()
const log = useLogStore()

const state = computed(() => srs.ensure(props.grammar.ko))
const info = computed(() => getMasteryInfo(state.value.mastery))

const lastSeenLabel = computed(() => {
  const ts = state.value.lastSeen
  if (!ts) return t('library.modal.srs.last_seen_never')
  const d = new Date(ts)
  return d.toLocaleDateString()
})

const timesPracticed = computed(() =>
  log.entries.filter((e) => e.ko === props.grammar.ko).length,
)
</script>

<template>
  <section class="srs-section">
    <h3 class="section-title">{{ t('library.modal.section.your_progress') }}</h3>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.mastery_label') }}</span>
      <span class="row__value">
        <MasteryIcon :level="state.mastery" :size="12" />
        {{ t(info.labelKey) }}
      </span>
    </div>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.last_seen') }}</span>
      <span class="row__value">{{ lastSeenLabel }}</span>
    </div>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.times_practiced') }}</span>
      <span class="row__value">{{ timesPracticed }}</span>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--ink-line);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
}
.row:last-child {
  border-bottom: none;
}
.row__label {
  color: var(--ink-soft);
}
.row__value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
  font-weight: 600;
}
</style>
```

**Note:** `log.entries` is the existing log-store array used in practice flows. If the shape doesn't include `ko`, fall back to `0` in the computed: `log.entries.filter((e) => e.ko === props.grammar.ko).length || 0`.

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors. If a property name mismatch surfaces (e.g. log entries use `grammarKo` not `ko`), update the filter to the real field name and re-run.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue
git commit -m "feat(library): add SrsProgressSection (mastery + lastSeen + count)"
```

---

## Task 9: `PracticeCtaSection` Component

A single button: "Practice this now" → navigates to `/practice?focus=<ko>`.

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/PracticeCtaSection.vue`

- [ ] **Step 1: Implement**

Create `munbeop/app/components/library/GrammarStudySheet/PracticeCtaSection.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const router = useRouter()

async function onClick() {
  await router.push({ path: '/practice', query: { focus: props.grammar.ko } })
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
```

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/PracticeCtaSection.vue
git commit -m "feat(library): add PracticeCtaSection (jumps to /practice?focus=<ko>)"
```

---

## Task 10: `HeaderRow` Component

Sticky header inside the modal: large `ko`, mastery badge, close button (in addition to the X already on the Modal — this one is the "pretty" close used in the header strip).

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue`

- [ ] **Step 1: Implement**

Create `munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import Badge from '~/components/ui/Badge.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const srs = useSrsStore()
const level = computed(() => srs.ensure(props.grammar.ko).mastery)
const info = computed(() => getMasteryInfo(level.value))
</script>

<template>
  <header class="header">
    <h2 class="header__ko">{{ grammar.ko }}</h2>
    <Badge>
      <MasteryIcon :level="level" :size="10" />
      <span>{{ t(info.labelKey) }}</span>
    </Badge>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 3px solid var(--ink-line);
  background: var(--paper-deep, var(--paper));
  z-index: 1;
}
.header__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: var(--ink);
}
</style>
```

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue
git commit -m "feat(library): add HeaderRow (sticky ko + mastery badge)"
```

---

## Task 11: `GrammarStudySheet` Orchestrator (TDD)

The single component that composes all six sections. Tested as a unit using mocked store + props.

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet.vue`
- Test: `munbeop/tests/components/GrammarStudySheet.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/GrammarStudySheet.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Grammar } from '~/lib/domain'

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({
    ensure: () => ({ mastery: 0, lastSeen: null }),
  }),
}))
vi.mock('~/stores/log', () => ({
  useLogStore: () => ({ entries: [] }),
}))

const pushSpy = vi.fn()
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'

const seededGrammar: Grammar = {
  ko: '-(으)니까',
  meaning: { en: 'because (subjective reason)', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  example: '비가 오니까 우산을 챙겨요.',
  trans: { en: 'It is raining, so I bring an umbrella.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  usageNotes: { en: 'Use this for subjective reasons. Often paired with imperatives.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}
const unseededGrammar: Grammar = {
  ko: '-기만 하다',
  meaning: { en: 'just do X (and nothing else)', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-3',
}

describe('GrammarStudySheet', () => {
  it('renders ko, meaning, example, trans when present', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const html = wrapper.html()
    expect(html).toContain('-(으)니까')
    expect(html).toContain('because (subjective reason)')
    expect(html).toContain('비가 오니까')
    expect(html).toContain('It is raining')
  })

  it('renders usageNotes when present', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    expect(wrapper.html()).toContain('Use this for subjective reasons.')
  })

  it('renders ComingSoonSection for usageNotes when undefined', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: unseededGrammar } })
    expect(wrapper.html()).toContain('library.modal.coming_soon.usage_notes')
  })

  it('always renders ComingSoon for audio, examples, achievements in v1', () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const html = wrapper.html()
    expect(html).toContain('library.modal.coming_soon.audio')
    expect(html).toContain('library.modal.coming_soon.examples')
    expect(html).toContain('library.modal.coming_soon.achievements')
  })

  it('practice CTA pushes /practice?focus=<ko>', async () => {
    const wrapper = mount(GrammarStudySheet, { props: { grammar: seededGrammar } })
    const btn = wrapper.find('.cta__btn')
    await btn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith({ path: '/practice', query: { focus: '-(으)니까' } })
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd munbeop && pnpm test tests/components/GrammarStudySheet.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the orchestrator**

Create `munbeop/app/components/library/GrammarStudySheet.vue`:

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import HeaderRow from './GrammarStudySheet/HeaderRow.vue'
import MeaningSection from './GrammarStudySheet/MeaningSection.vue'
import UsageNotesSection from './GrammarStudySheet/UsageNotesSection.vue'
import SrsProgressSection from './GrammarStudySheet/SrsProgressSection.vue'
import PracticeCtaSection from './GrammarStudySheet/PracticeCtaSection.vue'
import ComingSoonSection from './GrammarStudySheet/ComingSoonSection.vue'

interface Props {
  grammar: Grammar
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <article class="study-sheet">
    <HeaderRow :grammar="grammar" />
    <MeaningSection :grammar="grammar" />
    <UsageNotesSection :grammar="grammar" />
    <SrsProgressSection :grammar="grammar" />
    <PracticeCtaSection :grammar="grammar" />
    <ComingSoonSection
      :title="t('library.modal.section.audio')"
      :body="t('library.modal.coming_soon.audio')"
    />
    <ComingSoonSection
      :title="t('library.modal.section.examples')"
      :body="t('library.modal.coming_soon.examples')"
    />
    <ComingSoonSection
      :title="t('library.modal.section.achievements')"
      :body="t('library.modal.coming_soon.achievements')"
    />
  </article>
</template>

<style scoped>
.study-sheet {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
cd munbeop && pnpm test tests/components/GrammarStudySheet.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet.vue munbeop/tests/components/GrammarStudySheet.test.ts
git commit -m "feat(library): add GrammarStudySheet orchestrator + tests"
```

---

## Task 12: Wire Modal Into `pages/library.vue`

Cards become clickable; one shared Modal+StudySheet mounted at the page level; `useGrammarModal` drives state.

**Files:**
- Modify: `munbeop/app/pages/library.vue`

- [ ] **Step 1: Apply the edit**

Replace the entire `<script setup lang="ts">` block in `munbeop/app/pages/library.vue`:

```ts
import Badge from '~/components/ui/Badge.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Card from '~/components/ui/Card.vue'
import Modal from '~/components/ui/Modal.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import GrammarStudySheet from '~/components/library/GrammarStudySheet.vue'
import { getMasteryInfo } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'
import { useGrammarModal } from '~/composables/useGrammarModal'

const grammarStore = useGrammarStore()
const srsStore = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const { selected, isOpen, open, close } = useGrammarModal()

const sections = computed(() => {
  const sortedDecks = [...grammarStore.decks].sort((a, b) => a.order - b.order)
  return sortedDecks
    .map((deck) => {
      const items = grammarStore.items
        .filter((g) => g.deckId === deck.id)
        .map((g) => {
          const level = srsStore.ensure(g.ko).mastery
          return { grammar: g, level, info: getMasteryInfo(level) }
        })
      return { deck, items }
    })
    .filter((s) => s.items.length > 0)
})

const orphans = computed(() => {
  const known = new Set(grammarStore.decks.map((d) => d.id))
  return grammarStore.items
    .filter((g) => !known.has(g.deckId))
    .map((g) => {
      const level = srsStore.ensure(g.ko).mastery
      return { grammar: g, level, info: getMasteryInfo(level) }
    })
})

function accentFor(masteryCls: string) {
  if (masteryCls === 'mastery-tree') return 'jade'
  if (masteryCls === 'mastery-plant') return 'gold'
  return 'sky'
}

async function onToggleDeck(deckId: string) {
  await grammarStore.toggleDeckCollapsed(deckId)
}

async function onCardClick(ko: string) {
  await open(ko)
}
```

Then in the `<template>`, change every `<Card v-for="item in ..." ...>` to add `clickable` and `@click`:

For the main loop (inside `<section v-for="section in sections">`), find:

```vue
<Card
  v-for="item in section.items"
  :key="item.grammar.ko"
  :accent="accentFor(item.info.cls)"
>
```

Replace with:

```vue
<Card
  v-for="item in section.items"
  :key="item.grammar.ko"
  :accent="accentFor(item.info.cls)"
  clickable
  @click="onCardClick(item.grammar.ko)"
>
```

For the orphans loop, do the same: add `clickable` and `@click="onCardClick(item.grammar.ko)"`.

Then add the Modal mount at the **end** of `<template>`, just before the closing `</div>` of `.page`:

```vue
    <Modal
      :open="isOpen"
      :title="selected?.ko ?? ''"
      :close-label="t('library.modal.close')"
      @close="close"
    >
      <GrammarStudySheet v-if="selected" :key="selected.ko" :grammar="selected" />
    </Modal>
  </div>
</template>
```

(The `:key="selected.ko"` forces a clean re-mount of the sheet when the user clicks a different card without closing — resets scroll position and section state.)

- [ ] **Step 2: Typecheck + lint**

```bash
cd munbeop && pnpm typecheck && pnpm lint
```

Expected: 0 errors.

- [ ] **Step 3: Run the full test suite**

```bash
cd munbeop && pnpm test
```

Expected: all green. The page-level changes don't have a dedicated unit test (covered manually in Task 17).

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/pages/library.vue
git commit -m "feat(library): make grammar cards open the study-sheet modal via ?grammar="
```

---

## Task 13: `usePractice` Support for `?focus=<ko>`

When the Practice page loads with `?focus=<ko>`, filter the active pool to that single grammar and start the round with it. If the diff exceeds ~30 LOC, split into a sub-PR — but the expected change is small.

**Files:**
- Modify: `munbeop/app/composables/usePractice.ts`

- [ ] **Step 1: Read the existing composable**

Open `munbeop/app/composables/usePractice.ts` and locate where the pool of active grammars is computed (the spot that already filters by `excludedDeckIds` via `grammarStore.activeIndices`).

- [ ] **Step 2: Inject `?focus=` handling**

At the top of the composable's function body, after `const grammarStore = useGrammarStore()` (or equivalent), add:

```ts
const route = useRoute()
const focusKo = computed(() => {
  const raw = route.query.focus
  return typeof raw === 'string' && raw ? raw : null
})
```

Then, where the pool is built — wherever `grammarStore.activeIndices` is used to pick candidates — add a guard:

```ts
const pool = computed(() => {
  if (focusKo.value) {
    const i = grammarStore.items.findIndex((g) => g.ko === focusKo.value)
    return i >= 0 ? [i] : grammarStore.activeIndices
  }
  return grammarStore.activeIndices
})
```

…and replace any inline `grammarStore.activeIndices` reference in the pick logic with `pool.value`. If `pool` is already a name in scope, use `focusedPool` instead.

**If the change exceeds ~30 LOC of edits across multiple methods**, STOP and create a sub-PR for this change. The Library modal works without it — the CTA button just navigates and Practice runs its normal random pool until this task lands.

- [ ] **Step 3: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Manual check**

```bash
cd munbeop && pnpm dev
```

Open `http://localhost:3000/practice?focus=-게-되다` in a browser. Practice should start with `-게-되다` as the (only) grammar in the round.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/usePractice.ts
git commit -m "feat(practice): honor ?focus=<ko> to start a single-grammar round"
```

---

## Task 14: Seed Completeness Canary Test

Stays RED until Tasks 15 + 16 land. Locks the v1 scope: TOPIK 1–2 fully seeded, TOPIK 3–6 deliberately empty.

**Files:**
- Create: `munbeop/tests/unit/grammars-seed-completeness.test.ts`

- [ ] **Step 1: Write the test**

Create `munbeop/tests/unit/grammars-seed-completeness.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { TOPIK_1_GRAMMAR } from '~/seed/grammars-n1'
import { TOPIK_2_GRAMMAR } from '~/seed/grammars-n2'
import { TOPIK_3_GRAMMAR } from '~/seed/grammars-n3'
import { TOPIK_4_GRAMMAR } from '~/seed/grammars-n4'
import { TOPIK_5_GRAMMAR } from '~/seed/grammars-n5'
import { TOPIK_6_GRAMMAR } from '~/seed/grammars-n6'

const LOCALES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

describe('usageNotes seed completeness', () => {
  describe('TOPIK 1 + 2 (v1 scope)', () => {
    const inScope = [...TOPIK_1_GRAMMAR, ...TOPIK_2_GRAMMAR]
    for (const g of inScope) {
      it(`${g.ko} has usageNotes in all 8 locales`, () => {
        expect(g.usageNotes, `${g.ko} missing usageNotes`).toBeDefined()
        for (const locale of LOCALES) {
          const v = g.usageNotes![locale]
          expect(v, `${g.ko}.${locale} empty`).toBeTruthy()
          expect(
            v.length,
            `${g.ko}.${locale} too short (got ${v.length} chars, need >20)`,
          ).toBeGreaterThan(20)
        }
      })
    }
  })

  describe('TOPIK 3-6 (out of v1 scope — must stay empty)', () => {
    const outOfScope = [
      ...TOPIK_3_GRAMMAR,
      ...TOPIK_4_GRAMMAR,
      ...TOPIK_5_GRAMMAR,
      ...TOPIK_6_GRAMMAR,
    ]
    for (const g of outOfScope) {
      it(`${g.ko} has usageNotes === undefined`, () => {
        expect(
          g.usageNotes,
          `${g.ko} has usageNotes — was seeded outside v1 scope. Either move it to a v1 PR by also seeding all of TOPIK 1+2, or delete it.`,
        ).toBeUndefined()
      })
    }
  })
})
```

- [ ] **Step 2: Run it to confirm it fails as expected**

```bash
cd munbeop && pnpm test tests/unit/grammars-seed-completeness.test.ts
```

Expected: all TOPIK 1+2 tests FAIL ("missing usageNotes"). TOPIK 3-6 tests PASS (no seed touched there yet).

- [ ] **Step 3: Commit the canary**

```bash
git add munbeop/tests/unit/grammars-seed-completeness.test.ts
git commit -m "test(seed): add usageNotes completeness canary (fails until n1+n2 seeded)"
```

---

## Task 15: Seed `usageNotes` for TOPIK 1 (53 entries × 8 locales)

This is **content writing**, not just code. Budget time accordingly. The canary from Task 14 makes the writing checkable.

**Files:**
- Modify: `munbeop/app/seed/grammars-n1.ts`

- [ ] **Step 1: Read the file end-to-end**

```bash
cd munbeop && wc -l app/seed/grammars-n1.ts
```

Expected: ~530 lines (each entry ≈ 10 lines).

- [ ] **Step 2: For each of the 53 entries, add `usageNotes` after `trans`**

For every entry, append a `usageNotes: L(...)` call between `trans: L(...)` and `deckId: 'topik-1'`. Example transformation, using the first entry's `ko` (look up the real `ko` of each entry when filling notes):

Before:
```ts
  {
    ko: '-아/어요',
    meaning: L(/* 8 locales */),
    example: '안녕하세요.',
    trans: L(/* 8 locales */),
    deckId: 'topik-1',
  },
```

After:
```ts
  {
    ko: '-아/어요',
    meaning: L(/* 8 locales */),
    example: '안녕하세요.',
    trans: L(/* 8 locales */),
    usageNotes: L(
      'Polite-informal ending. Used in everyday conversation with people of equal or slightly higher status. Drop the -요 to make it casual (반말) — used only with close friends and children. Pairs with -지요? for soft confirmation.',
      'Terminación cortés-informal. Se usa en conversación cotidiana con personas de igual o ligeramente mayor estatus. Quita -요 para hacerlo casual (반말) — solo con amigos cercanos y niños. Combina con -지요? para confirmación suave.',
      'Terminaison polie-informelle. Utilisée dans la conversation quotidienne avec des personnes de statut égal ou légèrement supérieur. Enlève -요 pour le rendre familier (반말) — uniquement avec amis proches et enfants. Se combine avec -지요? pour une confirmation douce.',
      'Terminação polida-informal. Usada na conversa cotidiana com pessoas de status igual ou levemente superior. Tire o -요 para deixar casual (반말) — apenas com amigos próximos e crianças. Combina com -지요? para confirmação suave.',
      'คำลงท้ายสุภาพแบบไม่เป็นทางการ ใช้ในบทสนทนาประจำวันกับคนที่มีสถานะเท่ากันหรือสูงกว่าเล็กน้อย ตัด -요 ออกเพื่อทำให้เป็นแบบกันเอง (반말) — ใช้กับเพื่อนสนิทและเด็กเท่านั้น ใช้คู่กับ -지요? เพื่อการยืนยันแบบนุ่มนวล',
      'Akhiran sopan-informal. Digunakan dalam percakapan sehari-hari dengan orang berstatus setara atau sedikit lebih tinggi. Hilangkan -요 untuk membuatnya santai (반말) — hanya dengan teman dekat dan anak-anak. Pasangkan dengan -지요? untuk konfirmasi lembut.',
      'Đuôi lịch sự không trang trọng. Dùng trong giao tiếp hàng ngày với người ngang hàng hoặc hơi lớn hơn. Bỏ -요 để thành thân mật (반말) — chỉ với bạn thân và trẻ em. Đi kèm -지요? để xác nhận nhẹ nhàng.',
      '丁寧でカジュアルな語尾。同等または少し上の相手との日常会話で使う。-요を取ると반말になり、親しい友人や子どもにだけ使う。-지요?と組み合わせて穏やかな確認を表す。',
    ),
    deckId: 'topik-1',
  },
```

**Writing convention** (apply consistently to every entry):
1. **When and why** — when the pattern is used, what effect it gives.
2. **Grammar rule** — verb/adjective compatibility, irregular conjugation, preceding particle.
3. **Confusion warning** (optional) — which similar pattern it gets mixed up with.
4. **Register / context** (optional) — formality level, typical setting.

Aim for 2–4 sentences per locale, every locale > 20 characters (the canary enforces this).

Locale order in `L(...)` is **fixed**: `en, es, fr, pt-BR, th, id, vi, ja`. Defined in `munbeop/app/seed/locale.ts:11`.

- [ ] **Step 3: Run the canary against n1**

```bash
cd munbeop && pnpm test tests/unit/grammars-seed-completeness.test.ts -t "TOPIK 1"
```

Expected: all TOPIK 1 tests PASS. TOPIK 2 tests still fail (next task).

- [ ] **Step 4: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors. (Catches: passing 7 args instead of 8 to `L()`, bad JSON in a string with quotes, etc.)

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/seed/grammars-n1.ts
git commit -m "feat(seed): add usageNotes to all TOPIK 1 grammars (53 entries × 8 locales)"
```

---

## Task 16: Seed `usageNotes` for TOPIK 2 (46 entries × 8 locales)

Same shape as Task 15 for `grammars-n2.ts`. Apply the same writing convention.

**Files:**
- Modify: `munbeop/app/seed/grammars-n2.ts`

- [ ] **Step 1: For each of the 46 entries, add `usageNotes` after `trans`**

Use the writing convention from Task 15. Locale order: `en, es, fr, pt-BR, th, id, vi, ja`.

Worked example for one of the TOPIK 2 entries — `-(으)ㄴ 적이 있다/없다` (have/haven't done):

```ts
    usageNotes: L(
      'Indicates past experience: "have/haven’t done X." Used to ask or report whether the action ever happened, not whether it happened recently. Attach -(으)ㄴ 적이 있다 to verbs (with -았/었 for richer time framing).',
      'Indica experiencia pasada: "haber/no haber hecho X". Se usa para preguntar o reportar si la acción ocurrió alguna vez, no si fue reciente. Se añade -(으)ㄴ 적이 있다 a verbos (con -았/었 para un marco temporal más rico).',
      'Indique une expérience passée : « avoir/ne pas avoir fait X ». Sert à demander ou rapporter si l’action est jamais arrivée, pas si elle est récente. Suffixé -(으)ㄴ 적이 있다 aux verbes (avec -았/었 pour un cadre temporel plus riche).',
      'Indica experiência passada: "já/nunca ter feito X". Usado para perguntar ou relatar se a ação algum dia aconteceu, não se foi recente. Anexa -(으)ㄴ 적이 있다 a verbos (com -았/었 para enquadramento temporal mais rico).',
      'แสดงประสบการณ์ในอดีต: "เคย/ไม่เคยทำ X" ใช้ถามหรือรายงานว่าการกระทำเคยเกิดขึ้นหรือไม่ ไม่ใช่ว่าเกิดขึ้นเมื่อเร็ว ๆ นี้หรือไม่ เติม -(으)ㄴ 적이 있다 หลังคำกริยา (ใช้ -았/었 เพื่อกรอบเวลาที่ละเอียดขึ้น)',
      'Menunjukkan pengalaman lampau: "pernah/tidak pernah melakukan X". Dipakai untuk menanyakan atau melaporkan apakah aksi pernah terjadi, bukan apakah baru-baru ini. Lampirkan -(으)ㄴ 적이 있다 ke verba (gunakan -았/었 untuk konteks waktu lebih kaya).',
      'Diễn tả kinh nghiệm quá khứ: "đã từng / chưa từng làm X". Dùng để hỏi hoặc kể xem hành động có bao giờ xảy ra hay không, không phải xảy ra gần đây hay không. Gắn -(으)ㄴ 적이 있다 vào động từ (kết hợp -았/었 để có khung thời gian phong phú hơn).',
      '過去の経験を表す。「Xしたことがある／ない」。動作が以前に起きたかどうかを尋ねたり報告したりするときに使う(最近かどうかではない)。動詞に -(으)ㄴ 적이 있다 を付ける。-았/었 と組み合わせるとより細かい時間枠が表せる。',
    ),
```

- [ ] **Step 2: Run the full canary**

```bash
cd munbeop && pnpm test tests/unit/grammars-seed-completeness.test.ts
```

Expected: all TOPIK 1, all TOPIK 2 PASS; all TOPIK 3–6 (undefined check) PASS. The canary is GREEN.

- [ ] **Step 3: Typecheck + lint**

```bash
cd munbeop && pnpm typecheck && pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/seed/grammars-n2.ts
git commit -m "feat(seed): add usageNotes to all TOPIK 2 grammars (46 entries × 8 locales)"
```

---

## Task 17: Final Verification — Manual + Build + Push

The `verify → commit → verify → push` rule from project memory: pre-push verification is mandatory.

- [ ] **Step 1: Run the full test suite**

```bash
cd munbeop && pnpm test
```

Expected: all green, including the new Modal, GrammarStudySheet, useGrammarModal, seed-completeness tests. No regressions in pre-existing tests.

- [ ] **Step 2: Typecheck**

```bash
cd munbeop && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Lint**

```bash
cd munbeop && pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Production build**

```bash
cd munbeop && pnpm build
```

Expected: build succeeds. Watch for SSR/SPA warnings.

- [ ] **Step 5: Manual verification — golden path**

```bash
cd munbeop && pnpm dev
```

Open `http://localhost:3000/library`. Walk through:

1. ✅ Decks render. Cards are visibly hoverable (lift + shadow shift) — `clickable` applied.
2. ✅ Click any TOPIK 1 card → modal opens, URL becomes `/library?grammar=...`, focus lands on the close button.
3. ✅ Tab several times → focus cycles inside the modal (does NOT escape to the page behind).
4. ✅ Esc → modal closes. URL is `/library`. Focus returns to the source card.
5. ✅ Click a TOPIK 1 card → meaningful "Usage notes" text appears.
6. ✅ Click a TOPIK 4 card → "Usage notes" shows the Coming Soon placeholder.
7. ✅ The Pronunciation / Examples / Achievements sections always show Coming Soon.
8. ✅ Click "Practice this now" → navigates to `/practice?focus=<ko>`. Modal gone. Practice round contains only that grammar.

- [ ] **Step 6: Manual verification — edge cases**

9. ✅ Refresh on `/library?grammar=-게-되다` → modal opens directly after store hydrates.
10. ✅ Visit `/library?grammar=fake-pattern` → modal does NOT open, URL cleans to `/library`.
11. ✅ Browser back button with modal open → modal closes, stays on Library.
12. ✅ Click card A, then card B without closing → content swaps cleanly, scroll resets to top.
13. ✅ Switch locale via settings or language selector → modal content reactively re-translates.
14. ✅ Devtools viewport 360 px wide → modal is centered with visible margin, NOT full-screen. Content scrolls internally if it overflows.
15. ✅ Dark mode (toggle in settings) → modal respects `--paper`, `--ink`, `--ink-line` tokens (no white-on-white or invisible text).

- [ ] **Step 7: Push**

```bash
git push origin claude/elastic-leavitt-5898c9
```

Expected: push succeeds. Open a PR with the spec link and this plan link in the description.

---

## Self-Review

**Spec coverage check:** Mapping each spec section to a task —

| Spec section | Tasks |
|---|---|
| `Modal.vue` primitive | Task 1 |
| `useGrammarModal` composable | Task 2 |
| Domain extension (`usageNotes`) | Task 3 |
| i18n keys × 8 locales | Task 4 |
| Section sub-components (6) | Tasks 5–10 |
| `GrammarStudySheet` orchestrator | Task 11 |
| `pages/library.vue` integration | Task 12 |
| `usePractice` `?focus=` support | Task 13 |
| Seed completeness canary | Task 14 |
| TOPIK 1 seeding | Task 15 |
| TOPIK 2 seeding | Task 16 |
| Pre/post-commit verification + manual checks | Task 17 |

All sections covered.

**Placeholder check:** No "TBD", "TODO", or "fill in later" in step bodies. Task 13 contains a conditional ("if diff exceeds ~30 LOC, split into a sub-PR") — that is an explicit decision rule, not a placeholder.

**Type consistency:** `selected`, `isOpen`, `open`, `close` are used identically across the composable, library.vue integration, and tests. `Grammar` properties (`ko`, `meaning`, `example`, `trans`, `deckId`, `usageNotes`) match the domain definition in Task 3. The L() helper signature `(en, es, fr, ptBR, th, id, vi, ja)` is used identically in all seed snippets.

**Known minor risks:**
- Focus-trap test (Task 1 Step 1) relies on `KeyboardEvent` dispatch + happy-dom's focus semantics. If happy-dom's focus simulation doesn't match the production browser exactly, that single test may flake — switch its expectation to "the last focusable has lost focus" if the strict `activeElement === closeBtn` check fails.
- `SrsProgressSection` references `log.entries[i].ko`. If the existing log shape uses a different field name (e.g., `grammarKo`), Task 8 Step 2 has a typecheck fallback noted.

If running execution and either appears, fix inline and continue.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-09-grammar-study-modal.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session, batch with checkpoints for review.

Which approach?
