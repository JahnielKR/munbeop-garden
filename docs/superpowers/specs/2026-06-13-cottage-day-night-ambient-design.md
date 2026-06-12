# Spec — Casita día/noche: humo nocturno + mariposas diurnas

Fecha: 2026-06-13 · Estado: aprobado por Jhoan (chat 2026-06-13)
Plan de referencia del humo: `C:\Users\home\Desktop\2026-06-12-chimney-smoke-plan.md`
(la versión 5-puffs octagonal; el commit `f4c9f6c` desplegó una variante de
3 puffs que esta spec reemplaza).

## 1. Visión

La casita ambiental (`CottageCorner`) gana ciclo de vida según el tema:

- **De noche** (dark): humo en la chimenea — la implementación del plan del
  2026-06-12 (5 puffs octogonales, `steps(5)`, ancla 64.3 % / 12.6 %), que se
  ve mejor que la desplegada y exige la boca de la chimenea limpia.
- **De día** (light): la chimenea está apagada y **2 mariposas** vuelan sobre
  las flores — una dorada en el parterre de rosas/lavanda izquierdo y una
  blanca-crema (배추흰나비, la mariposa de la col) sobre los bancales de la
  huerta. CSS puro, estética pixel, compositor-only.

El flip de tema es seco (sin fade), como el swap de los PNG.

## 2. Estructura (regla no-god-files)

`CottageCorner.vue` se divide por responsabilidad:

| Componente | Responsabilidad |
| --- | --- |
| `layout/CottageCorner.vue` | Wrapper: `position: fixed`, las 2 `<img>`, gating por ruta (`surface: 'welcome'`), media query mobile, swap de imagen por tema. |
| `layout/CottageSmoke.vue` | Humo del plan 2026-06-12, **solo dark**. Array `puffs` con knobs por puff (s/dx/dur/delay/o). |
| `layout/CottageButterflies.vue` | 2 mariposas, **solo light**. |

Gating día/noche con el patrón existente: default en el bloque scoped,
override en el bloque global `[data-theme='dark']` (humo `display: none` →
`block`; mariposas `block` → `none`). Con `display: none` las animaciones ni
corren — costo cero en el tema contrario.

## 3. Humo (CottageSmoke)

Implementación del md del 2026-06-12 con dos adaptaciones deliberadas:

1. **Solo-noche**: el color light del md (gris topo) queda fuera;
   `--smoke-color` es directamente el gris malva lunar
   `rgba(134, 128, 156, 0.42)`.
2. **Delays negativos** (mismos offsets del md, con signo −): el md asumía
   humo siempre montado y arrancaba la columna de cero; con el gating por
   `display`, cada cambio a dark reinicia las animaciones y la chimenea
   tardaría ~6 s en poblarse. Con delays negativos el flip muestra la columna
   ya en marcha.

Resto fiel al md: 5 puffs octogonales (`clip-path`), `steps(5)` por segmento,
zigzag con `--dx`, crecimiento a `scale(1.7)`, subida ~86 px, PRM = 2 puffs
estáticos (réplica del humo pintado original).

## 4. Mariposas (CottageButterflies)

- **Anatomía**: `<span>` cuerpo (2×8 px oscuro) + alas en `::before`/`::after`
  (~6×8 px, octógono `clip-path` — el "círculo pixel" del humo — con sombra
  `inset` para el bitono).
- **Aleteo**: 2 frames `steps(1)` (squash `scaleX` de alas desde el borde del
  cuerpo), ~360 ms la dorada / ~300 ms la crema — nunca sincronizan.
- **Vuelo**: keyframes en bucle con ~6 waypoints sobre su zona, cuantizado
  con `steps()` (~5 saltos/s), duraciones co-primas (~13 s / ~16 s). El
  `scaleX(±1)` del rumbo va dentro de los waypoints (giro seco al cambiar de
  dirección, frame discreto).
- **Zonas** (arte 669×373 → % del wrapper): dorada ancla ~40 % / 44 %
  vagando ±40 px (parterre izquierdo); crema ancla ~54 % / 57 % (bancales).
- **Colores**: constantes de escena (vuelan sobre arte fijo) — dorada
  `#e6a121` con sombra `#a06b2e`; crema `#f8efd0` con sombra `#cfc5b6`;
  cuerpos `#2d1e18`.
- **PRM**: posadas (quietas, alas abiertas) — la dorada sobre una rosa, la
  crema sobre una hoja del bancal. `animation: none` explícito (el
  kill-switch global dejaría el vuelo en estado raro, mismo motivo que el
  humo).

## 5. PNG — limpieza de la boca (dark)

Ejecutar el script del md (pasos 3–4: reconstrucción fila a fila de la boca +
contorno superior nítido) sobre los PNG actuales. Diferencias esperadas vs el
output del md: los pasos 1–2 (rect de humo flotante y antialiasing light) ya
los aplicó `f4c9f6c`, así que reportarán ~0 px; la reconstrucción de la boca
eliminará la voluta-semilla (~129 px cálidos medidos el 2026-06-13). El light
ya está limpio (0 px por encima de y44 verificado) — no se toca más allá de lo
que el script encuentre. Backups `.orig.png` se borran tras la verificación
visual (viven en `public/`, no deben desplegarse).

## 6. Verificación

1. typecheck + suite completa (ningún test toca CottageCorner).
2. Preview: light = mariposas + chimenea apagada y limpia, sin humo;
   dark = humo malva 5 puffs desde la boca reconstruida, sin mariposas.
3. Flip de tema en caliente: swap seco, columna de humo ya en marcha.
4. PRM emulado: humo = 2 volutas estáticas (solo dark); mariposas posadas
   (solo light).
5. Mobile ≤768 px: nada (wrapper oculto). Rutas welcome: todo se desvanece
   con el wrapper (350 ms).
6. Performance: solo compositor (transform/opacity), sin layouts recurrentes.

## 7. Commits

1. `docs(cottage): day/night ambient split spec`
2. `fix(cottage): reconstruct the dark chimney mouth (plan script, steps 3-4)`
3. `feat(cottage): day/night ambient split — plan smoke at night, butterflies by day`

Flujo: verificar → commitear → verificar → merge a main → push → deploy
Vercel (aprobado en el diseño).
