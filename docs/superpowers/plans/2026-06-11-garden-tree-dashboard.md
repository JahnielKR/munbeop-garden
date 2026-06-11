# Plan — Jardín TOPIK: implementación por fases

Fecha: 2026-06-11 · Spec: `docs/superpowers/specs/2026-06-11-garden-tree-dashboard.md` (leerla PRIMERO)
Assets/pipeline: `tools/pixel-trees/README.md`

## Cómo usar este plan

- Ejecutar las fases **en orden**; cada una deja la app funcionando y se puede
  commitear sola. Marcar checkboxes al completar.
- Las fases 1–3 son el MVP visible (árbol real en la home). 4–7 añaden el
  juego (zonas, jardín, clima, celebración). 8 es chrome. 9 es QA final.
- Convenciones del repo: `<script setup lang="ts">`, `withDefaults`, JSDoc
  con referencia a docs, tokens v5 (`--paper`, `--ink-line`, `--gold`…),
  componentes en `app/components/garden/`, sin texto hardcodeado (i18n).
- Antes de empezar una fase, releer su sección entera (hay decisiones
  embebidas en los pasos).

## Estado de partida (ya hecho, NO rehacer)

- 34 PNG en `munbeop/public/img/tree/` (6 especies × 5 capas + sombra + 3 partículas).
- `app/components/garden/PixelTree.vue` con `TREE_THRESHOLDS = { sprout: 10, leafy: 40, bloom: 80 }` y tipo `TreeSpecies`.
- Generador `tools/pixel-trees/generate_trees.py` + preview `tools/pixel-trees/preview.html`.
- La home actual (`app/pages/index.vue`) es un placeholder con Bomi — se reemplaza en Fase 3.

---

## Fase 1 — Dominio del jardín (`app/lib/garden/`) + tests

Objetivo: toda la lógica (fórmula de progreso, puertas, mapeo especies) como
funciones puras testeables, sin Vue ni stores.

Archivos a crear:

```
app/lib/garden/species.ts     # mapeo nivel ↔ especie + metadatos
app/lib/garden/progress.ts    # fórmula score/progreso
app/lib/garden/unlock.ts      # puertas árbol/zona
app/lib/garden/index.ts       # re-exports
tests/garden/progress.test.ts # vitest
tests/garden/unlock.test.ts
```

(Confirmar dónde viven los tests existentes — si el repo usa otra carpeta
p. ej. `app/lib/**/*.test.ts`, seguir esa convención; hay `vitest.config.ts`.)

Pasos:

- [ ] 1.1 `species.ts`:

```ts
import type { TreeSpecies } from '~/components/garden/PixelTree.vue'
import type { TopikLevel } from '~/lib/domain'

export const SPECIES_BY_LEVEL: Record<TopikLevel, TreeSpecies> = {
  1: 'cherry', 2: 'magnolia', 3: 'zelkova',
  4: 'mugunghwa', 5: 'maple', 6: 'ginkgo',
}
export const SPECIES_KO: Record<TreeSpecies, string> = {
  cherry: '벚꽃', magnolia: '목련', zelkova: '느티나무',
  mugunghwa: '무궁화', maple: '단풍나무', ginkgo: '은행나무',
}
/** sprite de partícula para la celebración/clima de cada especie */
export const SPECIES_PARTICLE: Record<TreeSpecies, string> = {
  cherry: '/img/tree/particles/petal_pink.png',
  magnolia: '/img/tree/particles/petal_pink.png',
  zelkova: '/img/tree/particles/leaf_gold.png',
  mugunghwa: '/img/tree/particles/petal_pink.png',
  maple: '/img/tree/particles/leaf_red.png',
  ginkgo: '/img/tree/particles/leaf_gold.png',
}
```

- [ ] 1.2 `progress.ts` — fórmula de la spec §4.1. Firma pura: recibe los
  ítems y un lookup de estado SRS, no toca stores:

