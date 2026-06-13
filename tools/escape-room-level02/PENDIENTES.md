# Pendientes de pulido — arte Nivel 2 "El templo de la lluvia" (no blockers)

Issues *minor* que el QA por-asset y la auditoría cross-asset dejaron anotados al cerrar el set
de 22 PNGs finales (`munbeop/public/escape-room/level-02/`). **Ninguno impide shippear**: son la
lista de retoques para una pasada futura, más lo que se ve en las dos hojas de contacto de familia
(`out/family_contact_sheet_scenes.png`, `out/family_contact_sheet_objects.png`). Generado del run
de artefactos de revisión 2026-06-13. Los 22 archivos esperados están confirmados en disco.

La mayoría de las entradas de abajo son **confirmaciones positivas** (la consistencia cross-scene
se sostiene pixel a pixel) anotadas para que un revisor downstream no "arregle" algo que está bien;
unas pocas son retoques opcionales de gusto. Se marca cada caso.

## room-01-dasil + cinematic-outro — el monje 우담 (cross-scene)

- **CONFIRMACIÓN (sin cambio):** 우담 lee como la MISMA persona en `room-01-dasil` (pose `seated_tea`)
  y `cinematic-outro` (pose `gassho`), y la consistencia está *forzada de verdad*, no solo afirmada en
  la hoja de contacto. Ambas escenas componen el único builder compartido `C.monk()` de
  `common.py` — `gen_room-01-dasil.py:386` llama `pose='seated_tea'` en (132,105);
  `gen_cinematic-outro.py:349` llama `pose='gassho'` en (149,100). Render aislado de cada pose +
  diff contra los PNG compuestos: la cinta de la cabeza del monje empareja 72/72 px con 0 diferencias
  en AMBAS escenas (nada lo sobre-dibuja ni lo recolorea en composición). Invariantes de identidad
  pixel-por-pixel: hábito `rain[1]/(159,176,188)` base + `rain[2]/(110,130,143)` sombra en ambas;
  kasaya caqui `ember[2]/(242,144,74)` + `ember[3]/(199,95,51)` en ambas (sash diagonal sentado,
  banda horizontal en gassho — pose-apropiado, mismo tono); piel `wood_light[0]/(236,207,156)` +
  `[1]/(218,177,119)`; outline `(42,28,20)`. Proporción de cabeza rapada idéntica: ancho máx de piel
  = 8px en sentado Y en gassho (ambas vía el `_monk_head` compartido). Escala consistente: bbox
  sentado 25w×38h (regazo, en el suelo tras el 소반), bbox gassho 16w×34h (de pie, distante, pequeño
  contra la puerta) — siluetas distintas para poses distintas, pero el ancla de cabeza es el mismo 8px.
  No requiere acción.

- **Retoque opcional (gusto, no drift):** la reverencia 합장 está codificada como `tilt=2` en
  `_monk_head` (`common.py:370`) frente a `tilt=1` sentado. A escala final 320×240 la inclinación lee
  como un leve ladeo más que como una cabeza claramente inclinada en 합장 — el spec del dossier para
  `farewellImage` (líneas 119/126) apoya el beat emocional en "cabeza inclinada". El hint serio de
  cara baja se preserva y el spec se cumple, así que es nivel-gusto.
  - Sugerencia: si se quiere un punto más de reverencia en el plano final, en `_monk_head` profundizar
    levemente el `tilt` del gassho (o bajar la elipse de cabeza 1px / sombrear una fila más el frente
    inferior del cráneo) para que "cabeza inclinada" lea a 320×240. **Verificar que la pose sentada
    queda intacta** — no rompería identidad cross-scene porque la forma/ancho de cabeza no cambia.

- **CONFIRMACIÓN (presencia/ausencia correcta):** `C.monk()` se invoca SOLO en
  `gen_room-01-dasil.py` (seated_tea), `gen_cinematic-outro.py` (gassho),
  `gen_room-04-jongnu.py` / `-clear.py` (gassho, la escena de la campana) y `gen_contact_sheet.py`.
  Está correctamente AUSENTE de `cinematic-set`, el avatar, `cinematic-intro`, `room-02` y `room-03`.
  El easter-egg de las "dos sombras" del outro NO duplica a 우담 como segunda figura de pie: solo un
  hombre está de pie; la segunda presencia vive solo como la sombra proyectada con ala de 삿갓 sobre
  los escalones dorados (`RAIN_DEEP`, sin outline), exactamente como manda la regla absoluta. Sin acción.

## cosmetic-avatar-templecat — el gato del templo (cross-asset)

