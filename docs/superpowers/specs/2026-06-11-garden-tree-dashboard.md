# Spec — Jardín TOPIK: el árbol como pantalla principal

Fecha: 2026-06-11 · Estado: aprobado por Jhoan (diseños v5 de árboles validados)
Plan de implementación: `docs/superpowers/plans/2026-06-11-garden-tree-dashboard.md`
Idea original del usuario: `C:\Users\jhoan\OneDrive\Desktop\Ideas\idea del arbol.md`

## 1. Visión

La home (`/`, "내 정원 / Mi jardín") deja de ser un placeholder y se convierte en
el corazón de la app: **un árbol pixel art que crece con el progreso real del
estudiante**. Cada nivel TOPIK (1–6) tiene su propio árbol coreano icónico; el
árbol del nivel activo es el héroe de la pantalla y evoluciona de seco →
brotes → frondoso → plena floración. Una vista "jardín" muestra los 6 árboles
como camino completo (los superados floridos, los futuros secos y bloqueados).

El árbol no es decoración: **es el menú**. Sus ramas son zonas de gramática
navegables, sus raíces guardan el diario, y su clima refleja el estado del
estudio (oraciones difíciles sin revisar = niebla/lluvia).

## 2. Lo que YA existe (fase 0 — completada)

| Pieza | Ruta | Notas |
| --- | --- | --- |
| Assets de los 6 árboles (5 capas c/u) | `munbeop/public/img/tree/<especie>/` | alineadas pixel-perfect, lienzo 128×160, ancla (64,148) |
| Sombra y partículas | `munbeop/public/img/tree/ground_shadow.png`, `particles/{petal_pink,leaf_red,leaf_gold}.png` | sprites 8×8 |
| Generador procedural | `tools/pixel-trees/generate_trees.py` | `python tools/pixel-trees/generate_trees.py` regenera todo |
| Componente de árbol por capas | `munbeop/app/components/garden/PixelTree.vue` | props `species/progress/scale/shadow`; exporta `TREE_THRESHOLDS` y `TreeSpecies` |
| Preview standalone | `tools/pixel-trees/preview.html` | doble clic; slider + especies + día/noche |
| Doc del pipeline de assets | `tools/pixel-trees/README.md` | tabla de capas, firmas visuales, tuning |

**No rehacer nada de esto.** Cualquier ajuste visual de árboles se hace en el
generador y se regenera.

## 3. Especies ↔ niveles y firmas visuales

La espectacularidad escala con el nivel (requisito explícito del usuario: cada
desbloqueo debe sentirse un logro).

| Nivel | `TreeSpecies` | Árbol | Firma del estado pleno |
| --- | --- | --- | --- |
| 1 | `cherry` | 벚꽃 cerezo | copa colgante + pétalos a la deriva |
| 2 | `magnolia` | 목련 magnolia | tronco gemelo + flores copa-de-vino |
| 3 | `zelkova` | 느티나무 árbol de aldea | domo gigante + cuerda 금줄 + luciérnagas |
| 4 | `mugunghwa` | 무궁화 flor nacional | corona triple + flores con centro 단심 |
| 5 | `maple` | 단풍나무 arce | degradado de brasas + hojas cayendo + alfombra roja |
| 6 | `ginkgo` | 은행나무 ginkgo | el más alto + alfombra dorada + motas de luz |

## 4. Arquitectura de datos — DECISIÓN CLAVE

**Todo el estado del jardín se DERIVA en cliente. Cero tablas nuevas, cero SQL.**

Razón: los stores ya exponen todo lo necesario vía el storage adapter, y
derivar evita esquema nuevo y migraciones. (Actualización 2026-06-11: las
cuentas son OBLIGATORIAS — el modo invitado se eliminó; `SupabaseAdapter` es
el camino real y `LocalStorageAdapter` queda pendiente de limpieza en una
tarea aparte.) El jardín se calcula desde:

- **Progreso SRS**: `useSrsStore()` (`app/stores/srs.ts`) → mastery por ítem
  (`seedling | plant | tree`, en `app/lib/domain/mastery.ts`).
- **Estructura TOPIK**: `useTopikSpine()` (`app/composables/useTopikSpine.ts`)
  → `itemsByLevel(level)`, `themesOfLevel(level)` desde `app/seed/topik-spine.json`.