```ts
import type { SrsState } from '~/lib/domain'

export function itemScore(state: SrsState | undefined): number {
  if (!state) return 0
  if (state.mastery === 'tree') return 1
  if (state.mastery === 'plant') return 0.5
  const practiced = state.easyCount + state.hardCount > 0 || state.lastSeen !== null
  return practiced ? 0.1 : 0
}

export function progressPct(kos: string[], lookup: (ko: string) => SrsState | undefined): number {
  if (kos.length === 0) return 0
  const sum = kos.reduce((acc, ko) => acc + itemScore(lookup(ko)), 0)
  return Math.round((sum / kos.length) * 100)
}
```

- [ ] 1.3 `unlock.ts`:

```ts
export const TREE_GATE_PCT = 60   // progreso del nivel N-1 para plantar el árbol N
export const ZONE_GATE_PCT = 50   // progreso del theme i-1 para abrir el theme i

export function isTreeUnlocked(level: number, progressOf: (lvl: number) => number): boolean {
  return level <= 1 || progressOf(level - 1) >= TREE_GATE_PCT
}
export function unlockedZoneCount(themeProgresses: number[]): number {
  let open = 1
  for (let i = 0; i < themeProgresses.length - 1; i++) {
    if (themeProgresses[i] >= ZONE_GATE_PCT) open = i + 2
    else break
  }
  return Math.min(open, themeProgresses.length)
}
```

- [ ] 1.4 Tests vitest: `itemScore` (4 casos), `progressPct` (vacío, mixto,
  redondeo), `isTreeUnlocked` (nivel 1 siempre, puerta 59/60), 
  `unlockedZoneCount` (cadena rota a mitad, todo abierto, lista de 1).
- [ ] 1.5 `pnpm vitest run` en verde.

Hecho cuando: lógica completa sin imports de Vue/stores y tests pasando.

---

## Fase 2 — Composable `useGardenState()`

Objetivo: un único composable reactivo que alimenta TODO el jardín.

Archivo: `app/composables/useGardenState.ts`

- [ ] 2.1 Implementar (esqueleto):

```ts
import { SPECIES_BY_LEVEL } from '~/lib/garden/species'
import { progressPct } from '~/lib/garden/progress'
import { isTreeUnlocked, unlockedZoneCount } from '~/lib/garden/unlock'
import { TREE_THRESHOLDS } from '~/components/garden/PixelTree.vue'

export function useGardenState() {
  const srs = useSrsStore()
  const log = useLogStore()
  const spine = useTopikSpine()

  const lookup = (ko: string) => srs.states[ko]  // ⚠ confirmar API real del store
  const levelProgress = computed(() =>
    ([1, 2, 3, 4, 5, 6] as const).map(lvl => ({
      level: lvl,
      species: SPECIES_BY_LEVEL[lvl],
      pct: progressPct(spine.itemsByLevel(lvl).map(i => i.ko), lookup),
    })),
  )
  const unlocked = computed(() =>
    levelProgress.value.map(l =>
      isTreeUnlocked(l.level, lvl => levelProgress.value[lvl - 1]?.pct ?? 0)),
  )
  // nivel activo: pref de UI en localStorage, capada al máximo desbloqueado
  const activeLevel = useState<number>('garden.activeLevel', () => 1)
  // … init desde localStorage en onMounted, setter que persiste

  const pendingReviews = computed(() =>
    log.entries.filter(e =>
      e.reviewState === 'unreviewed' && (e.feedback === 'hard' || e.errorNote)).length)

  const zoneState = computed(() => { /* themesOfLevel(active) + progressPct por theme + unlockedZoneCount */ })

  return { levelProgress, unlocked, activeLevel, pendingReviews, zoneState, thresholds: TREE_THRESHOLDS }
}
```

- [ ] 2.2 ⚠ Puntos a confirmar leyendo el código real (pueden diferir del
  esqueleto): forma exacta de leer estados en `useSrsStore` (¿`states`,
  `ensure(ko)`, getter?), shape de `itemsByLevel()` (¿devuelve `{ko}`?),
  shape de `entries` en `useLogStore`, y si los stores cargan lazy (llamar a
  su `init/fetch` si la home puede montarse antes de que haya datos).
