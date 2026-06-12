# Pendientes de pulido — arte Nivel 1 (no blockers)

Issues *minor* que el QA y la dirección de arte dejaron anotados. Ninguno impide shippear;
son la lista de retoques para una pasada futura. Generado del run ultracode 2026-06-12.

## room_bedroom
- La mesa soban (low_table_and_note, x124,y130,58x49) sigue leyendo como aparador/comoda a 1x-3x: el tablero frontal de 34px de profundidad parece la cara de un mueble y la taza de bronce (elipse en x129-138,y131-139, BR[1] con centro BR[3]) lee exactamente como un pomo de cajon dorado pegado al borde superior — el mismo defecto que la ronda 2->3 intento arreglar moviendola. El propio agente lo reconoce como duda restante.
  - Sugerencia: En tools/escape-room-level01/gen_room_bedroom.py: reducir la profundidad del tablero a ~20-24px (subiendo la nota dentro del rect, el centro puede quedar en y~150), aclarar el tablero un paso (WL[0] base con grain WL[1]) frente al apron WL[2], y rediseñar la taza como vista 3/4 (elipse de borde HJ claro + cuerpo + asa de 2px + voluta de vapor de 3-4px con dither GL[0]) o sustituirla por un platito con caqui.
- En el futon, el 'shaded hollow' de la manta (dither BL[2] en (82,206),(80,209),(82,213) de futon()) cae parcialmente FUERA del poligono de la manta: quedan pixeles azules ajedrezados sueltos sobre el colchon HJ[1] junto a la muesca concava (74,199)-(86,204)-(79,214), que a 3x leen como pixeles perdidos/suciedad en la colchoneta blanca (visible en out/qa_futon.png).
  - Sugerencia: Recortar ese dither al interior del poligono de la manta (o rellenar la muesca con BL[2] solido antes del dither), de modo que ningun pixel azul toque el colchon HJ.
- Las dos siluetas del photo_frame (rellenos GY[1]/GY[2] en x146-168,y64-90) leen como dos frascos o botellas grises, no como halmeoni + nino; el prop pierde su carga narrativa (es decoracion de fondo, no rompe nada).
  - Sugerencia: Dar 1px de tono piel (HJ[2]) a las cabezas y separar cabeza/cuerpo con 1px de hueco, o convertirlo abiertamente en una foto sepia de paisaje (montana GR + cielo DW) que no prometa figuras.
- Higiene del script: gen_room_bedroom.py tiene 429 lineas (STYLE.md pide <= ~400) y define rng = random.Random(11) en la linea 36 que NUNCA se usa, mientras el docstring afirma 'the only scatter uses random.Random(11)' — afirmacion falsa que confundira al siguiente que toque el archivo. El resultado SI es determinista (md5 identico tras re-ejecutar).
  - Sugerencia: Borrar la linea de rng y la frase del docstring (decir simplemente 'fully deterministic, no random'), lo que ademas acerca el archivo a las ~400 lineas.

## room_living
- Retrato de halmeoni (PHOTO_MAIN, gen_room_living.py lineas 184-209): a 8x el peinado lee como melena corta/bob, no como recogido tradicional. La figura si lee como mujer en hanbok con gato (el spec pide 'siluetas simples pero reconocibles', asi que cumple), pero la lectura 'halmeoni joven' pierde fuerza.
  - Sugerencia: Aplicar el fix que el propio generador propuso: 1-2 px de monito (jjokmeori) en wd[2] detras/encima de la cabeza, p.ej. anadiendo un par de 'o' a la derecha de las filas 'hhhh' en PHOTO_MAIN.
- Continuidad del haz de luz: hay reflejo dorado en la pared bajo el alfeizar (y128-140, 348 px gold) y charco en el suelo desde y148, pero la franja del zocalo y142-147 bajo la ventana (x230-296) tiene 0 pixeles gold — la luz 'salta' el zocalo y el haz queda partido en dos.
  - Sugerencia: Anadir 1-2 filas de dither(gold_light[1]) sobre el zocalo en x~234-292, y143-146 en draw_light_pool() para conectar reflejo de pared y charco de suelo.
- gen_room_living.py tiene 578 lineas; STYLE.md (flujo de trabajo, punto 4) pide scripts '<= ~400 lineas legibles'. No afecta al asset final pero es una desviacion del proceso que el director de arte revisa.
  - Sugerencia: Compactar las tablas de pixeles (PHOTO_MAIN) o extraer helpers repetidos (marcos de foto, biseles de madera) a common.py en una pasada futura; no requiere tocar el PNG.

