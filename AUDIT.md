# Auditoría del legacy `index.html` — Munbeop Garden v2.22

**Objetivo:** decidir qué se rescata del prototipo monolítico actual antes de empezar la nueva arquitectura limpia (Nuxt 3 + Supabase + Capacitor + pixel art).

---

## 0. TL;DR

| Métrica | Valor |
|---|---|
| Archivo único | `index.html` |
| Líneas totales | **5 505** |
| CSS inline | ~2 650 líneas (48 %) |
| JS inline | ~2 487 líneas (45 %) |
| HTML body | ~285 líneas (5 %) |
| `<head>` + meta | ~70 líneas (1 %) |
| Globals mutables JS | **20+** sin encapsulación |
| Dependencias externas | 0 (vanilla JS + Google Fonts) |
| Backend | **Ninguno** — solo `localStorage` |
| Tests | 0 |
| Build step | Ninguno |

**Veredicto:** el legacy NO es un buen punto de partida arquitectónico. Es un God File clásico — todo inline, estado global mutado por todos lados, `innerHTML` con strings, sin tipos, sin tests, sin backend. Pero contiene **conceptos de UX, algoritmos de SRS y datos semilla** que sí merecen migrar a la nueva app.

**Recomendación: rewrite total**, no refactor. Portamos solo (1) los datos semilla, (2) el algoritmo de SRS/mastery, (3) la forma del backup JSON (para migrar usuarios existentes).

---

## 1. Mapa del archivo

| Líneas | Sección | Notas |
|---|---|---|
| 1-70 | `<head>` + meta PWA | iOS splash screens (8 resoluciones), manifest, theme-color, fonts Google |
| 7-37 | CSS crítico inline pre-render | pintar dark inmediato para evitar flash |
| 71-2727 | CSS principal | Sistema de tokens (CSS vars), animaciones keyframe, ~30 componentes |
| 2728-3013 | HTML body | Splash, tabs, panel ruleta, tab stats, tab log, tab manage, 7 modales, toast |
| 3015-3031 | `DEFAULT_GRAMMAR` | **14 gramáticas semilla** — TOPIK I básico |
| 3033 | `COLORS` | Array huérfano, no usado en ninguna parte (cleanup pendiente) |
| 3043-3052 | `DEFAULT_CONTEXTS` | **8 contextos built-in** (반말/존댓말/격식체/친구/드라마/직장/SNS/어른) |
| 3055-3064 | `DECK_COLORS` | Paleta de 8 colores para decks |
| 3035-3040 | Claves localStorage | `ruleta_v2_*` (inconsistencia naming vs `munbeop-garden`) |
| 3078-3086 | Estado global | 11 `let` mutables a nivel de módulo |
| 3089-3110 | Helpers de contexto | `getAllContexts`, `getActiveContexts`, `pickRandomContexts` |
| 3112-3179 | **Motor SRS** | `ensureSrs`, `recalculateMastery`, `getMasteryInfo`, `getWeight`, `weightedPick` |
| 3205-3292 | `drawWheel()` | Renderiza ruleta SVG con sectores por gramática + color por deck |
| 3294-3366 | `spin()` | Mecánica central: selecciona 3 gramáticas + 3 contextos × 3 |
| 3368-3575 | `renderResults`, `persistEntry`, listeners de cards | Loop 3×3 con avance entre contextos |
| 3577-3630 | `checkAllCompleted`, `resetResultArea` | Banner de cierre de sesión + reset |
| 3632-3656 | Métricas de tiempo | días activos / oraciones por semana (semana = lunes) |
| 3658-3785 | Renderizado y CRUD de contextos | Toggle activo, custom contexts, modal |
| 3787-3830 | Filtros de deck en ruleta | Pills + `excludedDeckIds` |
| 3832-4045 | Stats grid + Collection | 4 cards de stats + colección por mastery (tree/plant/almost) |
| 4047-4240 | Renderizado del Log | Filtros (all/hard/easy + dropdown grammar + dropdown context) + sistema de revisión ✓/✗ + notas |
| 4242-4661 | Sistema de Decks + modales | CRUD completo, mover entre decks, exportar plantilla |
| 4663-5167 | Export (MD/PDF) + Import (backup completo / plantillas de deck) | window.print con HTML embebido para PDF |
| 5169-5263 | Import handler | Detecta backup completo vs plantilla de deck |
| 5266-5402 | Helpers globales | `escapeHtml`, `toast`, `updateSpinStats`, tab switcher, etc. |
| 5404-5462 | `init()` IIFE | Migraciones de schema baked-in (v2.4 deck, v2.16 reviewState) |
| 5464-5501 | Service Worker registration | Auto-update agresivo |