- [ ] 2.3 SSR-safe: acceso a localStorage solo en cliente (`import.meta.server` guard).

Hecho cuando: en una página de prueba, `levelProgress` refleja el SRS real y
cambia al practicar (probar con datos locales de invitado).

---

## Fase 3 — Home v1: héroe + HUD + estaciones

Objetivo: reemplazar el placeholder de `app/pages/index.vue` por el escenario.

Archivos:

```
app/pages/index.vue                       # reescritura
app/components/garden/GardenStage.vue     # la "ventana": cielo + suelo + slots
app/components/garden/GardenHud.vue       # nivel, barra, %, estado, CTA
i18n/locales/en.json, es.json             # claves nuevas
```

- [ ] 3.1 `GardenStage.vue`: panel con marco v5 (`--paper-warm`, borde 2px
  `--ink-line`), interior con cielo por progreso (spec §5.1: 4 colores +
  banda de suelo, `transition: background 1.5s`). Prop `pct`. Slot default
  (árbol), slot `overlay` (nodos/cofre/Bomi), slot `weather`.
- [ ] 3.2 `index.vue`: `useGardenState()` + `<GardenStage>` +
  `<PixelTree :species :progress :scale>` centrado. Scale responsivo
  ENTERO: `const scale = computed(() => width < 480 ? 2 : 3)` usando un
  `useElementSize`/listener — nunca fraccional.
- [ ] 3.3 `GardenHud.vue`: fila retro con tokens (nivel + especie KO,
  barra `--gold` sobre `--paper`, % y estado `garden.state.*`, botón CTA
  `garden.practice_cta` → `navigateTo('/practice')`). Texto siempre vía `t()`.
- [ ] 3.4 Bomi en el overlay: `pose="idle"`, posicionada arriba-derecha del
  árbol (estático en esta fase; el anclaje a nodos llega en Fase 4).
- [ ] 3.5 Botón `garden.grove_open` en la cabecera (deshabilitado o oculto
  hasta Fase 5).
- [ ] 3.6 Claves i18n (añadir a `en.json` y `es.json`; el resto de idiomas
  hace fallback a `en`):

| Clave | en | es |
| --- | --- | --- |
| `garden.level` | `Level {n}` | `Nivel {n}` |
| `garden.state.dormant` | `Dormant (winter)` | `Seco (invierno)` |
| `garden.state.sprouting` | `Sprouting` | `Brotando` |
| `garden.state.leafy` | `Leafy` | `Frondoso` |
| `garden.state.bloom` | `In full bloom` | `En plena floración` |
| `garden.practice_cta` | `Practice this level` | `Practicar este nivel` |
| `garden.grove_open` | `View garden` | `Ver jardín` |
| `garden.grove_back` | `Back to my tree` | `Volver a mi árbol` |
| `garden.diary_chest` | `Practice diary` | `Diario de práctica` |
| `garden.diary_pending` | `{n} to review` | `{n} por revisar` |
| `garden.tree_locked` | `Reach {pct}% in level {n} to plant this tree` | `Llega al {pct}% del nivel {n} para plantar este árbol` |
| `garden.zone_locked` | `Complete "{zone}" first` | `Completa antes «{zone}»` |
| `garden.unlock.sprout` | `Your {tree} is sprouting!` | `¡Tu {tree} está brotando!` |
| `garden.unlock.leafy` | `Your {tree} is getting leafy!` | `¡Tu {tree} se está poniendo frondoso!` |
| `garden.unlock.bloom` | `Your {tree} is in full bloom!` | `¡Tu {tree} está en plena floración!` |
| `garden.unlock.tree` | `A new tree awaits: {tree}!` | `¡Un árbol nuevo te espera: {tree}!` |
| `garden.weather.rain_hint` | `Review your tricky sentences to clear the sky` | `Revisa tus oraciones difíciles para despejar el cielo` |
| `garden.species.cherry` | `Cherry blossom` | `Cerezo` |
| `garden.species.magnolia` | `Magnolia` | `Magnolia` |
| `garden.species.zelkova` | `Village zelkova` | `Zelkova de aldea` |
| `garden.species.mugunghwa` | `Rose of Sharon` | `Mugunghwa` |
| `garden.species.maple` | `Autumn maple` | `Arce otoñal` |
| `garden.species.ginkgo` | `Golden ginkgo` | `Ginkgo dorado` |