## room_kitchen
- La ristra de guindillas sigue sin leerse como guindillas: los rabitos verdes que el script intenta dibujar (gen_room_kitchen.py, draw_wall_props lineas 203-209) se dibujan ANTES del frame() de cada guindilla y el borde superior del frame los sobreescribe — verificado por pixel: cero pixeles del ramp green en la zona x112-130/y88-126 del PNG final. Ademas los frames de 9px de alto con paso de 7px se solapan 1px entre si, asi que el cordel (x=121) solo es visible 3 pixeles por encima del bloque superior. El resultado son 4 rectangulos rojos 4x7 encadenados en zigzag, no una ristra.
  - Sugerencia: En draw_wall_props: dibujar el punto verde del rabito DESPUES del frame de cada guindilla; separar las guindillas 2-3px (px en pasos de 9-10) para que el cordel WOODD[3] asome entre ellas; y afilar cada guindilla (3px arriba, 2px en medio, 1px de punta) en vez del rect 4x7.
- El trapo (draw_towel, lineas 162-182) confirma la duda del autor: a 8x lee como ventanita o calendario colgante. Causas concretas: frame(183,100,15,26) cierra la silueta en un rectangulo perfecto (el 'dobladillo ondulado' de y=124 queda DENTRO del contorno recto, invisible como silueta); y la columna dither de 4px (193,103,4,21) ocupa un tercio del ancho y lee como malla/mosquitera de ventana, no como pliegue de tela.
  - Sugerencia: Romper el contorno inferior: dejar la base del frame abierta y dibujar el borde con 2-3 muescas (hem irregular de 1px). Sustituir la columna dither por 1-2 vlines BLUE[2] de pliegue. Hacer la tela 2-3px mas estrecha que la barra para que los extremos de madera asomen a ambos lados.
- El vapor del cuenco de arroz (draw_bowl, lineas 490-491) son 5 puntos HANJI[0] sueltos en x242-252/y148-157 que caen sobre el frente GRIS del fogon (el fogon ocupa x204-272/y128-158 justo detras del cuenco). En el render leen como motas blancas sueltas pegadas al horno, desconectadas del arroz (borde del cuenco en y~161), no como vapor.
  - Sugerencia: Agrupar el vapor en 1-2 volutas de 2px pegadas al monticulo (y156-160, a <=4px del arroz) como se hizo con la olla, o eliminarlo: el vapor de la olla ya cubre la narrativa de 'cocina recien usada'.
- Consistencia con los close-ups: STYLE.md (tabla de consistencia) especifica 'cuenco hanji[0]' y el close-up objects/obj-bowl.png usa hanji[0] como color dominante del cuerpo, pero en la escena el cuerpo del cuenco es HANJI[1] (draw_bowl lineas 465-466) con solo highlights hanji[0]. Un paso de ramp dentro del mismo crema — leve, pero es exactamente lo que el director de arte va a comparar.
  - Sugerencia: Subir el cuerpo del cuenco a HANJI[0] con sombreado HANJI[1]/[2] en el lado derecho, y diferenciar el arroz del cuerpo con mas puntos METAL[0]/hanji[1] de grano en vez de por tono base.

## room_entrance
- tools/escape-room-level01/gen_room_entrance.py tiene 418 lineas no vacias frente a la guia '<= ~400 lineas legibles' de STYLE.md (flujo de trabajo, punto 4). Es un 4.5% por encima de una cota explicitamente aproximada, asi que no bloquea, pero es el script de habitacion mas largo del pipeline.
  - Sugerencia: Si se quiere cumplir estrictamente: comprimir las tablas de pliegues del paraguas y los toques de grano del riser en bucles parametrizados, o mover SNEAKER/GOMUSIN a common.py como sprites compartidos (~20 lineas).
- Las gomusin (filas GOMUSIN, 7 px de alto, pintadas en (71,197) y (90,197)) son el sprite mas plano de la escena: la punta respingona (kkokji) es un nub de 2x2 px que casi desaparece a 1x, y a 6x leen mas como 'bandejas blancas con relleno rojo' que como calzado tradicional iconico. Legibles si, memorables no — justo por debajo del liston Stardew que el resto de la escena si alcanza.
  - Sugerencia: Subir el mapa a 9 px de alto: 2 px extra para curvar la punta hacia arriba con OUTLINE y un acento RED[3] en el borde de la boca, manteniendo el cuerpo HANJI[0].
