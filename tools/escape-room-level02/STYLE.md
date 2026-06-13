# Biblia de estilo — Escape Room Nivel 2 «El templo de la lluvia (청우사)»

Referencia obligatoria para todo `gen_*.py` de esta carpeta. Fuente narrativa:
`docs/escape-room-level-02.md` §6 (cuartos), §10 (cosméticos), §11 (lista de assets)
y §12.7 (flags de verificación). Datos de runtime (rutas de imagen + rects de
hotspot en espacio 320×240): `munbeop/app/seed/escape-room/level-02.ts`.

Hermana de `tools/escape-room-level01/STYLE.md`: mismo formato, mismo motor de
helpers (`common.py`), misma disciplina de preview. Lo que cambia es la paleta
(lluvia fría fuera / brasa cálida dentro) y la capa de **deniabilidad** del nivel.

## Tono y referencia visual

- **«El jardín de las palabras» (Shinkai) × un episodio quieto de «Mushishi»**:
  melancolía luminosa, duelo sereno bajo lluvia constante. **NO terror, NO
  retro-arcade, NO melodrama.**
- Momento: **tarde de lluvia** en el día 49 (49재) por un maestro muerto. La luz
  cálida es escasa y preciosa (brasa, linterna); el resto es gris-pizarra mojado.
- Es un templo de montaña (hanok de madera + hanji + 단청). Todo se ve cuidado,
  austero, vivido — el templo «que escucha la lluvia».
- Contraste de temperatura como herramienta narrativa: frío (ventana/lluvia)
  contra cálido (brasero/linterna/diario). El punto de interés suele ser el más
  cálido de la escena.

## Paleta canónica (`common.PAL`)

Implementada light→dark en cada ramp. Reusa **verbatim** del nivel 1 los neutros
cálidos del hanok (`wood_light`, `wood_dark`, `hanji`, `floor`) más
`gold_light`, `green`, `metal`, `night`. Ramps nuevos de lluvia: `rain`, `ember`,
`bronze`, `plum`, `ink`, `stone`, `dc_green`/`dc_red`/`dc_blue` (단청), `white`.

Tonos derivados documentados (un paso de un ramp existente, **sin hue nuevo**):
`VERDIGRIS` (bronce→verde), `ROSE_GOLD` (plum[1]→oro, cielo del outro),
`RAIN_DEEP` (rain[4] un paso más oscuro, para la segunda sombra sobre el oro).