- [ ] 3.7 QA de fase: light/dark, móvil 360px, invitado sin datos (árbol seco,
  0%), usuario con práctica previa (capas correctas), cambiar de idioma.

Hecho cuando: la home enseña el árbol real del nivel activo y el HUD vive
de datos reales.

---

## Fase 4 — Zonas interactivas sobre las ramas

Archivos:

```
app/components/garden/TreeZones.vue   # nodos overlay
app/components/garden/tree-zones.ts   # anclas % por especie
```

- [ ] 4.1 `tree-zones.ts`: anclas por especie (top/left % sobre el lienzo
  128×160). Valores iniciales estimados (calibrar en 4.2):

```ts
import type { TreeSpecies } from '~/components/garden/PixelTree.vue'

/** anclas de nodos de zona, de la rama más baja (zona 1) a la más alta */
export const ZONE_ANCHORS: Record<TreeSpecies, Array<{ top: string; left: string }>> = {
  cherry:    [{ top: '52%', left: '28%' }, { top: '40%', left: '68%' }, { top: '26%', left: '42%' }],
  magnolia:  [{ top: '54%', left: '30%' }, { top: '38%', left: '64%' }, { top: '24%', left: '44%' }],
  zelkova:   [{ top: '50%', left: '24%' }, { top: '42%', left: '72%' }, { top: '28%', left: '48%' }, { top: '20%', left: '32%' }],
  mugunghwa: [{ top: '56%', left: '24%' }, { top: '48%', left: '74%' }, { top: '30%', left: '48%' }],
  maple:     [{ top: '52%', left: '26%' }, { top: '40%', left: '70%' }, { top: '24%', left: '46%' }],
  ginkgo:    [{ top: '58%', left: '34%' }, { top: '42%', left: '62%' }, { top: '26%', left: '46%' }, { top: '14%', left: '50%' }],
}
```

- [ ] 4.2 Calibrar anclas con el preview: añadir TEMPORALMENTE a
  `tools/pixel-trees/preview.html` (y quitar al acabar, o dejar tras flag):

```js
stage.addEventListener('click', (e) => {
  const r = stage.getBoundingClientRect()
  console.log(`{ top: '${Math.round(((e.clientY - r.top) / r.height) * 100)}%', left: '${Math.round(((e.clientX - r.left) / r.width) * 100)}%' }`)
})
```

  Clic sobre cada rama de cada especie → pegar coordenadas en `tree-zones.ts`.
- [ ] 4.3 `TreeZones.vue`: recibe `species`, `zones` (del composable:
  nombre, pct, unlocked). Render: `<button>` absolutos en las anclas, estilo
  pixel v5 (cuadrado, borde 2px, sombra dura), candado pixel si bloqueado
  (`filter: grayscale`), tooltip con nombre + % o requisito. `aria-label`
  completo. Si hay más themes que anclas: meter los sobrantes en el último
  nodo con etiqueta `+N`.
- [ ] 4.4 Navegación: zona desbloqueada → biblioteca filtrada. ⚠ Revisar
  `app/pages/library.vue`: si no acepta query (`?level=N&theme=X`), añadir
  soporte de query params para preseleccionar filtro (subtarea pequeña, no
  rediseñar la biblioteca). Zona bloqueada → tooltip `garden.zone_locked` +
  Bomi `thinking` 2s.
- [ ] 4.5 Cofre del diario junto a las raíces (sprite pixel 16×16 — generarlo
  con el pipeline o dibujarlo; NO emoji). Badge `pendingReviews`. Clic → `/log`.