---

## 2. Inventario de **datos** (qué portar tal cual)

| Recurso | Cantidad | Decisión | Destino en nueva arch |
|---|---|---|---|
| `DEFAULT_GRAMMAR` | 14 puntos TOPIK I | **PORTAR** + ampliar masivamente | Tabla `grammars` en Supabase (esquema spec sección 4) |
| `DEFAULT_CONTEXTS` | 8 contextos (formalidad + situacional) | **PORTAR** | Tabla `contexts` (nueva, no estaba en spec — sugerencia: añadir) |
| `DECK_COLORS` | 8 colores | **PORTAR** | Constante UI, no DB |
| `COLORS` | 8 colores huérfanos | **TIRAR** | Dead code |
| Backup JSON shape | `{grammar, srs, log, decks, customContexts, inactiveContextIds, schemaVersion}` | **PORTAR como importer** | Edge Function "import legacy backup" para migrar usuarios v2.22 → v3 |

---

## 3. Inventario de **lógica de negocio** (qué portar como código limpio)

| Función / concepto | Líneas | Valor | Decisión |
|---|---|---|---|
| `ensureSrs(ko)` | 3112-3117 | Lazy-init SRS por gramática | **PORTAR** a `useSrs.ts` composable |
| `recalculateMastery(ko)` | 3121-3157 | Recompone mastery desde el log; las ❌ NO suman | **PORTAR** — lógica delicada, ya está probada en la práctica |
| `getMasteryInfo(ko)` | 3159-3167 | Mapeo mastery → emoji/label/cls | **PORTAR** — pero el emoji será un sprite pixel art en v3 |
| `getWeight(ko)` | 3169-3179 | `mastery_base * time_factor * hard_bonus` — fórmula SRS | **PORTAR íntegramente** — es el corazón del weighted pick |
| `weightedPick(pool, n)` | 3187-3203 | Muestreo ponderado sin reemplazo | **PORTAR** — algoritmo correcto |
| `daysSinceSeen(ko)` | 3181-3185 | Helper de tiempo | **PORTAR** |
| `pickRandomContexts(n)` | 3101-3110 | Random sin repetición | **PORTAR** |
| Umbrales mastery seedling → plant → tree | 3141-3145 + 3493-3499 | `≥20 reviews ∧ easy≥hard×1.5` → plant; `≥60 ∧ easy≥hard×2.5` → tree | **PORTAR como constantes** en `srs/thresholds.ts` |
| Loop 3×3 (3 gramáticas × 3 contextos) | `spin()` + `applyContextToCard` | Estructura de sesión | **PORTAR como modelo de dominio** — encaja con la "Mazmorra" del nuevo spec (cambia la presentación, no la mecánica) |
| `persistEntry` (3471-3550) | Lógica de transición mastery + log + auto-incorrect si hard+nota | **PORTAR** pero reescribir como servicio con tipos |
| `calcSentencesThisWeek` / `calcActiveDaysLast30` | 3632-3656 | Stats temporales | **PORTAR** |
| Export MD + PDF | 4744-4994 | Template generator | **PORTAR** — buena UX, plantillas a `lib/export/` |
| Import (backup + deck template) | 5169-5263 | Detección dual + migración | **PORTAR como Edge Function** para v2 → v3 |
| `drawWheel()` SVG | 3205-3292 | Render ruleta | **TIRAR** — la nueva app usa "Mazmorra" como modo estrella; la ruleta puede volver como modo clásico pero con renderer pixel art (Canvas, no SVG) |
| Migraciones inline en `init()` | 5414-5447 | v2.4 decks, v2.16 reviewState | **TIRAR** — la nueva DB nace limpia |
| Service Worker auto-update | 5464-5501 | PWA refresh | **PORTAR** pero adaptado al PWA de Nuxt 3 |

---

## 4. Inventario de **UI/UX** (qué conceptos mantener)