- **Clima**: `useLogStore()` (`app/stores/log.ts`) → entradas con
  `reviewState === 'unreviewed'` y (`feedback === 'hard'` o `errorNote`).

Esto reemplaza el esquema PLpgSQL del documento de idea original (era para una
arquitectura server-first que esta app no tiene). Si en el futuro se quieren
rankings/insignias server-side, se podrá materializar una vista SQL — fuera de
alcance v1.

### 4.1 Fórmula de progreso de un nivel (0–100)

```
score(item) = 1.0  si mastery == 'tree'
              0.5  si mastery == 'plant'
              0.1  si mastery == 'seedling' Y fue practicado ≥ 1 vez
              0.0  si nunca practicado
progress(level) = round(100 × Σ score(item ∈ itemsByLevel(level)) / N_items)
```

- Solo cuentan los ítems del spine (catálogo); las gramáticas custom del
  usuario quedan fuera en v1 (anotado como mejora futura).
- El mismo cálculo aplicado a `itemsByTheme(themeId)` da el progreso de una zona.
- Constantes en un solo sitio: `app/lib/garden/progress.ts`.

### 4.2 Umbrales visuales (capas del árbol)

Fuente de verdad: `TREE_THRESHOLDS` exportado por `PixelTree.vue`.

| Umbral | % | Capa que aparece | Estado i18n |
| --- | --- | --- | --- |
| — | 0 | `tree_skeleton` | `garden.state.dormant` |
| `sprout` | 10 | `trunk_alive` + `leaves_layer_1` | `garden.state.sprouting` |
| `leafy` | 40 | `leaves_layer_2` | `garden.state.leafy` |
| `bloom` | 80 | `bloom_full` | `garden.state.bloom` |

### 4.3 Desbloqueo de árboles (entre niveles)

- Árbol 1: siempre desbloqueado.
- Árbol N (N≥2): desbloqueado cuando `progress(N-1) ≥ GATE` con `GATE = 60`.
  (La floración al 80 es la celebración; la puerta al 60 evita un muro duro y
  mantiene el flujo. Constante configurable en `app/lib/garden/unlock.ts`.)
- Árbol bloqueado en la vista jardín: solo `tree_skeleton` + CSS
  `filter: grayscale(1) brightness(.8)` + candado pixel + tooltip
  `garden.tree_locked`.

### 4.4 Zonas dentro de un árbol (ramas interactivas)

- Las zonas de un árbol = los **themes** del nivel (`themesOfLevel(level)`),
  en su orden del spine. No se inventa una taxonomía nueva.
- Regla de cadena v1 (DAG lineal): zona i desbloqueada si
  `progressTheme(i-1) ≥ 50`; la zona 0 siempre abierta. Pura función TS en
  `app/lib/garden/unlock.ts` — testeable con vitest.
- Clic en zona desbloqueada → navegar a la biblioteca filtrada por ese
  nivel/tema. Clic en bloqueada → tooltip `garden.zone_locked` + Bomi pose
  `thinking`.
- Las posiciones (top/left %) de los nodos son **por especie** (cada árbol
  tiene silueta distinta): mapa estático en
  `app/lib/garden/zone-anchors.ts` (en lib/, no components/ — el escáner de
  componentes de Nuxt colisionaría con `TreeZones.vue`). Si un nivel tiene más themes que
  anclas definidas, los sobrantes se agrupan en el último nodo ("y más…").

## 5. UX

### 5.1 Home (`/` — hero del nivel activo)

Composición (desktop, dentro del AppShell normal con sidebar):

```
┌────────────────────────────────────────────┐
│  내 정원 · Mi jardín            [Ver jardín]│  ← BilingualTitle + botón grove
│  ┌──────── escenario (ventana) ─────────┐  │
│  │   cielo de estación (por progreso)   │  │
│  │   partículas clima (nieve/pétalos)   │  │
│  │        PixelTree (scale 3–4)         │  │
│  │   nodos de zona sobre las ramas      │  │
│  │   cofre del diario junto a raíces    │  │
│  │   Bomi flotando sobre el nodo activo │  │
│  └───────────────────────────────────────┘  │
│  HUD retro: [Nivel N · especie] [▓▓▓░ 42%]  │
│             [estado] [Practicar este nivel] │
└────────────────────────────────────────────┘
```