- **NOTA / retoque opcional:** el gato héroe de `cosmetic-avatar-templecat.png` es el ÚNICO gato del set
  NO producido por el builder compartido `common.cat()` — es un re-dibujo a mano ampliado (`paint_cat`,
  `gen_cosmetic-avatar-templecat.py` líneas 166-256) con el canónico `C.cat(d,1,47,frame=2)` estampado
  solo como swatch de referencia pequeño abajo-izquierda. Identidad/paleta fieles (cuerpo y swatch
  dominados por la misma rampa `#83603a / #624627 / #bd9258 / #46311b` sobre outline `#2a1c14`; orejas,
  glints dorados de ojo, nariz ciruela, cola arriba-derecha y pose "look-off" del frame 2 emparejan el
  builder), así que **no es un drift hoy**. La nota suave (también visible en la hoja de contacto) es que
  las dos patas delanteras ampliadas (líneas 217-226: rellenos de 5px + costura dura `fur_dk` + zarpas
  redondeadas) leen un poco rígidas/de-pata-de-mesa frente a las dos vlines finas del builder —
  artefacto de la ampliación, no inconsistencia. Por bypassear el builder, es el único sitio donde un
  futuro edit de `common.cat()` (recolor, reforma de orejas) NO propagaría solo.
  - Sugerencia: sin cambio de pixel necesario ahora. Opcional: suavizar las dos patas delanteras
    (afinar el borde interior / reducir la costura dura `fur_dk`) para que lean como zarpas y no como
    postes, y añadir una **nota de mantenimiento en `paint_cat`** indicando que es una ampliación manual
    de `common.cat(frame=2)` y debe re-sincronizarse si cambian la rampa de pelaje, las orejas o la pose
    del builder.

## room-04-jongnu (+ clear) — 단청 vs timber austero (dossier ↔ implementación)

- **CONFIRMACIÓN + discrepancia de brief (no de paleta):** el brief dice que el 단청 policromo aparece en
  "los postes/viga de `room-04-jongnu(+clear)`", pero `gen_room-04-jongnu.py` y `-clear.py`
  deliberadamente renderizan los dos postes del pabellón (x=10 y x=286, `paint_posts`) como timber
  `wood_dark` plano ("austere plain timber") y la viga (x=28..292, y=22, `paint_eave_and_beam`) como
  `wood_dark` plano + pincelada de tinta ilegible. Un escaneo de pixel de toda la región de arquitectura
  (0,0,320,150) devuelve **0** px `dc_green2`, **0** `dc_red1`, **0** `dc_blue` en AMBOS estados; el
  único `dc_*` es el sello rojo pequeño del panel de inscripción (`dc_red[2]/dc_red[3]`, ~56px), que usa
  la rampa `dc_red` canónica. O sea, **no hay paleta 단청 que pueda desajustarse** — el 종루 simplemente no
  lleva arquitectura 단청 pintada. La decisión es intencional y byte-idéntica en el swap lluvia/clear, así
  que es internamente consistente; se marca solo porque la arquitectura ahí no lleva el 단청 que el brief
  esperaba.
  - Sugerencia (elegir una): (a) aceptar el 종루 de timber austero como canon y **corregir la línea del
    dossier** que afirma 단청 en postes/viga del jongnu; o (b) si se quiere 단청 ahí de verdad, cambiar
    `paint_posts`/`paint_eave_and_beam` para llamar a los builders compartidos
    `dancheong_column`/`dancheong_beam` (como hace daeungjeon) para arrastrar el mismo set
    `dc_green/dc_red/dc_blue/white`. Mantener el cambio idéntico en ambos scripts para que el swap de
    estado siga siendo seamless.

## obj-diary-last + obj-beam-inscription — el sello 淸雨 (CRÍTICO §12.7)

- **CONFIRMACIÓN (re-confirmado, PASA):** se recortó la región real del sello de los PNG SHIPPEADOS (no
  solo confiando en la aserción del gen-script): `obj-diary-last.png` sello en origen (82,68) y
  `obj-beam-inscription.png` en origen (84,76), cada uno una caja 26x17. Pixel-diff de las dos cajas =
  **0** px diferentes. Inventario de color idéntico en ambas: outline `(42,28,20)`×82, dither
  `ember[2] (242,144,74)`×135, fondo persimón `ember[3] (199,95,51)`×137, trazos `white[0] (246,239,226)`×88.
  Un render lado-a-lado 8x (`out/REVIEW_seal_sidebyside_8x.png`) confirma FORMA idéntica (淸 = radical de
  agua + bloque 青/月; 雨 = techo + caja enmarcada + cuatro gotas) y COLOR idéntico (blanco sobre persimón
  con dither de tampón martillado). La única diferencia visible es el contexto que sangra en los bordes
  (hanji vs madera curtida), esperado y correcto. El sello está byte-idéntico como se requiere.
  - Nota para el registro (sin fix): los dos gen-scripts llevan una receta `cheongwu_seal()` textualmente
    idéntica y el de la viga auto-asierta symmetric-diff==0. Si la receta compartida necesitara editarse
    alguna vez, **hoistear `cheongwu_seal()` a `common.py`** para que las dos copias no puedan driftar en
    silencio.