| Patrón | Decisión | Razón |
|---|---|---|
| **Sistema de tokens CSS** (`--paper`, `--ink`, `--jade`...) | **REEMPLAZAR** | El spec exige pixel art retro, paleta distinta. Pero la **estructura de design tokens** vale. |
| 3 niveles mastery 🌱🌿🌳 | **MANTENER concepto** | Encaja con la metáfora del Jardín. Visualmente serán sprites animados de plantas creciendo. |
| Estado de revisión ✓/✗/unreviewed + nota de error | **MANTENER tal cual** | UX probada, valor pedagógico real |
| Tabs (Práctica/Stats/Diario/Gestionar) | **EVOLUCIONAR** a sidebar fijo (desktop) + bottom nav (móvil) | Spec sección 3.1 |
| Decks (agrupar gramáticas por colección con color) | **MANTENER tal cual** | Buen concepto, se traduce 1:1 a la app nueva |
| Contextos (built-in + custom + toggle inactivo) | **MANTENER tal cual** | Núcleo del valor pedagógico |
| Modales overlay con backdrop-filter | **EVOLUCIONAR** | Reemplazar por Radix/Shadcn con bordes pixelados |
| Toast inferior | **MANTENER** | Patrón simple, útil |
| Export modal con filtros + preview count | **MANTENER tal cual** | UX excelente |
| Stats grid 4-card + mastery breakdown | **MANTENER** + ampliar | Spec sección 3.1.4 pide gráficos pixelados — añadir Recharts/visx con tema retro |
| Collection agrupada por mastery con expand/collapse | **MANTENER** | Buen patrón de progreso visible |
| Log con triple filtro | **MANTENER** | UX sólida |
| Splash con `font-weight` animado de 300→900 | **TIRAR** | Reemplazar por intro pixel art de la Jardinera Sabia |
| Ruleta SVG | **TIRAR** como pantalla principal; opcional como "modo clásico" | El spec promueve Mazmorra como modo estrella |
| Botones con `letter-spacing: 0.1em` + uppercase mono | **TIRAR** | Estética "Chess.com dark" — incompatible con pixel art |

---

## 5. Anti-patrones / síntomas de God File

1. **Single-file 5 505 LOC** — todo HTML/CSS/JS inline en `index.html`.
2. **20+ globals mutables** (`grammar`, `srs`, `log`, `decks`, `customContexts`, `inactiveContextIds`, `excludedDeckIds`, `currentPicks`, `rotation`, `spinning`, `logFilter`, `logGrammarFilter`, `logContextFilter`, `editingDeckId`, `addingToDeckId`, `selectedColorId`, `deletingDeckId`, `deleteAction`, `deckActionsCurrentId`, `exportSelectedFormat`, `collectionExpanded`...) — sin encapsulación, mutados por listeners en cualquier lugar.
3. **`innerHTML` con strings interpolados** en todos los renders — XSS mitigado solo por `escapeHtml()` manual; un olvido y se rompe.
4. **Sin tipos**: vanilla JS. Bugs silenciosos garantizados (`entry.reviewState` typo → fallo silencioso en mastery).
5. **Triple versión incoherente**: footer dice `v2.22`, export dice `__version: '2.19'`, `schemaVersion: 2.7`.
6. **Naming dividido**: localStorage prefix `ruleta_v2_*` (heredado de cuando el proyecto se llamaba "ruleta"), pero el app ya se llama `munbeop-garden`. Marca tecnológica del rebranding incompleto.
7. **Animaciones via `setTimeout` + `requestAnimationFrame`** con reflows forzados (`void body.offsetHeight`) — frágil; cualquier cambio de duración CSS rompe la JS.
8. **Modales con globals colidentes** (`editingDeckId`, `addingToDeckId`, `deletingDeckId`, `deckActionsCurrentId`) — fácil colgar uno abierto sobre otro.
9. **PDF export con tema CLARO embebido** — incoherente con el resto dark; HTML+CSS hardcoded de 200+ líneas dentro del JS.
10. **Migraciones de schema baked in `init()`** — cada release acumula condicionales históricos.
11. **Sin backend** — el spec entero (IA validadora, sync entre dispositivos, leaderboards, cosméticos comprables) es **imposible** con la arquitectura actual.
12. **Sin AI validation** — el USP del spec ("desafíos contextuales reales validados por IA en tiempo real") tiene **CERO presencia** en el legacy. Los botones easy/hard son auto-reportados.
13. **Sin gamification narrativa** — no hay XP, mascota, cosméticos, novela visual, mazmorra, timer. El spec las pone en el centro y el legacy no tiene NADA de eso.
14. **Sin tests**, sin lint, sin formatter, sin build, sin CI.

---

## 6. Lo que ya **funciona bien** y debe respetarse en la migración

- El loop 3 gramáticas × 3 contextos × 1 oración (9 oraciones por sesión) — buen tamaño cognitivo.
- La distinción **easy/hard** + **revisión posterior ✓/✗ + nota** — capa pedagógica única que pocas apps de idiomas tienen.
- La fórmula de weight (mastery + tiempo + ratio hard/easy) — produce un orden de prioridad sensato.
- Los **contextos** (formalidad + situación) — son el diferenciador real frente a Duolingo/Anki. Indispensables en la nueva app.
- El sistema de **decks por color con expandible** — UX cuidada, traducción directa.
- Export MD + PDF con filtros — feature single útil para compartir con profesores/tutores.