- El **escenario es una "ventana al jardín"**: un panel con cielo propio que NO
  cambia con el tema light/dark de la app (como las imágenes de `welcome`).
  Cielo por progreso del nivel activo: 0–9 invierno `#2c3e50`, 10–39 deshielo
  `#5d6d7e`, 40–79 primavera temprana `#7fb3d5`, 80–100 plena `#aed6f1`.
  Banda de suelo inferior: `#3b4a5a` / `#5a6b5a` / `#4a6f3a` / `#5e8f4a`.
  Transición `background 1.5s ease`.
- Marco del panel con tokens v5 (`--paper-warm`, borde `--ink-line` 2px) para
  que la ventana se integre en ambos temas.
- **Nivel activo**: por defecto, el nivel desbloqueado más alto; el usuario
  puede fijarlo desde la vista jardín. Persistencia: localStorage
  `garden.activeLevel` (pref de UI, no dato de usuario — no pasa por el adapter).
- **Cofre del diario** (raíces): navega a `/log`; badge con el nº de oraciones
  pendientes de revisar (`garden.diary_pending`).
- **Bomi**: `idle` por defecto; flota sobre el nodo desbloqueado más avanzado
  (guía sin tutorial). `cheer` durante la celebración de desbloqueo; `thinking`
  al tocar zona bloqueada; `sleep` si progreso 0 y sin práctica en 7 días.
- **HUD**: panel retro con tokens v5 — nivel activo, barra de progreso
  (`--gold` de relleno), % numérico, estado textual, CTA → `/practice`.
- Móvil (<768px): escenario a ancho completo (scale 2 si no caben 384px),
  HUD apilado debajo, nodos con área táctil ≥ 44px.

### 5.2 Vista jardín (los 6 árboles)

- Toggle desde la home (botón `garden.grove_open` / volver con
  `garden.grove_back`). v1: sección dentro de la misma página
  (`GardenGrove.vue`), no ruta nueva — evita tocar router/nav.
- Strip horizontal scrolleable (o grid 3×2 en desktop) con los 6 árboles a
  scale 2, cada uno con: nombre KO + nombre localizado, nivel, % y su estado
  real de capas (no solo full): el jardín ES el mapa de progreso global.
- Bloqueados: grayscale + candado + tooltip con el requisito.
- Tap en árbol desbloqueado → lo fija como nivel activo y vuelve al hero.

### 5.3 Clima dinámico

- `pendingReviews = entradas de log con reviewState 'unreviewed' y (hard o errorNote)`.
- `pendingReviews ≥ 5` → lluvia pixel (partículas 1×3 px azuladas) + cielo
  un paso más frío + hint `garden.weather.rain_hint` bajo el HUD.
- `1–4` → neblina sutil (overlay translúcido).
- `0` → despejado; si progreso ≥ 80, caen pétalos/hojas de la especie
  (sprites de `particles/`).
- Clima nunca bloquea nada: es feedback, no castigo.

### 5.4 Celebración de desbloqueo

- Al cruzar un umbral (10/40/80) o desbloquear un árbol nuevo: pop de capa
  (ya lo hace `PixelTree`), ráfaga de 10–16 partículas de la especie, Bomi
  `cheer`, toast con `garden.unlock.*`.
- Hitos ya celebrados se persisten en localStorage `garden.milestonesSeen`
  (formato `"<nivel>:<umbral>"`); si el umbral se cruzó fuera de la home, se
  celebra la próxima vez que se abra el jardín.
- Con `prefers-reduced-motion`: sin ráfaga ni pop; solo toast.

### 5.5 Sidebar plegable (nota de la idea original)

- El sidebar NO desaparece: gana un botón de colapso (chevron) que reduce la
  columna de 220px a 0 con transición; pref en localStorage
  `ui.sidebarCollapsed`. Móvil no cambia (ya usa MobileNavbar).
- Fase final; no bloquea el resto.

## 6. i18n