## Familia papel + tinta (obj-diary-page, obj-diary-last, obj-beam-inscription, obj-ritual-sheet, obj-calligraphy-rain)

- **CONFIRMACIÓN (dos registros deliberados, no drift):** `obj-diary-page`, `obj-diary-last`,
  `obj-beam-inscription` y `obj-ritual-sheet` comparten el MISMO idioma de "trazo húmedo sugerido
  ilegible" (trazos torcidos 2-tonos, cabeza encharcada, beat de sílaba ilegible ~6-7px) sobre papel
  `hanji[0]/[1]` con la rampa `ink[0]/[1]/[2]` — una mano privada consistente. `obj-calligraphy-rain` en
  cambio renderiza caligrafía vertical formal SEMI-LEGIBLE ('비가 오' muriendo a mitad de trazo en 오).
  Está documentado y es correcto: la cabecera del gen-script declara que la regla L2-a (cero coreano
  legible) aplica solo a escenas 320×240, no a este close-up, y el dossier (líneas 248/836/563) define este
  asset como la caligrafía formal interrumpida del maestro. Lee como el mismo templo/mano en un registro
  distinto (mano de diario privado vs mano de pergamino formal), no como drift de fidelidad. *(En la hoja
  de contacto se ve claramente el 비/가/오 vertical, confirmando el registro semi-legible intencional.)*
  - Sugerencia: ninguna. Flag solo para que un revisor downstream **no "arregle"** la caligrafía hacia la
    ilegibilidad — es semi-legible a propósito porque es el pergamino colgante formal, mientras
    diario/viga son ilegibles porque "la letra del maestro no tiene voz" (§3 anti-melodrama).

## room-03-seungbang — consistencia papel/tinta en la escena compuesta