- [ ] 4.6 Bomi ancla sobre el último nodo desbloqueado (posición = ancla del
  nodo con offset -28px vertical).
- [ ] 4.7 QA: teclado (tab por nodos), táctil ≥44px, tooltips en ambos temas,
  niveles con nº de themes ≠ nº de anclas.

Hecho cuando: se puede navegar del árbol a la biblioteca filtrada y el
bloqueo en cadena se percibe.

---

## Fase 5 — Vista jardín (los 6 árboles)

Archivo: `app/components/garden/GardenGrove.vue`

- [ ] 5.1 Toggle en `index.vue` entre héroe y jardín (estado local + botones
  `garden.grove_open`/`garden.grove_back`; transición fade corta).
- [ ] 5.2 Grid responsivo (desktop 3×2, móvil strip horizontal con
  scroll-snap) de tarjetas: `PixelTree scale=2` con su progreso real +
  nombre KO + `garden.species.*` + `garden.level` + %.
- [ ] 5.3 Bloqueados: `grayscale(1) brightness(.8)` + candado + tooltip
  `garden.tree_locked` (con `pct: TREE_GATE_PCT` y nivel anterior).
- [ ] 5.4 Tap/clic en desbloqueado → `activeLevel = nivel` y volver al héroe.
- [ ] 5.5 QA: 6 árboles con datos reales, rendimiento (30 PNG pequeños — ok),
  móvil con scroll-snap.

Hecho cuando: el jardín es el mapa global y elegir árbol cambia el héroe.

---

## Fase 6 — Clima + partículas ambientales

Archivo: `app/components/garden/WeatherLayer.vue`

- [ ] 6.1 Partículas CSS (divs absolutos, `animation: fall Xs linear infinite`
  con delays/`left` aleatorios al montar — generados en `onMounted`, no en
  template, para SSR estable). Tipos: `snow` (px blancos 3×3), `rain`
  (1×4 azulados, caída rápida), `petal/leaf` (sprite `SPECIES_PARTICLE`
  8×8 `image-rendering: pixelated`).
- [ ] 6.2 Selección por estado (spec §5.3): invierno→nieve; `pendingReviews
  ≥5`→lluvia + cielo un paso más frío (prop a `GardenStage`); 1–4→overlay
  niebla (`rgba` translúcido); 0 y pct≥80→pétalos/hojas de la especie.
- [ ] 6.3 Hint `garden.weather.rain_hint` bajo el HUD cuando llueve, enlazando
  a `/log`.
- [ ] 6.4 `prefers-reduced-motion`: render estático (sin animación, opacidad
  fija) o nada.
- [ ] 6.5 QA: forzar estados editando log local de invitado; revisar CPU
  (≤20 partículas, solo `transform/opacity`).

---

## Fase 7 — Celebración de desbloqueo

Archivo: `app/components/garden/UnlockCelebration.vue` (+ lógica en composable)

- [ ] 7.1 En `useGardenState`, derivar hitos alcanzados:
  `"${level}:${sprout|leafy|bloom}"` para cada umbral cruzado del nivel, y
  `"tree:${level}"` por árbol desbloqueado.
- [ ] 7.2 Persistir vistos en localStorage `garden.milestonesSeen` (JSON
  array). Pendientes = alcanzados − vistos. Al montar la home, si hay
  pendientes: disparar celebración del más alto y marcar TODOS como vistos.
- [ ] 7.3 Celebración: ráfaga de 10–16 sprites de `SPECIES_PARTICLE` desde el
  centro de copa (animación CSS one-shot ~1.2s), Bomi `cheer` 3s, toast con
  `garden.unlock.*` (usar el sistema de Toast existente — buscar cómo lo
  lanza la app; hay Toast en el layout).
- [ ] 7.4 `prefers-reduced-motion`: solo toast.
- [ ] 7.5 QA: cruzar 10% practicando de verdad; recargar y verificar que no
  se repite; cruzar dos umbrales seguidos (celebra una vez, el más alto).