- En paint_door (lineas 153-154), los dithers dorados de la luz que se cuela bajo la puerta se pintan en y185-187, ENCIMA del cuerpo del riel (fill y185-188), no debajo: el riel mismo chispea en oro. A 3x lee aceptablemente como umbral iluminado, pero a 6x (qa_r4_door_bottom.png) el riel pierde solidez de madera.
  - Sugerencia: Dejar intacta la hline WOODD[0] de y185 y ditherar solo y186-188, o bajar el destello a y188 + 1 fila sobre la piedra (y189) para que la luz pase 'por debajo' del riel y no a traves de el.
- La sombra del candado sobre la puerta (combo_lock, linea 459: dither WOODL[3] en y148-150, 24 px de ancho) lee a 6x como un fleco de guiones colgando del cuerpo, porque la fila superior toca el borde inferior del candado en toda su anchura. A 3x es casi invisible, asi que es solo pulido.
  - Sugerencia: Reducir a 2 px de alto empezando en y149, o estrechar 2 px por lado (x156, w=20) para que se separe de la silueta y lea como sombra proyectada.

## cinematics
- El reflejo del sol sobre el mar sigue siendo mecanico en ambas escenas (sea_band, lineas ~92-102): el jitter ((row*13)%5)-2 es un ciclo de periodo 5 que produce deriva diagonal sistematica. En cinematic-outro.png (sol x=262) el destello forma 3 trazos diagonales paralelos bajando hacia la izquierda (verificado en zoom 8x, parece un arananzo); en cinematic-intro.png (sol x=226) es un grumo denso sesgado a la IZQUIERDA del eje del sol en vez de una columna de brillo centrada bajo el disco. El propio generador lo admite en su autocritica ('clump algo denso en su zona central').
  - Sugerencia: Sustituir el jitter modular por la rng sembrada que ya se usa en los destellos de la calle del outro: por cada 2 filas dibujar 1-2 dashes de 1-3px centrados en sun_x con desplazamiento aleatorio pequeno y simetrico (r.randint(-2,2)), ancho decreciente con la profundidad, saltando filas al azar. Eso da la columna de glitter rota e irregular tipo Stardew.
- En cinematic-outro.png los dos cables del poste (lineas ~613-616) cruzan POR DELANTE del tejado del edificio A en primer plano (atraviesan la pendiente de tejas en y~68-84, x 0-150, con quiebro visible en mitad del tejado; verificado en zoom 6x). Es defendible en profundidad (la base del poste y=186 esta mas cerca de camara que la base del edificio y=150) y los cables cruzando cielo son un motivo muy Ghibli, pero a trazo OUTLINE pleno sobre las tejas grises leen como rayaduras sobre el tejado mas grande del encuadre.
  - Sugerencia: O bien subir los puntos de comba para que los cables crucen solo cielo (p.ej. de (296,76) a (150,52) a (0,58), por encima del caballete del edificio A), o bien atenuar el tramo que pisa el tejado usando PAL['gray'][3] en vez de OUTLINE en x<150, manteniendo OUTLINE contra el cielo.
- tools/escape-room-level01/gen_cinematics.py tiene 546 lineas no vacias, por encima de la guia de STYLE.md flujo punto 4 ('<= ~400 lineas legibles'). La justificacion del generador (dos assets de la tabla en un script) es razonable y el codigo esta bien factorizado (building_shell, giwa_roof, paper_lantern compartidos), pero la guia existe por script.
  - Sugerencia: Si se quiere cumplir la letra: mover los helpers compartidos de escena exterior (dawn_sky, sun, mountains, sea_band, giwa_roof, lattice_window, paper_lantern, smoke_column, stone_wall) a common.py o a un cinematics_lib.py, dejando gen_cinematics.py en ~300 lineas de composicion. No bloquea: la densidad por linea es buena y el script es determinista.