---

## 7. Migración de usuarios existentes (v2.22 → v3)

Hay usuarios reales con datos en `localStorage` bajo claves `ruleta_v2_*`. El backup JSON (export completo) tiene este shape:

```json
{
  "__app": "문법Garden",
  "__version": "2.19",
  "__exportedAt": "2026-..",
  "schemaVersion": 2.7,
  "grammar": [{ ko, meaning, example?, trans?, deckId }],
  "srs":     { "<ko>": { lastSeen, easyCount, hardCount, mastery } },
  "log":     [{ id, ko, sentence, feedback, errorNote?, reviewState, contextId, contextName, date }],
  "decks":   [{ id, name, colorId, order, collapsed }],
  "customContexts": [{ id, name, scene, category, builtin: false }],
  "inactiveContextIds": ["<id>", ...]
}
```

**Plan:** Edge Function `POST /api/legacy/import` que recibe este JSON, valida shape, mapea a tablas v3 (`grammars`, `user_progress`, `user_cosmetics` + nuevas `user_contexts`, `user_log`), genera un report y lo devuelve al usuario. Botón **"Importar mi 문법Garden v2"** en onboarding.

---

## 8. Lo que el nuevo spec exige y el legacy **no tiene**

(Trabajo greenfield obligatorio — no portable.)

- IA validadora (OpenAI / Anthropic via Edge Function)
- Supabase Auth + Postgres + Storage
- Sync multi-dispositivo
- Estética pixel art (sprites, image-rendering: pixelated, tipografías retro)
- **Modo Mazmorra**: novela visual + puerta + cronómetro + 3 intentos + sistema XP/recompensas
- Mascota "Jardinera Sabia" con spritesheets de emociones
- Inventario de cosméticos (gorros, listones, etc.)
- Mapa 2D "Mi Jardín" (Stardew Valley-style) por zonas TOPIK
- Landing page con parallax + simulador GBA interactivo
- BGM/SFX (Howler.js)
- Compilación nativa móvil (Capacitor)
- Estructura modular (Capa Vista / Composables / Servicios) con regla de 200 LOC por componente
- Tests, lint, build, CI

---

## 9. Veredicto final

**Tirar la arquitectura. Conservar datos, algoritmos y conceptos de UX.**

### Lo que se porta (poco volumen, mucho valor):

1. `DEFAULT_GRAMMAR` (14 puntos) → seed inicial de tabla `grammars`
2. `DEFAULT_CONTEXTS` (8 contextos) → seed inicial de tabla `contexts`
3. Algoritmo SRS completo (`getWeight`, `weightedPick`, `recalculateMastery`, umbrales mastery) → módulo `lib/srs/`
4. Shape del backup JSON → schema del importer legacy
5. Conceptos UX (3 mastery levels, review state, error notes, decks, contextos, export MD/PDF, stats temporales, log filtrable) → especificación funcional para los nuevos composables/componentes

### Lo que se reescribe desde cero (mucho volumen, alta calidad):

- TODO el CSS (cambia paleta, tipografía, render mode → pixel art)
- TODO el HTML (sin tabs, con sidebar/navbar; con mazmorra como modo principal)
- TODO el JS (Nuxt 3 + TypeScript + composables, ya no globals)
- Backend completo (no existía)
- Auth, sync, IA, gamification narrativa, mascota, mapa, landing

### Próximo paso recomendado

Pasar a **fase de planificación** invocando la skill `superpowers:writing-plans` para producir un `IMPLEMENTATION_PLAN.md` que describa por hitos:

1. Bootstrap Nuxt 3 + Tailwind + TS + Tooling (lint/format/test/CI)
2. Esquema Supabase + Auth + RLS
3. Módulo `lib/srs/` portado del legacy (con tests)
4. Sistema de diseño pixel art (tokens, tipografías, bordes, image-rendering)
5. Composables de dominio (`useGarden`, `useDungeon`, `useGrammar`, `useContexts`)
6. Servicios IA (Edge Function validadora)
7. Landing page
8. Mascota + animaciones
9. Modo Mazmorra (novela visual + timer + 3 intentos)
10. Modo Jardín (mapa por zonas TOPIK)
11. Inventario + cosméticos
12. Importer legacy v2 → v3
13. Capacitor build para iOS/Android

Cada hito con: lista de archivos a crear, dependencias entre hitos, criterios de "done" verificables, y review gates.
