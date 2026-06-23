# Biblia de estilo — Escape Room Nivel 3 «El mercado nocturno (달빛시장)»

Referencia obligatoria para todo `gen_*.py` de esta carpeta. Fuente narrativa:
`docs/escape-room-level-03.md` §6 (zonas), §9 (cosméticos), §10 (lista de assets).
Datos de runtime (rutas de imagen + rects de hotspot en espacio 320×240):
`munbeop/app/seed/escape-room/level-03.ts`.

Hermana de `tools/escape-room-level01/STYLE.md` y `…level02/STYLE.md`: mismo
formato, mismo motor de helpers (`common.py`), misma disciplina de preview. Lo
que cambia radicalmente es la **temperatura del nivel** — y un giro filosófico:
donde el L2 ESCONDÍA (deniabilidad, segunda sombra secreta), el L3 **DESBORDA**.
No hay capa oculta. Lo que ves es lo que pasa, a plena luz de neón.

## Tono y referencia visual

- **«Reply 1988» (la calidez de mercado) × un buen episodio de «Hospital
  Playlist» (la comedia de wingman)**: bullicio cálido, ruido, vapor, neón. **NO
  terror, NO retro-arcade, NO melodrama, NO misticismo.**
- Momento: **noche, casi de cierre.** El mercado entero baja la persiana en veinte
  minutos y sale el último bus. Es el **alivio cálido a gritos** tras la
  lluvia-duelo del L2: aquí la profundidad es alegría y familia encontrada.
- Es un mercado techado callejero (시장): planchas, ollas, carteles de neón
  apilados, asfalto mojado que lo refleja todo partido. Vivido, abigarrado, lleno.
- **Contraste de temperatura como herramienta narrativa, invertido respecto al
  L2:** aquí el frío es el **neón mojado del callejón** (azul-violeta, rosa, cian,
  verde menta) y el calor es la **plancha de cada puesto** (ámbar de aceite). Cada
  puesto es una isla de luz cálida; **el 호떡 de 순자 이모 es la más caliente de
  todas** y siempre el punto de mayor contraste de su escena.

## Paleta canónica (`common.PAL`)

Implementada light→dark en cada ramp (lista de hex, como en L1/L2). **Reusa
verbatim** los neutros cálidos de madera del L1/L2 para la estructura de los
puestos (`wood_light`, `wood_dark`, `white`) y la familia de plancha del L2
(`ember`, `gold_light`) para el ámbar del aceite. `ink`, `stone`, `metal`
(persianas, postes, banco). Ramps **nuevos del mercado nocturno** (a definir en
`common.py`):

| Ramp | Rol | Hex (light→dark) |
|---|---|---|
| `asphalt` | calle mojada, fondo frío base | `#3a3550 #2a2640 #1c1830 #100e1c` |
| `neon_pink` | el cartel que parpadea, halo dominante | `#ffd0e8 #ff77c2 #e83f9e #a8246e` |
| `neon_cyan` | carteles fríos, vapor lejano | `#c8fbff #6fe9f5 #2fc3d8 #1d7f93` |
| `neon_green` | verde menta de los letreros | `#d8ffce #8ef58a #46d36b #2a8f4e` |
| `tteok` | el rojo saturado del 떡볶이 (zona 2) | `#ff7a4e #ef3f2a #b82a1a #7a1a10` |
| `steam` | vapor cálido (plancha) / blanco-grisáceo | `#f4ede0 #ddd6c8 #bcbcc0` |

Tonos derivados documentados (un paso de un ramp existente, **sin hue nuevo**):
- `NEON_REFLECT` — el neón rosa partido y temblando en el asfalto: `neon_pink[2]`
  un paso hacia `asphalt[1]` (apagado, desaturado por el agua).
- `AMBER_DEEP` — el borde más oscuro del aceite en la plancha: `ember[3]` un paso
  más oscuro.