## notes
- note-02: la cinta adhesiva no lleva ningun anclaje de contorno en su perimetro exterior (decision deliberada del generador). A 1x, la mitad superior de la cinta — la que queda sobre fondo transparente, filas y≈3-8, x≈47-81 — se ve levemente flotante/borrosa porque su silueta es checkerboard 50% sin borde. Es defendible por la regla de translucidez (dither, no alpha), pero es la unica parte de los 4 sprites cuya silueta no toca OUTLINE (regla dura 2 de STYLE.md).
  - Sugerencia: Anadir un contorno DITHERED (OUTLINE en (x+y)%2==0) solo en el perimetro exterior de la cinta, o densificar el borde rasgado superior con TAPE[2] al 100% en esas 2 filas. Conserva la translucidez y ancla la silueta. El propio generador ya propuso este fix en draw_tape().
- note-final: las colas del lazo (draw_thread_bow, bucle final de gen_notes.py lineas 384-388) son diagonales de 1px de rojo + 1px de OUTLINE y a 8x leen como patitas de insecto mas que como cintas cayendo. A 1x son casi invisibles (quedan como 2 motas oscuras bajo el nudo), asi que apenas aportan al 'lacito'.
  - Sugerencia: Engrosar cada cola a 2px de cuerpo rojo (RED[1]+RED[2]) con OUTLINE solo en el lado exterior, o alargarlas 2px con una punta en V; alternativamente eliminarlas y dejar solo los dos bucles, que ya leen perfectamente como lazo.
- gen_notes.py mide 483 lineas totales (413 sin lineas en blanco, 397 sin comentarios). La autocritica reporto '413 lineas', que solo cuadra contando no-vacias; el limite blando de STYLE.md es '<= ~400 lineas legibles'. No afecta al arte, pero el reporte es enganoso y el script esta ~20% sobre el presupuesto si se cuenta como lineas totales.
  - Sugerencia: Si se vuelve a tocar el script: compactar HEART a una lista de tuplas, fusionar col_row_max/col_min en una pasada, y reportar el conteo total honesto. No requiere regenerar assets (salida identica).

## objects_a
- Las greñas de la hogaza (líneas 233-236) son líneas diagonales de 1px en BRASS[3]/GOLD[0] que quedan casi enterradas bajo el dither GOLD: en el preview 3x se leen como motas sueltas, no como cortes de horneado. La hogaza sigue leyéndose como pan por contexto (plato + rebanadas + dorado), pero pierde el detalle de superficie que tendría un pan de Stardew.
  - Sugerencia: Engrosar cada greña a 2px (línea BRASS[3] con línea GOLD[0] pegada debajo como labio iluminado) y limpiar el dither GOLD[1] 1px alrededor de cada corte para que respire.
- obj-fridge.png ocupa 79% del ancho del canvas (bbox x13..113), 1 punto por debajo del ~80-90% pedido; el alto (86%) sí cumple. Coincide con la auto-crítica del generador: el tirador ya está en x=13.
  - Sugerencia: Ensanchar el cuerpo 1px a la derecha (x44..112) o desplazar puerta+tirador 1px a la izquierda; con 80%+ exacto se elimina la discusión.
- El cucharón colgado bajo la alacena (elipse 71..82 × 115..124) se lee a 1x como un disco/pomo de madera más que como cucharón: el cazo es casi circular y el interior WOOD[3] apenas contrasta. Es prop secundario y no compromete la lectura de las tazas, pero es el elemento más débil del set.
  - Sugerencia: Achatar el cazo 1-2px (elipse más ancha que alta), subir el contraste del hueco usando WOODD[2] en vez de WOOD[3], y dejar 1px de brillo WOOD[0] en el borde superior del cazo.
- Consistencia con room-03-kitchen.png: la nevera de la habitación es de DOS puertas (congelador arriba, con dos tiradores verticales), mientras el close-up muestra una sola puerta de altura completa con una única cavidad. Los requisitos críticos (crema + tirador metal) se cumplen y la física de bisagra es coherente (bisagra izquierda, tirador en el canto libre), pero el director de arte podría notar el cambio de configuración al pasar de la escena al close-up.
  - Sugerencia: Añadir una línea horizontal de separación HANJI[2]+HANJI[3] cerca de y~40 en puerta y cuerpo sugiriendo el módulo congelador cerrado arriba, o aceptar la licencia de close-up y anotar la decisión en el script.

