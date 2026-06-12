# Biblia de estilo — Escape Room Nivel 1 «Una mañana en el minbak (민박)»

Referencia obligatoria para todo `gen_*.py` de esta carpeta. Fuente narrativa:
`docs/escape-room.md` §8 (estética) y §12 (dossier del nivel). Datos de runtime:
`munbeop/app/seed/escape-room/level-01.ts` (rects de hotspots en espacio 320×240).

## Tono y referencia visual

- **Stardew Valley × Mother 3**: cálido, detallado, suave, slice-of-life. NO retro-arcade duro, NO terror.
- Momento del día: **amanecer dorado**. La luz entra por las ventanas y baña los interiores con tonos crema/melocotón.
- Es la casa de una halmeoni (abuelita coreana): todo se ve cuidado, modesto, vivido y acogedor.

## Reglas duras (un QA las verifica una por una)

1. **Solo colores de `common.PAL`** (+ `OUTLINE`, `SHADOW`). Si necesitas un tono nuevo,
   derívalo oscureciendo/aclarando un ramp existente y déjalo anotado en el script.
2. **Contorno** de objetos y muebles: `common.OUTLINE` (#2a1c14). **Prohibido #000000 puro.**
3. **Sin alpha-blending suave**: las transiciones se hacen con `dither()` (checkerboard) o bandas de color.
4. **Sombras cálidas** (`drop_shadow`/tonos del mismo ramp), nunca grises azulados — excepto acentos nocturnos del avatar.
5. Tamaños exactos (ver tabla de assets). Nada de reescalar al guardar: se pinta a resolución base.
6. Escenas (320×240): opacas, sin píxeles transparentes. Sprites/close-ups: **fondo transparente** salvo que se indique tarjeta.
7. Texto dentro del arte: evitarlo. Las notas llevan **garabatos ilegibles** (líneas de tinta), porque el texto real
   lo pone la UI y varía por candidato. Excepción: hangul decorativo dibujado a mano ≥16 px de alto si el spec lo pide.
8. Detalle denso pero legible: cada superficie grande lleva textura (`wood_planks`, `hanji_wall`, flecks),
   cada mueble proyecta sombra de contacto, y los puntos de interés tienen el mayor contraste de la escena.

## Composición de escenas interiores (las 4 habitaciones)

- Perspectiva frontal plana (como interiores de Stardew): pared trasera arriba, suelo abajo.
- Línea pared/suelo aprox. en y≈140–155; zócalo de madera de 4–6 px en la unión.
- Paredes: textura hanji (`hanji_wall`) con vigas de madera (`wood_light`) enmarcando paneles.
- Suelo: ondol cálido (`floor` ramp) con `wood_planks` sutil y un charco de luz dorada dithered
  proveniente de la ventana de la escena.
- **Hotspots**: cada objeto interactivo debe quedar con su centro visual dentro del rect dado.
  Renderiza SIEMPRE el overlay `hotspot_debug()` y revísalo antes de dar por buena la imagen.
- Densidad mínima: ≥12 props distinguibles por habitación (muebles, plantas, utensilios, cuadros…).

## Flujo de trabajo obligatorio por script

1. `python tools/escape-room-level01/gen_<clave>.py` desde la raíz del repo.
2. El script guarda: asset final (`save_asset`), preview 3× (`preview`) y, si es habitación,
   overlay de hotspots (`hotspot_debug`).
3. **Mira el preview con tus propios ojos** (herramienta Read sobre `tools/escape-room-level01/out/preview_*.png`),
   critica contra esta biblia y el spec, e itera. Mínimo 3 rondas de render→mirar→mejorar.
4. Mantén el script determinista (sin `random` sin semilla) y ≤ ~400 líneas legibles.

## Tabla de assets (22)

| Archivo (bajo `munbeop/public/escape-room/level-01/`) | Tamaño | Fondo |
|---|---|---|
| rooms/room-01-bedroom.png | 320×240 | opaco |
| rooms/room-02-living.png | 320×240 | opaco |
| rooms/room-03-kitchen.png | 320×240 | opaco |
| rooms/room-04-entrance.png | 320×240 | opaco |
| rooms/cinematic-intro.png | 320×240 | opaco |
| rooms/cinematic-outro.png | 320×240 | opaco |
| objects/note-01.png … note-03.png, note-final.png | 128×128 | transparente |
| objects/obj-fridge.png, obj-table-bread.png, obj-cupboard.png, obj-pot.png, obj-bowl.png | 128×128 | transparente |
| objects/obj-clock.png (8:00) + variantes -0600/-0700/-0930/-1100 | 96×96 | transparente |
| objects/lock-closed.png, lock-open.png | 128×128 | transparente |
| cosmetics/cosmetic-bg-sunrise.png | 320×240 | opaco |
| cosmetics/cosmetic-frame-apron.png | 96×96 | transparente (ventana central) |
| cosmetics/cosmetic-avatar-lantern.png (+ strip 4 frames 256×64) | 64×64 | transparente |
| cosmetics/cosmetic-set-complete.png | 128×128 | transparente |

## Consistencia entre assets (lo revisa un director de arte)

- Los 5 objetos de cocina en close-up son LOS MISMOS que aparecen en `room-03-kitchen.png`
  (mismos colores base: nevera crema con puerta `hanji[1]` y tirador `metal`, mantel con rayas `red`,
  alacena `wood_light`, olla `metal` oscuro con tapa, cuenco `hanji[0]` con arroz).
- Las 4 notas comparten el mismo papel hanji y la misma tinta; cambian el plegado/los detalles
  (la final cuelga de un **hilo rojo**, `PAL["red"]`).
- El candado de `room-04-entrance.png` es el mismo objeto que `lock-closed.png`.
- Las cinemáticas y `cosmetic-bg-sunrise` comparten el mismo cielo de amanecer (`PAL["dawn"]`).