- **CONFIRMACIÓN (sin cambio):** el diario cerrado en escena usa el mismo builder `diary_book()` (tapa
  `wood_dark` + lazo de tela persimón `ember[3]` por el lomo + canto de hoja `hanji`), y la caligrafía
  colgante usa campo de papel `hanji[2]/hanji[3]` con las mismas columnas de pincel oscuro, la más a la
  derecha muriendo a media columna (el trazo interrumpido, ilegible a 1x por L2-a). El pergamino en escena
  es intencionalmente más cálido/tenue (`hanji[2]`) que el close-up `obj-calligraphy-rain` (`hanji[0]`) —
  documentado en `gen_room-03-seungbang.py` línea 254 ("hanji un poco más cálido que el muro para que el
  pergamino lea"); es la relación correcta escena-vs-closeup, no un drift de tono de papel. La disciplina
  de colocación del sello también se sostiene: la firma 淸雨 persimón+blanco aparece SOLO en `obj-diary-last`
  (ember3=137/white0=88) y `obj-beam-inscription` (ember3=137/white0=144); el ember3=58 de `obj-diary-page`
  es la cinta-marcador (white0=0, sin sello), y calligraphy/ritual-sheet tienen cero persimón. Sin acción.

## room-01-dasil + obj-second-cup + obj-guestbook(-signed) — té y 방명록

- **CONFIRMACIÓN (cups y diseño de close-up correctos):** la vasija de té es CONSISTENTE en la escena
  compuesta. Ambas tazas en `room-01-dasil` son el builder compartido `common.tea_cup()` — la segunda taza
  humeante en el segundo cojín (`steam=True`) y la taza sin vapor del jugador en primer plano
  (`steam=False`) — y `obj-second-cup.png` redibuja ese diseño ampliado fielmente: mismo cuenco cónico
  blanco/celadón, mismo dither celadón verde tenue encharcado en la panza inferior-derecha, mismo borde,
  mismo pie sobre platito estrecho (más estrecho que la taza para que lea como taza, no plato), misma
  voluta de vapor de 1px. El close-up también estampa un swatch de referencia `common.tea_cup()` nativo
  abajo-izquierda que empareja las tazas de sala 1:1. El diseño 방명록 ABIERTO también es internamente
  consistente entre `obj-guestbook` y `obj-guestbook-signed` (la variante firmada importa el pipeline base
  verbatim y solo añade la firma fresca húmeda + el pincel ofrecido — visible en la hoja de contacto, donde
  las dos páginas son idénticas salvo la firma nueva). Se anota solo para que el hallazgo *blocking* del
  estado del 방명록 (escena abierto-vs-cerrado, ver abajo) NO se lea como problema de builder: las props de
  té y el diseño del libro close-up están bien.
  - Sugerencia: sin acción para las tazas ni el diseño de close-up. Mantener `tea_cup()` y el guestbook
    abierto como fuente única.

## cosmetic-bg-rainsound — la linterna 49 apagada (plato de ambiente)

- **Retoque opcional (lectura más débil del set):** la linterna 49 (arriba-derecha del 7×7) es
  correctamente la ÚNICA apagada y está dirigida por builder compartido (`common.py lantern_wall`,
  `unlit_col=6/unlit_row=0`; ambas salas la llaman en `LW_X/LW_Y=206,32`). En las dos escenas de sala es
  inequívoca a 1x: luminancia ~108 vs vecina encendida ~179 (delta 71) + flip de tono fría-pizarra vs
  cálida-crema, sin halo ni núcleo brillante. En el plato `cosmetic-bg-rainsound`, sin embargo, la cortina
  de lluvia pesada comprime el contraste: la celda apagada-49 promedia `[134.8,142.1,142.3]` vs halo
  encendido adyacente `[155.3,155.2,145.4]` — solo ~14 de delta de luminancia. Sigue siendo encontrable a
  1x porque renderiza como barril pizarra RECTANGULAR nítido entre halos ámbar REDONDOS suaves (el
  contraste de forma la sostiene, el "hueco frío en el campo cálido" del dossier línea 798), pero es la
  lectura más débil de las tres. *(Confirmado en la hoja de contacto: a 0.65x la 49 cuesta de ubicar.)*
  Es el plato de ambiente, no una superficie de hotspot (el crux del Slot-3 vive en las salas daeungjeon
  donde la lectura es fuerte), así que no bloquea.
  - Sugerencia (solo si el cosmético se reusa alguna vez como fondo interactivo): en
    `gen_cosmetic-bg-rainsound.py paint_lantern_halos()`, profundizar la celda apagada-49 un paso de
    `PAL['rain']` (usar `rain[2]/rain[3]/rain[4]` para cuerpo/top/bot en vez de `rain[1]/[2]/[3]`) y/o
    contener ~1px el halo cálido de los tres vecinos de la celda (6,0). **Dejar las escenas de sala
    intactas** — ya leen con fuerza.

## Notas de la hoja de contacto de familia (este pase)

- `cosmetic-set-complete.png`: a 2x en la hoja de objetos, el elemento central de pincel/pergamino del
  collage lee algo ambiguo a tamaño pequeño (compite con el campo de cielo del bg y los marcos dorados),
  pero es nivel-gusto del collage y no afecta a ningún asset individual. Sin acción.
- `obj-second-cup.png`: el swatch de referencia `tea_cup()` abajo-izquierda es minúsculo a 2x en la hoja;
  cumple su función de referencia pero casi desaparece — esperado, no es un problema del asset.

## Reconciliación de canon (NO arte — fuera del set; flag para el dueño narrativo)

- **Conflicto de narración del outro (no es arte):** `munbeop/app/seed/escape-room/level-02.ts:532`
  (espejado en dossier:115) dice "El 방명록 sigue abierto donde lo viste al llegar", lo que presume que el
  jugador lo vio ABIERTO en el dasil y contradice el "cerrado" de §6. El arte ahora sigue correctamente §6
  (sala = cerrado) + §11 (close-up = abierto). La reconciliación de escritura/canon (el libro probablemente
  se abre/firma en el outro) pertenece al **dueño narrativo** y está fuera del set de arte — se marca, no se
  cambia.

## Higiene del pipeline (verificado, no bloquea)

- **Determinismo verificado:** los 4 scripts tocados (`gen_room-01-dasil`,
  `gen_cosmetic-avatar-templecat-strip`, `gen_obj-guestbook`, `gen_obj-guestbook-signed`) re-renderizan
  byte-idénticos en una segunda ejecución. **No se introdujo `#000000` puro** (OUTLINE=`#2a1c14`); todos los
  tonos nuevos están en paleta (`stone/rain/wood_dark/ember/hanji/gold_light`). Las dos hojas de contacto de
  familia (`gen_family_contact_sheet.py`) también re-renderizan byte-idénticas.