## objects_b
- obj-bowl: el contraste arroz/ceramica sigue siendo bajo. RICE_HI (#fffdf6) vs el cuerpo del cuenco HANJI[0] (#faf3e3) difieren ~5-19 por canal; a tamano reducido (simulacion 64px sobre fondo calido) el monticulo y el cuenco se funden en una sola masa crema y la lectura 'arroz sobre cuenco' la sostienen solo la linea OUTLINE del labio (y=52) y el grano hanji[1]. Lee, pero no 'brilla' como pide el spec ('arroz blanco brillante').
  - Sugerencia: Bajar la zona iluminada del cuerpo del cuenco un paso (usar HANJI[1] #f1e5cb como base del lado izquierdo en gen_kitchen_objects_b.py build_bowl, lineas 254-271, reservando HANJI[0] solo para el glint vertical) para que RICE_HI quede como el unico casi-blanco del sprite.
- Consistencia de valor con room-03-kitchen.png (que YA existe, contrario a la duda del generador): la olla de la escena es predominantemente METAL[3] #5d646e (484 px) con banda METAL[2], mientras el close-up es predominantemente METAL[2] #878f9a con sombra METAL[3]. Ademas la tapa de la escena es una elipse baja y la del close-up un domo alto. Identidad (metal oscuro + tapa + pomo de laton + asas) se mantiene, pero un director de arte notara el flip de valor.
  - Sugerencia: O bien oscurecer el cuerpo del close-up un paso (base METAL[3], banda de luz METAL[2]/[1], especular METAL[0]) en build_pot lineas 107-121, o bien aclarar la olla de gen_room_kitchen.py; decidir una receta unica ('cuerpo metal[3], luz metal[1]') y anotarla en STYLE.md seccion de consistencia.
- obj-bowl: los palillos sujeo son demasiado gruesos — nucleo de 4 px (d.line width=4, lineas 311-317) + contorno = ~6 px de ancho a 128px; en zoom 8x leen como cuchillos de mantequilla. Ademas la cabeza de laton del palillo inferior (88,95) queda medio enterrada en el borde del platito y se lee como un bulto.
  - Sugerencia: Reducir el nucleo a width=2-3 con highlight de 1 px, y subir el extremo decorado del palillo inferior 2-3 px para que la cabeza de laton despegue del canto del platito.
- obj-pot: bbox opaco de 97x117 px = 76% x 91% del canvas; el ancho queda por debajo del '~80-90%' del spec (las asas terminan en x=16/x=112). El alto 91% y el centrado (centro bbox 64,63) son correctos, asi que el impacto visual es pequeno.
  - Sugerencia: Si se retoca por otro motivo, ensanchar cuerpo+hornilla ~4-6 px por lado (o alargar las asas) para entrar de lleno en la franja 80-90%; no merece re-render por si solo.

## clocks
- Las 8 marcas horarias intermedias (gen_clocks.py _marks, ticks de 3px en WOODD[1] #83603a, radio 27-29) casi desaparecen cuando el sprite se ve a 1x (96px): en obj-clock-0700.png y obj-clock-1100.png la hora se apoya solo en la direccion de la manecilla porque el tick del 7/11 apenas contrasta con la esfera hanji #f1e5cb. A 3x leen bien, asi que solo es pulido.
  - Sugerencia: Oscurecer los ticks a WOODD[2] (#624627) o alargarlos 1-2px hacia el centro (radio 25-29) en tools/escape-room-level01/gen_clocks.py linea ~150.
- Mezcla leve de convenciones de apoyo: el reloj lleva colgador de pared arriba (_hanger) y a la vez una sombra de contacto elipsoidal de 53px de ancho en su fila superior (_contact_shadow, half=26) cuando el punto de tangencia real del circulo con el suelo es de ~13px. Leida como sprite de close-up funciona, pero un director de arte podria pedir coherencia (o cuelga o se apoya).
  - Sugerencia: Reducir los half-widths de la sombra a algo tipo (18, 14, 9) para que lea como contacto y no como sombra proyectada, o quitar el colgador. Cambio de una linea en _contact_shadow de gen_clocks.py.

## locks
- Ocupacion horizontal por debajo del rango del spec (~80-90%): el bbox mide 73% de ancho en lock-closed.png (x 18-110) y 77% en lock-open.png (x 12-110, e incluye un sparkle). La altura si cumple (90%/93%). Un candado es naturalmente vertical, asi que se lee bien, pero el cuerpo deja margenes laterales de ~18px vacios.
  - Sugerencia: Si el director de arte quiere mas presencia, ensanchar BODY ~4-5 px por lado en tools/escape-room-level01/gen_locks.py (BODY, PANEL, WHEEL_X0 con hueco de 4px) — el diseño actual lo tolera sin redibujar nada mas. Si no, aceptar como esta: la dimension dominante cumple.
- Los 3 destellos dorados del estado abierto casi desaparecen a 64px (en out/preview_locks_64px.png solo sobrevive un punto palido del sparkle grande; los de r=2 se reducen a 1-2 px sueltos). El estado sigue leyendose al instante por el arco, asi que no bloquea, pero el 'premio' visual de abrirlo pierde fuerza al tamano de juego.
  - Sugerencia: Subir el sparkle principal a r=4 con nucleo 2x2 GOLD[0] (o anadir las diagonales GOLD[0] tambien a los de r=2) para que al menos dos destellos sobrevivan el downscale NEAREST a 64px.
- Consistencia con room-04-entrance.png (regla de 'Consistencia entre assets' del STYLE.md): el candado de la puerta tiene ruedas oscuras con marcas claras y un acento ROJO centrado abajo, mientras el close-up tiene ruedas claras (banda M[0]) con marcas oscuras y la pegatina de flor ROSA abajo-izquierda. A 320x240 la simplificacion es razonable, pero el acento rojo vs rosa y los valores invertidos del panel son lo primero que un director de arte compararia.
  - Sugerencia: En gen_room_entrance.py, cambiar el acento del candado de la puerta a PAL['pink'][1] y moverlo abajo-izquierda (1-2 px bastan a esa escala), y aclarar la banda central de las ruedas a metal[0] para que ambos assets cuenten el mismo objeto.

## cosmetic_bg_frame
- cosmetic-bg-sunrise.png: la 'cumbrera curva tipica' pedida por el spec apenas existe. roof_y() aplica un sag de solo 3px sobre los 143px del tramo de cumbrera (x=88..231), asi que a 1x la cumbrera lee como una linea recta; toda la curvatura hanok la aportan las pendientes laterales y los kicks de alero. La curva caracteristica del yongmaru (que sube hacia los ornamentos de los extremos) no se percibe.
  - Sugerencia: En tools/escape-room-level01/gen_cosmetic_bg_frame.py, roof_y(): aumentar el sag central a 5-6px o, mejor, elevar 2-3px los extremos de la cumbrera justo antes de los bloques chimi (RIDGE_L/RIDGE_R) para que la curva concava se lea a 1x.
- cosmetic-bg-sunrise.png: los anillos del halo del sol (dither_disc r=38/30/22 centrados en 118,146) muestran facetas planas en las 4 diagonales (el borde del checkerboard recorta el circulo en escalones de 45 grados), visibles a partir de 4x y levemente perceptibles a 1x en el anillo exterior DAWN[1] contra el cielo crema. Es el punto que el propio generador dejo anotado como duda.
  - Sugerencia: Recortar 1-2px el radio efectivo en las posiciones diagonales (p.ej. usar r2 - ((dx*dy) != 0) o un radio por octante) o desfasar el phase de cada anillo para romper la coincidencia de facetas entre anillos concentricos.
- cosmetic-frame-apron.png: el lacito (bow() en cx=83,cy=84) lee bien a 2x pero a 1x los dos lazos elipticos de 8x6 con highlight central leen como dos bolitas/cerezas junto a un cuadrado rojo; la lectura 'lazo de delantal' tarda mas de medio segundo a tamano real de avatar pequeno.
  - Sugerencia: Afinar cada lazo 1px en el lado que toca el nudo (forma de gota apuntando al nudo en vez de elipse completa) y mover el highlight PINK[0] hacia el borde superior-exterior del lazo para insinuar el pliegue.
- cosmetic-frame-apron.png: las muescas de las colas del lazo se perforan con alpha 0 (pixeles (79,92),(80,92),(86,92),(87,92)), pero las colas estan dibujadas SOBRE la tela opaca del borde inferior: la muesca deberia revelar la tela rosa de detras, no transparencia. Sobre una pagina de fondo claro esos 4 pixeles leen como dos agujeritos blancos dentro del borde del marco.
  - Sugerencia: En bow(), rellenar los pixeles de muesca con PINK[0] (la tela que queda detras de la cola) en lugar de (0,0,0,0); la silueta de la muesca la siguen dando los 2 pixeles OUTLINE de encima.
- cosmetic-frame-apron.png: el spec pide 'esquinas con puntada visible' y solo hay puntada X en 3 esquinas (7,6),(88,6),(7,87); la inferior derecha la ocupa el lazo. Es una decision de diseno defendible (el lazo es el foco de esa esquina), se anota solo para que quede registrado como desviacion consciente del spec.
  - Sugerencia: Opcional: anadir una mini-puntada de 2px asomando por encima del lazo en (88,79) aprox., o dejarlo como esta y anotarlo en el docstring del script.

## cosmetic_avatar
- El puño (23,3)-(26,5) más el cordel de 1px se leen como gancho/bastón corto en vez de mano cerrada, sobre todo a 1x: el contorno del puño se curva hacia la izquierda y se funde visualmente con el contorno de la tapa de la linterna (confirmado en out/debug_avatar_light_static.png a 5x; es la duda residual que el propio generador admitió). La acción 'sostiene la linterna en alto' sigue leyéndose, así que no bloquea.
  - Sugerencia: Separar las dos lecturas: añadir 1px de rim NIGHT[0]/DAWN[0] en el borde inferior del puño (el lado que mira a la linterna) y dejar 1px de hueco con glow entre puño y cordel, o engrosar el puño 1px hacia abajo con un nudillo NIGHT[1] para que pese como mano y no como remate.
- El anillo exterior del glow (dither 25% con GOLD[2] #e8b45e, radio 15) se desintegra en puntitos sueltos tipo confeti sobre fondos claros — visible en out/debug_avatar_light_static.png sobre hanji[1]: el halo pierde continuidad y fuerza fuera del núcleo. Sobre fondo oscuro funciona perfectamente.
  - Sugerencia: En la corona exterior usar densidad 50% en un anillo más fino (r a r-2) en vez de 25% en todo el disco, o cambiar el color del anillo exterior a dawn[1] (#f8c89a) que contrasta menos agresivamente sobre cremas y mantiene el halo legible en ambos fondos.
- El cordel (vline x=22, y=6..10, WD[3] #46311b) es casi invisible sobre fondos oscuros: en out/debug_avatar_dark_static.png se pierde contra el azul noche porque solo lo respaldan motas de glow al 25% en esa zona. El enlace puño→linterna queda implícito solo por proximidad.
  - Sugerencia: Aclarar el cordel a WD[1] (#83603a) o BRASS[2] (#b08334), o colocar 1px de GOLD[2] a cada lado del cordel para retroiluminarlo dentro del halo.
- En el frame 2 del strip, la chispa SPARKS[2] con offset (11,5) cae en (33,25), pegada al contorno del pecho/bufanda de la figura: lee como ruido adherido a la silueta en lugar de mota flotando en el aire (visible en out/debug_avatar_dark_strip.png, tercer frame).
  - Sugerencia: Mover ese offset 2-3px a la izquierda (p.ej. (8,5) -> (30,25)) para que la mota quede claramente despegada del borde de la silueta.

## cosmetic_set
- El tercer cosmetico del set (cosmetic-bg-sunrise) es el mas dificil de identificar en el collage: el sol queda 100% oculto tras el frame/avatar (centro del sol cae en ~(42,75) del canvas, bajo la ventana del apron) y solo se lee como bg por el anillo de gradiente rosa->crema de ~10px en los laterales y unas esquirlas de tejado en la zona baja, parcialmente tapadas por las colas de la cinta. El halo dorado dithered compensa bien como 'sol sustituto', pero un jugador no reconoceria el bg-sunrise concreto que esta desbloqueando.
  - Sugerencia: Bajar el recorte unos 10-16px (p.ej. bg.crop((44,16,276,248)) clampado a 240) para que la silueta del tejado hanok suba mas en las franjas laterales y el gradiente del cielo siga visible arriba; mantiene la escala NEAREST 1/2 exacta y no toca frame ni cinta. No recomiendo reescalar el frame a 72-80px: romperia el gingham con escala no entera.
- La banda de la cinta (y=99..120) solapa 5px el borde inferior del apron y corta por la mitad el lazo rosa y el bolsillo del frame (filas 99..103 del canvas). A 1x el lazo queda como un grumo rosa tangente al canto superior derecho de la banda en vez de leerse como lazo.
  - Sugerencia: Bajar RIBBON 2px (y0=101) o recortar el solape a ~3px: los bucles del lazo recuperan su silueta redonda y la sombra de contacto dithered sigue cabiendo en y<=121.
- Las colas de la cinta siguen leyendose oscuras a 1x pese al fix de la ronda 2->3: cada cola tiene solo 6-9px utiles con OUTLINE en tres cantos + columna de sombra brass[2] + una unica fila de brillo brass[0], asi que en el asset a tamano natural se ven como munones marrones mas que como tela dorada plegada (en el zoom 6x si se leen bien).
  - Sugerencia: Anadir una segunda fila de brillo brass[0] hacia el tercio superior de la cola o sustituir la columna de pliegue brass[2] por brass[1]; con eso el ratio claro/oscuro de la cola se acerca al de la banda principal.
- El anillo visible del bg sobre el frame es asimetrico: 10px en los laterales pero solo 2px arriba (frame en y=8 con interior desde y=6), y esa franja de 2px es justo el malva mas oscuro del cielo, que a 3x se lee como una linea sucia pegada al ribete del apron mas que como cielo.
  - Sugerencia: O subir el frame a y=6 para que toque el anillo OUTLINE y eliminar la esquirla, o ensancharla a 3-4px bajando frame+cinta 1-2px para que el malva se lea como banda de cielo intencional.

## Addendum — QA de aplicación 2026-06-13 (verificación al integrar en el repo)

Hallazgos *minor* nuevos del pase de verificación multi-agente al aplicar el pipeline
(6 revisores; 0 blockers; horas de los 5 relojes verificadas correctas; los 16 hotspots
contienen el centro visual de su objeto). Mismo criterio: nada impide shippear.

### room_bedroom
- La tela rosa colgada del soporte del poste (x85-100, y65-100 aprox a 1x) lee como banner/tela genérica
  sin detalle interno que la desambigüe (¿toalla? ¿bolsa?). Decorativa y no interactiva; es el prop menos
  identificable de la escena.

### room_living
- Los rects de seed `note-2` [120,110,40,30] y `phone` [100,130,40,30] se solapan en x120-140/y130-140,
  y la esquina superior derecha del teléfono (bbox x106-133, y134-149) cae dentro del rect de note-2:
  un click en esa esquina podría disparar el puzzle 2 según la prioridad del hit-test. Los centros visuales
  de ambos objetos están inequívocamente dentro de su propio rect, así que no bloquea.
  - Sugerencia: en `munbeop/app/seed/escape-room/level-01.ts`, recortar note-2 a alto 23 (y110-133) o mover
    el teléfono de la escena 2px abajo-izquierda en gen_room_living.py.
- El marco pequeño superior-izquierdo de la pared (~x17-37, y58-87) tiene el mismo defecto "siluetas leen
  como frascos" documentado para el photo_frame del bedroom; aplicar el mismo fix si se retoca.

### room_kitchen (hotspots generosos, no desalineados)
- `obj-bowl` [220,170,60,50]: el borde superior corta el montículo de arroz (lo más saliente del sprite,
  base y~162-170) y el tercio inferior del rect cae sobre las puertas del mueble.
  - Sugerencia: subir el rect a [215,158,60,40] en el seed para que abrace arroz+cuenco.
- `obj-table` [130,130,70,60]: el borde superior biseca la hogaza (y125-143); subir a y~124 cubriría el pan entero.
- `obj-pot` [200,100,70,60] cubre todo el fogón (puerta de horno incluida), no solo la olla. Generosidad
  aceptable de point-and-click; solo para conocimiento.

### Consistencia escena ↔ close-ups (licencias no documentadas arriba)
- Alacena: en la escena tiene la puerta izquierda cerrada y las 3 tazas repartidas en dos baldas; el close-up
  muestra ambas puertas abiertas, las 3 tazas juntas arriba y un riel de toalla que la escena no tiene.
  Misma licencia que la nevera 1-puerta/2-puertas ya aceptada (que solo documenta la nevera).
- Mesa: la escena pone palillos de metal junto al plato (draw_table, "palillos de metal", líneas 411-415)
  que a escala leen como guiones grises rotos; el close-up pone un cuchillo de mango de madera y dos
  rebanadas que la escena no tiene. Decidir un utensilio único si se retoca.
- Cuenco: además del paso de color ya documentado, la presentación difiere (escena: cuenco bajo y ancho
  directo sobre la encimera; close-up: cuenco alto sobre platito de madera con sujeo). Lee como el mismo
  objeto; solo para el director de arte.