---

## Fase 8 — Sidebar plegable

- [ ] 8.1 `AppShell.vue`: estado `collapsed` (localStorage
  `ui.sidebarCollapsed`), grid `220px → 0px` con transición de
  `grid-template-columns`; el contenido del sidebar con `overflow: hidden`.
- [ ] 8.2 Botón chevron pixel en el borde (siempre visible, `aria-expanded`),
  estilo v5. Móvil: sin cambios (MobileNavbar).
- [ ] 8.3 QA: foco/teclado, persistencia entre recargas, sin saltos de layout
  en la transición, todas las páginas (no solo la home).

---

## Fase 9 — QA integral y cierre

- [ ] 9.1 Recorrer los criterios de aceptación de la spec §9 uno a uno.
- [ ] 9.2 Matriz: {light, dark} × {desktop, 360px} × {invitado, logueado} ×
  {reduced-motion on}.
- [ ] 9.3 i18n: cambiar a `es` y a un idioma sin traducir (fallback limpio a en).
- [ ] 9.4 `pnpm vitest run`, lint/prettier del repo.
- [ ] 9.5 Revisar que no quedó texto hardcodeado ni emojis en el escenario.
- [ ] 9.6 Actualizar `docs/superpowers/specs/...-garden-tree-dashboard.md` si
  la implementación divergió (mantener la spec como fuente de verdad).

---

## Riesgos y decisiones abiertas (resolver al implementar)

1. **API exacta de los stores** (`useSrsStore`/`useLogStore`/`useTopikSpine`):
   los esqueletos de la Fase 2 usan nombres plausibles — confirmar contra el
   código real antes de escribir el composable (rutas en la spec §4).
2. **Filtro de la biblioteca por query**: puede no existir; es subtarea de la
   Fase 4.4 (mantenerla mínima).
3. **Posiciones de nodos**: estimadas; calibrar con el helper (4.2). Si una
   especie cambia de silueta al regenerar assets, recalibrar sus anclas.
4. **Carga de stores**: si la home puede montar antes de que los stores
   inicialicen, mostrar el esqueleto (árbol seco) sin parpadeo y dejar que la
   reactividad lo haga crecer — aceptable; evitar spinners.
5. **Themes con `LocalizedString`**: si el spine trae nombres localizados,
   pasar por `localized()` (`app/lib/domain/i18n.ts`); si son strings planos,
   mostrarlos tal cual.

## Apéndice A — Regenerar / retocar árboles

```
python tools/pixel-trees/generate_trees.py
```

Revisión: `tools/pixel-trees/out/contact_sheet.png` (estados × especies) y
`out/lineup.png` (los 6 plenos, light/dark). Preview interactivo:
`tools/pixel-trees/preview.html`. Tuning por especie en el dict `SPECIES` del
generador (seed, tronco, forma de copa, paletas, firmas: `carpet`, `rope`,
`flower_sprite`, `ember`, `floats`, `motes`). Regla: si se añade una especie,
su `bloom_full` debe igualar o superar el "wow" de su nivel vecino.

## Apéndice B — Sprites UI pendientes de crear (Fase 4)

- `chest_16.png` (cofre del diario, 16×16, 2 frames: cerrado/abierto opcional)
- `lock_8.png` (candado para nodos/árboles bloqueados, 8×8)

Generarlos con un script corto en `tools/pixel-trees/` (mismo estilo: outline
`#201510`, paleta madera/oro v5) o a mano; guardarlos en
`munbeop/public/img/tree/ui/`. Prohibido sustituirlos por emoji.

## Orden sugerido de sesiones

| Sesión | Fases | Resultado visible |
| --- | --- | --- |
| A | 1 + 2 + 3 | El árbol real vive en la home |
| B | 4 + 5 | Zonas navegables + vista jardín |
| C | 6 + 7 | Clima + celebraciones |
| D | 8 + 9 | Sidebar plegable + QA final |