`OUTLINE = #2a1c14` (negro cálido, **nunca #000000**, igual que L1/L2). Dos
sombras de contacto: `SHADOW_WARM` (props de plancha/puesto, calor de aceite) y
`SHADOW_COOL` (asfalto/calle/exterior, azulada).

## Reglas duras (un QA las verifica una por una)

Las 8 del nivel 1/2, portadas:

1. **Solo colores de `common.PAL`** (+ `OUTLINE`, `SHADOW_WARM/COOL`, y los 2
   derivados documentados). Tono nuevo = derívalo de un ramp existente y anótalo.
2. **Contorno** de objetos y muebles: `common.OUTLINE` (#2a1c14). **Prohibido
   #000000 puro.** (El neón es la excepción: brilla con `glow()`, no con outline.)
3. **Sin alpha-blending suave**: transiciones con `dither()` (checkerboard) o
   bandas de color. El glow de neón se hace por bandas de su ramp, no por blur.
4. **Sombras de temperatura correcta**: `SHADOW_WARM` bajo props de plancha/puesto
   (ámbar); `SHADOW_COOL` bajo cosas en la calle/asfalto. Nunca al revés.
5. Tamaños exactos (ver tabla de assets). Nada de reescalar al guardar: se pinta a
   resolución base.
6. Escenas (320×240): opacas, sin píxeles transparentes. Sprites/close-ups:
   **fondo transparente** salvo tarjeta indicada.
7. Texto dentro del arte: ver regla **L3-a** abajo.
8. Detalle denso pero legible: cada superficie grande lleva textura (planchas,
   cajas, mercancía colgada, charcos), cada prop proyecta sombra de contacto, y el
   punto de interés (la plancha) tiene el mayor contraste de la escena (≥12 props
   por zona — el mercado está LLENO).

### Reglas de arte propias del nivel 3 (añadidas)

- **L3-a · Cero coreano legible en escena.** Igual que L2-a. Ningún texto coreano
  legible dentro de una escena 320×240; lo que se lee vive solo en close-ups
  128×128 (Neodgm ≥ 16px, lo pone la UI) o en la UI. **Los carteles de neón del
  mercado son trazos de hangul SUGERIDOS — glow sin glifo legible** (bandas de
  `neon_*` con forma de trazo, nunca sílabas descifrables a 1×). El rótulo del arco
  (시장 입구) es arte, no fuente, e ilegible a 1×.
- **L3-b · El plano final NO ESCONDE NADA (contraste explícito con L2-b).** El
  `cinematic-outro` / `farewellImage` es una despedida con reencuentro prometido a
  plena luz de neón: **SIN segunda sombra, SIN easter egg oculto, SIN elemento que
  premie una segunda run buscando un secreto** (dossier §3). Lo que el L2 escondía
  (la sombra del 삿갓), aquí está prohibido. El «descubrimiento» de la 2.ª run es
  temático, no visual: el 호떡 que el jugador lleva en la mano fue siempre el de
  ella. Si hay algo escondido en el plano, está MAL.
- **L3-c · El reloj diegético = persianas + neones apagándose.** El paso del tiempo
  se renderiza con `shutter` (tile de 2 estados: alta / a medio bajar) en puestos
  vecinos y `neon_sign` apagándose (un halo menos en el fondo por zona resuelta).
  Cada zona se entrega con **2 estados de persiana** reutilizando el mismo fondo.
  **La plancha de 호떡 NUNCA se apaga** — 이모 no apaga lo último.
- **L3-d · La plancha es la luz clave.** En toda escena donde aparezca, el 철판 con
  el 호떡 dorándose (ámbar `ember`/`gold_light` + vapor `steam` de 1px) es la
  fuente cálida dominante y tiñe de oro lo que tenga delante. El resto de la escena
  es neón frío sobre asfalto mojado. El ojo va al calor.
- **L3-e · Mundano al 100%.** Sin misticismo, sin señales liminales, sin segunda
  lectura (≠ L2). Cada cosa rara tiene causa callejera obvia: el puesto cierra, el
  bus es el último, 도윤 se va al 군대. Prohibido cualquier glow «mágico» o sombra
  sin fuente.

## Composición de escenas (callejón de mercado)

- **Puestos como islas de luz cálida** sobre una calle de neón frío y asfalto
  mojado. Encuadre frontal con ligera diagonal de fuga para los callejones (el
  mercado «sigue» hacia el fondo, neones apilados perdiéndose).
- Suelo: asfalto negro-violeta (`asphalt`) con **charcos que devuelven el neón
  partido** (`NEON_REFLECT`, vía `wet_reflect`) en el primer plano inferior.
- El puesto protagonista de cada zona ocupa el centro, con su plancha/barra como
  ancla cálida; el resto del mercado en fuga al fondo con `neon_sign` repetido
  (glow, ilegible) y siluetas de clientes como sombras.
- Luz: neón frío dominante (azul-violeta del callejón); el calor entra SOLO por la
  plancha/bombilla desnuda del puesto. Vapor `steam` de 1px subiendo de las ollas.
- **Hotspots**: cada objeto interactivo debe quedar con su centro visual dentro del
  rect dado (tabla de abajo, tomada del seed). Renderiza SIEMPRE `hotspot_debug()`
  y revísalo. **Zona 1**: el Slot 1 (이모) `[145,80,60,90]` y el Slot 5 (la caja
  del 군대) `[55,120,50,50]` son **dos hotspots distintos y no solapados** (el
  motor no remapea un hotspot a dos slots; ver nota del seed). Ningún cosmético cae
  dentro de un rect con `triggersSlot`.

## Flujo de trabajo obligatorio por script

1. `python tools/escape-room-level03/gen_<clave>.py` desde la raíz del repo.
2. El script guarda: asset final (`save_asset`), preview 3× (`preview`) y, si es
   habitación, overlay de hotspots (`hotspot_debug`).
3. **Mira el preview con tus propios ojos** (Read sobre `out/preview_*.png`),
   critica contra esta biblia + el spec del dossier + las fallas de
   `tools/escape-room-level01/PENDIENTES.md` y `…level02/PENDIENTES.md` (siluetas
   ambiguas, props que «leen» mal, dither que sangra, vapor que lee como motas,
   neón que lee como texto, hotspots que bisectan props), e itera. **Mínimo 3
   rondas** de render→mirar→mejorar.
4. Determinista (sin `random` sin semilla); re-ejecutar = salida idéntica (md5
   estable). Scripts de escena ≤ ~400 líneas; `common.py` es la librería
   compartida y puede exceder 400.

## Tabla de assets (22 — de §10)

Todos bajo `munbeop/public/escape-room/level-03/`. Fondo: `opaco` = sin píxeles
transparentes; `transp` = canal alpha con ≥1 píxel a 0.

| Archivo | Tamaño | Fondo |
|---|---|---|
| rooms/room-01-hotteok.png | 320×240 | opaco |
| rooms/room-02-meokja.png | 320×240 | opaco |
| rooms/room-03-manmulsang.png | 320×240 | opaco |
| rooms/room-04-busstop.png | 320×240 | opaco |
| rooms/room-01-hotteok-closing.png | 320×240 | opaco |
| rooms/room-03-manmulsang-wrapped.png | 320×240 | opaco |
| rooms/room-04-busstop-bus.png | 320×240 | opaco |
| rooms/cinematic-intro.png | 320×240 | opaco |
| rooms/cinematic-outro.png | 320×240 | opaco |
| objects/obj-hotteok.png | 128×128 | transp |
| objects/obj-backpack.png | 128×128 | transp |
| objects/obj-tteokbokki.png | 128×128 | transp |
| objects/obj-eomuk.png | 128×128 | transp |
| objects/obj-gift-wrapped.png | 128×128 | transp |
| objects/obj-market-gate.png | 128×128 | transp |
| objects/obj-bus-ticket.png | 128×128 | transp *(opcional; primer recorte)* |
| objects/sprite-cat-strip.png | ~64×24 (2 frames ~32×24) | transp |
| cosmetics/cosmetic-bg-neonalley.png | 320×240 | opaco |
| cosmetics/cosmetic-frame-hotteokbag.png | 96×96 | transp (ventana central) |
| cosmetics/cosmetic-avatar-marketcat.png | 64×64 | transp |
| cosmetics/cosmetic-avatar-marketcat-strip.png | 192×64 (3 frames) | transp |
| cosmetics/cosmetic-set-complete-03.png | 128×128 | transp |

> Conteo: 4 escenas + 3 variantes + 2 cinemáticas + 6 close-ups + 1 sprite + 5
> cosméticos = **21**; con el `obj-bus-ticket` opcional = **22** (techo). Assets de
> pipeline que **NO se embarcan** (se hornean en escena): `tile-neon-sign` (2
> estados, lo genera `neon_sign`), `tile-shutter` (2 estados, `shutter`), overlays
> de vapor 1px (`steam`) y neón espejado en asfalto (`wet_reflect`).

## Tabla de hotspots por zona (del seed `level-03.ts`, espacio 320×240)

`triggersSlot` = dispara puzzle; `cosmetic` = solo close-up/flavor.

| Zona | id | rect [x,y,w,h] | tipo |
|---|---|---|---|
| room-hotteok | imo | [145,80,60,90] | slot-1 |
| room-hotteok | gunbox | [55,120,50,50] | slot-5 |
| room-hotteok | hotteok | [120,178,55,30] | cosmetic |
| room-hotteok | backpack | [15,180,40,35] | cosmetic |
| room-hotteok | bulb | [195,28,24,28] | cosmetic |
| room-meokja | hana | [65,95,65,80] | slot-2 |
| room-meokja | tteokbokki | [95,180,40,28] | cosmetic |
| room-meokja | eomuk | [145,185,35,25] | cosmetic |
| room-meokja | stools | [15,185,45,30] | cosmetic |
| room-manmulsang | counter | [105,95,80,50] | slot-3 |
| room-manmulsang | gift | [120,155,55,38] | slot-4 |
| room-manmulsang | merch | [15,25,80,45] | cosmetic |
| room-manmulsang | vendor | [240,120,35,60] | cosmetic |
| room-manmulsang | bulb-flicker | [150,22,22,24] | cosmetic |
| room-busstop | doyun | [90,90,70,90] | slot-6 |
| room-busstop | gate | [215,25,95,45] | cosmetic |
| room-busstop | bench | [65,185,55,25] | cosmetic |
| room-busstop | lane | [10,105,70,40] | cosmetic |

## Shared builders API (`common.py` — a construir tras tu OK)

Helpers a portar verbatim del L1/L2 (con `save_asset` apuntando a `.../level-03/`):
`rgb`, `fill`, `frame`, `hline`, `vline`, `dither`, `wood_planks`, `glow`,
`drop_shadow` (acepta `cool=True`), `new_canvas`, `save_asset`, `save_out`,
`preview`, `hotspot_debug`.

Builders compartidos NUEVOS (la consistencia cruzada es el sentido del pipeline:
**cada consumidor se sirve de UNA sola función**). (x,y) = esquina superior-
izquierda del bounding cell salvo nota.

| Builder | Rol | Ramps | Consumidores |
|---|---|---|---|
| `neon_sign` | cartel de hangul SUGERIDO (glow, ilegible), 2 estados lit/unlit | neon_pink/cyan/green · asphalt (off) | fondos de las 4 zonas, cinematics, cosmetic-bg-neonalley |
| `shutter` | persiana metálica, 2 estados (alta / a medio bajar) | metal, ink | reloj diegético de las 4 zonas (estados B) |
| `wet_reflect` | neón partido y temblando en el asfalto del primer plano | NEON_REFLECT, asphalt | las 4 zonas, cinematics |
| `steam` | columna de vapor de 1px (cálido sobre plancha) | steam, white | hotteok/meokja, planchas, cinematics |
| `griddle_hotteok` | el 철판 con 2 호떡 dorándose + espátula (luz clave) | ember, gold_light, AMBER_DEEP, wood_dark | room-01-hotteok(+closing), cinematic-outro, obj-hotteok |
| `imo` | 순자 이모 (~60, delantal, pañuelo, manos ocupadas) | wood_light (piel) · ember (delantal-luz) · stone | room-01-hotteok, cinematic-outro |
| `doyun` | 도윤 (19, flaco, tenso; en el outro, **rapado** en la ventanilla) | wood_light, ink (군대), metal (bus) | room-04-busstop, cinematic-outro |
| `hana` | 하나 (~19, coleta, mandil, energía rápida) | wood_light, tteok (mandil-luz) | room-02-meokja, cinematic-outro |
| `market_stall` | puesto-isla genérico (toldo, mostrador, bombilla desnuda) | wood_*, gold_light (bombilla) | las 4 zonas (fondo + protagonista) |
| `bunsik_bar` | barra de 분식: 떡볶이 borboteando, 어묵 en caldo, 김밥 | tteok, steam, wood_dark | room-02-meokja, obj-tteokbokki, obj-eomuk |
| `manmulsang_wall` | pared de mercancía colgada (paraguas, calcetines, llaveros) | wood_*, stone, metal | room-03-manmulsang(+wrapped), merch |
| `gift_wrapped` | el regalo envuelto en bolsa de papel sobre el mostrador | white, wood_dark, tteok (lazo) | room-03-manmulsang-wrapped, obj-gift-wrapped |
| `last_bus` | el último bus, ventanillas amarillas, puerta abierta | metal, gold_light (ventanas), asphalt | room-04-busstop-bus, cinematic-outro |
| `bus_stop` | marquesina + poste + banco de metal | metal, ink | room-04-busstop |
| `market_gate` | el arco 시장 입구 (rótulo neón ilegible + guirnalda de bombillas) | neon_*, gold_light | room-04-busstop, obj-market-gate, cosmetic-set-complete-03 |
| `market_cat` | el gato del mercado, 3 frames (sentado / cola / lamida+mira vapor) | wood_dark/light, gold_light (ojos) | room-01-hotteok, sprite-cat-strip, cosmetic-avatar-marketcat(+strip) |
| `paper_bag` | bolsa de papel de estraza manchada de aceite (호떡 봉지) | white, ember, ink (sellos) | cosmetic-frame-hotteokbag, outro (호떡 envuelto) |
| `backpack` | la mochila «secuestrada» bajo el mostrador | wood_dark, tteok | room-01-hotteok, obj-backpack |

Notas de uso:
- **`imo`/`doyun`/`hana`** deben leer como las MISMAS personas en escena y en el
  `cinematic-outro`. Verificar a 8× (anclas cruzadas, como el `monk` del L2).
- **`doyun`** en el outro va **rapado** (perfil casi a cero, 군대) — distinto de su
  silueta en la zona 4 (todavía con pelo): es el mismo chico, una hora después.
- **`neon_sign`** NUNCA produce sílabas legibles a 1× (regla L3-a). Es glow con
  forma de trazo, no fuente.
- **`market_cat`** frame 2 (lamida + mirada al vapor) es exclusivo del cosmético;
  las escenas usan 0 y 1 (regla del presupuesto §10).
- **`shutter`/`neon_sign` (off)** son el reloj diegético (L3-c); la plancha
  (`griddle_hotteok`) jamás se apaga.

## Hoja de contacto + auto-revisión

`gen_contact_sheet.py` renderiza CADA builder en tiles etiquetados sobre dos
tarjetas (clara = `steam[0]`, oscura = `asphalt[3]`), a 1× y 3×
(`out/contact_sheet_{light,dark}{,_3x}.png`). Es la herramienta de auto-revisión
del foundation phase: tras cada cambio en `common.py`, re-render → Read los PNG →
critica contra esta biblia y las fallas de L1/L2 → itera (≥3 rondas). Aceptación
por builder: lee como su objeto a 1×, usa solo ramps de PAL, contorno = OUTLINE,
el neón nunca lee como texto, y se cumplen las anclas cruzadas (이모/도윤/하나 =
mismas personas en escena y outro).