- Claves nuevas bajo prefijo `garden.*` (lista exacta y valores en/es en el
  plan §Fase 3). Añadir como mínimo a `i18n/locales/en.json` y `es.json`;
  los otros 6 idiomas hacen fallback a `en` hasta traducirse.
- Nombres de especies: clave por especie (`garden.species.cherry`…) + el
  nombre coreano se muestra tal cual (벚꽃 no se traduce).
- Nombres de zonas: usar el nombre del theme del spine (verificar en
  implementación si es `LocalizedString` → entonces pasar por `localized()`).

## 7. Reglas visuales pixel (obligatorias)

1. `image-rendering: pixelated` en todo PNG del jardín.
2. **Escala entera siempre** (×2/×3/×4). Nunca `width: 100%` sobre el árbol.
3. Capas acumulativas: nunca quitar una capa inferior al añadir la superior.
4. Pre-cargar las 5 capas de la especie antes de animar (PixelTree ya lo hace).
5. Emojis prohibidos en el escenario (🔒⭐💼 del doc de idea → sprites pixel
   propios; el candado/cofre se generan con el pipeline o se dibujan a mano
   en 16×16).
6. Bordes UI del HUD/panel: estilo v5 existente (2px sólidos, sombra dura),
   no inventar otro lenguaje.

## 8. Accesibilidad

- Nodos de zona: `<button>` reales con `aria-label` (nombre de zona + estado),
  focus visible con `--focus-ring`, navegables por teclado.
- `prefers-reduced-motion`: sin partículas, sin pops, transiciones de cielo
  instantáneas.
- El % de progreso y estado existen como texto (HUD), no solo como gráfico.
- Contraste de textos del HUD sobre panel: cumplir lo ya auditado en
  `PLAN-COLORES-2026-06-11.md` (no introducir gold-sobre-paper en texto).

## 9. Criterios de aceptación (v1 completa cuando…)

Verificados el 2026-06-11 (navegador: light/dark × desktop/375px × datos
vacíos/sembrados × en/es/fr-fallback). Divergencias documentadas abajo.

- [x] La home muestra el árbol del nivel activo con sus capas según progreso real del SRS.
- [x] Practicar gramática del nivel y volver a la home actualiza el árbol sin recargar (reactividad de stores; verificado vía mutación del SRS sembrado).
- [x] Funciona para usuarios con sesión (cuentas obligatorias desde 2026-06-11;
      el middleware manda a los anónimos a `/welcome` en TODA ruta de app).
- [x] La vista jardín muestra los 6 árboles con su estado real y bloqueo por puerta del 60%.
- [x] Las zonas (themes) se desbloquean en cadena y navegan a la biblioteca filtrada (`?level&theme` + banner de filtro).
- [x] Clima refleja oraciones pendientes; revisar el diario lo despeja.
- [x] Celebración al cruzar umbral, una sola vez por hito, con Bomi `cheer`.
- [x] Light/dark v5 sin regresiones; móvil usable; reduced-motion respetado.
- [x] Claves i18n en `en` y `es`; sin texto hardcodeado en componentes.
      (Fix derivado: `i18n/i18n.config.ts` con `fallbackLocale: 'en'` — los
      idiomas sin traducir mostraban claves crudas, no inglés.)
- [x] Tests vitest de `app/lib/garden/` (fórmula y puertas) en verde (17 casos).

Divergencias de implementación respecto a la spec original:

- Anclas de zona en `app/lib/garden/zone-anchors.ts` (no en components/ —
  colisión con el escáner de Nuxt), derivadas de la geometría real del
  generador en vez del calibrador manual (que sigue disponible en el preview).
- 7 anclas por especie; el nivel 2 (11 themes) agrupa los sobrantes en el
  último nodo `+N`, que navega a la biblioteca filtrada por nivel completo.
- Sprites UI: `chest_16_open.png` extra; generados por
  `tools/pixel-trees/generate_ui_sprites.py`.

## 10. Fuera de alcance v1

- SQL/vistas server-side del jardín, rankings, insignias.
- Sonidos de celebración.
- Contar gramáticas custom del usuario en el progreso del nivel.
- Editor visual de posiciones de nodos (se calibran con el helper del preview).
- Animación de cámara welcome↔garden más allá de lo que CameraStage ya hace.