`OUTLINE = #2a1c14` (negro cálido, **nunca #000000**). Dos sombras de contacto:
`SHADOW_WARM` (interiores, brasa) y `SHADOW_COOL` (lluvia/piedra/exterior).

## Reglas duras (un QA las verifica una por una)

Las 8 del nivel 1, portadas:

1. **Solo colores de `common.PAL`** (+ `OUTLINE`, `SHADOW_WARM/COOL`, y los 3
   derivados documentados). Tono nuevo = derívalo de un ramp existente y anótalo.
2. **Contorno** de objetos y muebles: `common.OUTLINE` (#2a1c14). **Prohibido
   #000000 puro.**
3. **Sin alpha-blending suave**: transiciones con `dither()` (checkerboard) o
   bandas de color.
4. **Sombras de temperatura correcta**: `SHADOW_WARM` bajo props interiores
   (brasa); `SHADOW_COOL` bajo piedra/lluvia/exterior. Nunca gris azulado en un
   prop cálido ni al revés.
5. Tamaños exactos (ver tabla de assets). Nada de reescalar al guardar: se pinta
   a resolución base.
6. Escenas (320×240): opacas, sin píxeles transparentes. Sprites/close-ups:
   **fondo transparente** salvo tarjeta indicada.
7. Texto dentro del arte: ver regla **L2-a** abajo (es más estricta que en L1).
8. Detalle denso pero legible: cada superficie grande lleva textura
   (`wood_planks`, `hanji_wall`, flecks), cada prop proyecta sombra de contacto,
   y el punto de interés tiene el mayor contraste de la escena (≥12 props por
   habitación).

### Reglas de arte de deniabilidad del nivel 2 (añadidas)

- **L2-a · Cero coreano legible en escena.** Ningún texto coreano legible dentro
  de una escena 320×240. Todo lo que se lee vive solo en close-ups 128×128
  (Neodgm ≥ 16px, lo pone la UI) o en la UI. En escena, las notas/caligrafías/
  inscripciones son **trazos de pincel sugeridos, ilegibles a 1×** (líneas de
  `ink`, no glifos). El hangul decorativo dibujado a mano (placa 청우사 del
  일주문) es la única excepción y es **arte, no fuente** — y aun así no debe poder
  leerse como texto a 1×.
- **L2-b · La segunda sombra del `cinematic-outro`** es un tono más oscura que la
  del monje (`RAIN_DEEP` sobre el oro mojado), **sin outline, sin hotspot, sin
  glow, sin mención en texto**. Debe distinguirse si se busca (el ala del 삿갓 ha
  de leerse) y **no saltar a la vista a 1×**. Si grita, está mal (es el regalo
  del roguelike — §12.7).
- **L2-c · La inscripción de la viga** en `room-04-jongnu.png` son trazos de
  pincel sugeridos, ilegibles a 1×; el texto legible solo vive en
  `obj-beam-inscription.png`. Revisar a zoom 1×.
- **L2-d · El hanja 淸雨 es arte horneado, idéntico** en `obj-diary-last.png` y
  `obj-beam-inscription.png`. Se pinta SIEMPRE con `common.hanja_cheongwu()`, que
  garantiza la misma forma de píxeles byte-a-byte (verificado: misma forma con
  origen igual y con origen desplazado+recortado). Nunca como texto de fuente
  (Neodgm no garantiza cobertura de hanja).
- **L2-e · La linterna 49 sigue APAGADA en ambos estados** del 대웅전
  (`room-02-daeungjeon.png` y `-complete.png`). Su encendido se **narra** en el
  outro (§3 beat 2), **nunca se renderiza** — no hay asset de «linterna 49
  encendida». `lantern_wall()` mantiene un único tile apagado en (col,row) fijo.

## Composición de escenas interiores

- Perspectiva frontal plana (como el nivel 1): pared trasera arriba, suelo abajo.
- Línea pared/suelo aprox. en y≈140–155; zócalo de madera de 4–6 px en la unión.
- Paredes: `hanji_wall` con vigas `wood_light` enmarcando paneles; columnas/vigas
  rituales con `dancheong_column`/`dancheong_beam` donde el cuarto lo pida.
- Luz: penumbra fría dominante; el único calor entra por brasa/linterna/diario.
  La cortina de lluvia (`rain_curtain`) vive tras la ventana de celosía.
- **Hotspots**: cada objeto interactivo debe quedar con su centro visual dentro
  del rect dado (rects en la tabla de abajo, tomados del seed). Renderiza SIEMPRE
  `hotspot_debug()` y revísalo. **Cuarto 1**: el rect del Slot 1 se ciñe a la
  figura del monje `[120,95,55,75]`; la segunda taza `[205,165,28,24]` queda
  FUERA (el motor no resuelve solapamientos con `triggersSlot`).

## Flujo de trabajo obligatorio por script

1. `python tools/escape-room-level02/gen_<clave>.py` desde la raíz del repo.
2. El script guarda: asset final (`save_asset`), preview 3× (`preview`) y, si es
   habitación, overlay de hotspots (`hotspot_debug`).
3. **Mira el preview con tus propios ojos** (Read sobre `out/preview_*.png`),
   critica contra esta biblia + el spec + las fallas de
   `tools/escape-room-level01/PENDIENTES.md` (siluetas que leen como «frascos»,
   props que leen como «pomos», dither que sangra fuera de la forma, vapor que
   lee como motas sueltas, hotspots que bisectan props), e itera. **Mínimo 3
   rondas** de render→mirar→mejorar.
4. Determinista (sin `random` sin semilla); re-ejecutar = salida idéntica
   (md5 estable). Scripts de escena ≤ ~400 líneas; `common.py` es la librería
   compartida y puede exceder 400.

## Tabla de assets (22 — de §11)

Todos bajo `munbeop/public/escape-room/level-02/`. Fondo: `opaco` = sin píxeles
transparentes; `transp` = canal alpha con ≥1 píxel a 0.

| Archivo | Tamaño | Fondo |
|---|---|---|
| rooms/room-01-dasil.png | 320×240 | opaco |
| rooms/room-02-daeungjeon.png | 320×240 | opaco |
| rooms/room-03-seungbang.png | 320×240 | opaco |
| rooms/room-04-jongnu.png | 320×240 | opaco |
| rooms/room-02-daeungjeon-complete.png | 320×240 | opaco |
| rooms/room-04-jongnu-clear.png | 320×240 | opaco |
| rooms/cinematic-intro.png | 320×240 | opaco |
| rooms/cinematic-outro.png | 320×240 | opaco |
| objects/obj-ritual-sheet.png | 128×128 | transp |
| objects/obj-diary-page.png | 128×128 | transp |
| objects/obj-diary-last.png | 128×128 | transp |
| objects/obj-beam-inscription.png | 128×128 | transp |
| objects/obj-second-cup.png | 128×128 | transp |
| objects/obj-calligraphy-rain.png | 128×128 | transp |
| objects/obj-guestbook.png | 128×128 | transp |
| objects/obj-guestbook-signed.png | 128×128 | transp *(opcional; primer recorte)* |
| objects/sprite-cat-strip.png | ~64×24 (2 frames ~32×24) | transp |
| cosmetics/cosmetic-bg-rainsound.png | 320×240 | opaco |
| cosmetics/cosmetic-frame-dancheong.png | 96×96 | transp (ventana central) |
| cosmetics/cosmetic-avatar-templecat.png | 64×64 | transp |
| cosmetics/cosmetic-avatar-templecat-strip.png | 192×64 (3 frames) | transp |
| cosmetics/cosmetic-set-complete.png | 128×128 | transp |

> Conteo: 4 escenas + 2 variantes + 2 cinemáticas + 8 close-ups (incl. el opcional)
> + 1 sprite + 5 cosméticos = **22** (21 si se recorta `obj-guestbook-signed`).
> Assets de pipeline que **NO se embarcan** (se hornean en escena): `tile-lantern`
> (lo genera `lantern_tile`/`lantern_wall`), overlays de lluvia 2 frames y vapor
> 1px (`rain_curtain`/`rain_clear`).

## Tabla de hotspots por cuarto (del seed, espacio 320×240)

`triggersSlot` = dispara puzzle; `cosmetic` = solo close-up/flavor.

| Cuarto | id | rect [x,y,w,h] | tipo |
|---|---|---|---|
| room-dasil | monk-tea | [120,95,55,75] | slot-1 |
| room-dasil | cat | [240,150,40,30] | cosmetic |
| room-dasil | second-cup | [205,165,28,24] | cosmetic |
| room-dasil | guestbook | [273,118,34,44] | cosmetic |
| room-dasil | window-dasil | [10,60,60,90] | cosmetic |
| room-daeungjeon | ritual-sheet | [28,128,52,44] | slot-2 |
| room-daeungjeon | lantern-49 | [282,32,28,32] | slot-3 |
| room-daeungjeon | moktak | [88,148,30,30] | cosmetic |
| room-daeungjeon | portrait | [148,68,32,38] | cosmetic |
| room-seungbang | diary | [138,128,48,38] | slot-4 |
| room-seungbang | threshold | [14,148,56,48] | slot-5 |
| room-seungbang | calligraphy | [148,58,38,52] | cosmetic |
| room-seungbang | emille-book | [252,88,16,44] | cosmetic |
| room-jongnu | bell-rope | [120,100,80,80] | slot-6 |
| room-jongnu | beam-inscription | [70,24,180,30] | cosmetic |
| room-jongnu | valley | [10,70,90,60] | cosmetic |

## Shared builders API (`common.py`)

Helpers portados verbatim del nivel 1 (con `save_asset` apuntando a `.../level-02/`):
`rgb`, `fill`, `frame`, `hline`, `vline`, `dither`, `wood_planks`, `hanji_wall`,
`glow`, `drop_shadow` (acepta `cool=True`), `new_canvas`, `save_asset`,
`save_out`, `preview`, `hotspot_debug`.

Builders compartidos nuevos. **Cada consumidor de abajo se sirve de UNA sola
función** — ese es el sentido del nivel «highest level»: consistencia cruzada
garantizada. (x,y) = esquina superior-izquierda del bounding cell salvo nota.

| Builder | Firma | Ramps que usa | Consumidores |
|---|---|---|---|
| `rain_curtain` | `(d, x, y, w, h, phase=0, density=7, lean=2)` | rain[1] far / rain[2] near | rooms 1-4, cinematic-intro, cosmetic-bg-rainsound |
| `rain_clear` | `(d, x, y, w, eave_y, phase=0)` | rain, white, metal | room-04-jongnu-clear, cinematic-outro |
| `lantern_tile` | `(d, x, y, lit=True)` | gold_light/ember (lit) · rain (unlit) · wood_dark, white | lantern_wall, daeungjeon, cosmetic-bg-rainsound |
| `lantern_wall` | `(d, x, y, cols=7, rows=7, step_x=20, step_y=27, unlit_col=6, unlit_row=0)` | (vía lantern_tile) | daeungjeon (A+B, la 49 apagada en ambos), cosmetic-bg-rainsound |
| `monk` | `(d, x, y, pose='seated_tea'\|'gassho')` | rain (승복) · ember (가사) · wood_light (piel) | room-01-dasil, cinematic-outro |
| `cat` | `(d, x, y, frame=0\|1\|2)` | wood_dark/wood_light, gold_light (ojos), plum (oreja) | room-01-dasil, sprite-cat-strip, cosmetic-avatar-templecat(+strip), cinematic-outro |
| `bell_beom` | `(d, x, y, w=46, h=70)` | bronze, metal | room-04-jongnu(+clear) |
| `dangmok` | `(d, x, y, w=34)` | wood_light/wood_dark, hanji | jongnu (escenas) |
| `iljumun` | `(d, x, y, w, h)` | dc_* (단청), stone, wood_dark, white (placa) | cinematic-intro, cinematic-outro (proscenio) |
| `dancheong_column` | `(d, x, y, h, w=16)` | dc_red base · dc_green/red/blue + white bandas | daeungjeon, jongnu, cosmetic-frame-dancheong |
| `dancheong_beam` | `(d, x, y, w, h=14)` | dc_green 뇌록 · dc_red caps · dc_blue/white | daeungjeon, jongnu, cosmetic-frame-dancheong |
| `dancheong_band` | `(d, x, y, w, horizontal=True)` *(interno)* | dc_green/red/blue + white | (lo usan column/beam/medallion) |
| `plum_branch` | `(d, x, y, w, h, seed=49)` | ink (rama) · plum (flor) · gold_light (centro) | cinematic-intro (ciruelo del patio) |
| `petals` | `(d, x, y, w, h, n=14, seed=7)` | plum | cinematic-intro (deriva), cinematic-outro (sobre piedra) |
| `brazier_hwaro` | `(d, x, y, w=30, h=22)` | stone, ember/gold_light, ink | room-01-dasil (luz clave) |
| `hanja_cheongwu` | `(d, x, y, c=ink[2])` **byte-idéntico** | ink | obj-diary-last, obj-beam-inscription |
| `diary_book` | `(d, x, y, open=False)` | wood_dark, hanji, ember (cinta) | room-03-seungbang (closed), obj-diary-page, obj-diary-last (open) |
| `gomusin` | `(d, x, y)` | white | room-03-seungbang (umbral), cinematic-outro (intactos) |
| `guestbook` | `(d, x, y, signed=False)` | hanji, ink, wood_dark | room-01-dasil, obj-guestbook(+signed) |
| `tea_cup` | `(d, x, y, steam=False)` | white, hanji, green (celadón), stone | room-01-dasil (dos tazas), obj-second-cup |
| `moktak` | `(d, x, y)` | wood_light/wood_dark, stone (cojín), ink (boca) | daeungjeon |
| `portrait_yeongjeong` | `(d, x, y, w=30, h=36)` | wood_dark (marco), wood_light (cara), rain/ember (가사) | daeungjeon |
| `paper_umbrella` | `(d, x, y, open=True)` | hanji (papel), wood_dark (varilla) | cinematic-outro, cosmetic-set-complete, cosmetic-avatar-templecat |
| `broken_umbrella` | `(d, x, y)` | metal | cinematic-intro (primer plano) |
| `bicheonsang` | `(d, x, y, w=28, h=28)` | bronze | cosmetic-set-complete (marco) |
| `samul_medallion` | `(d, x, y, kind='bell'\|'drum'\|'fish'\|'cloud')` | bronze, dc_green/red/blue, white | cosmetic-frame-dancheong (esquinas) |

Notas de uso:
- **`monk`** debe leer como la MISMA persona en ambas poses: cabeza rapada
  redonda + cara serena (ojos cerrados sonrientes, mejilla sombreada) +
  banda de 가사 color caqui (`ember[2]`). Verificado a 8× en
  `out/zoom_anchors_8x.png`.
- **`hanja_cheongwu`** no toma offset relativo de glifo: la forma es fija para
  que dos llamadas con el mismo origen produzcan los mismos bytes (regla L2-d).
- **`lantern_wall`** deja la 49 apagada vía `unlit_col`/`unlit_row` (regla L2-e);
  no la enciendas en `-complete`.
- **`cat`** frame 2 (mirada fuera de cuadro) es exclusivo del cosmético; los
  cuartos usan 0 y 1.

## Hoja de contacto + auto-revisión

`gen_contact_sheet.py` renderiza CADA builder en tiles etiquetados sobre dos
tarjetas (clara = `hanji[0]`, oscura = `rain[4]`/`night[3]`), a 1× y 3×
(`out/contact_sheet_{light,dark}{,_3x}.png`). Es la herramienta de auto-revisión
del foundation phase: tras cada cambio en `common.py`, re-render → Read los PNG →
critica contra esta biblia y las fallas de L1 → itera (≥3 rondas). Aceptación por
builder: lee como su objeto a 1×, usa solo ramps de PAL, contorno = OUTLINE, y se
cumplen los dos anclajes cruzados (monje = misma persona; hanja = byte-idéntico).
