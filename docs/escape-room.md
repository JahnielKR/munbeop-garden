# Escape Room Coreano — Diseño Completo

> Mini-juego embebido en la plataforma de gramática coreana. Documento maestro de diseño, mecánicas, producción y roadmap.
> Última actualización: 2026-06-11 (v3 — hub de juegos como cartas, libreta de niveles, sistema narrativo, implementación V1 completa)

## v3 — Decisiones de UX nuevas (implementadas)

### Hub de juegos como cartas — `/practice`

`/practice` ya no es la ruleta: es el **área de selección de modos**. Cada juego es una **carta** (`GameCard.vue`): cover pixel art o emoji, nombre, descripción de una línea. Click → abre la página del juego.

| Carta | Ruta | Estado |
|---|---|---|
| 🎲 La Ruleta | `/practice/ruleta` | Viva (el juego clásico movido aquí) |
| 🗝️ Escape Room | `/escape-room` | Viva (libreta de niveles) |
| 🌱 ??? | — | Bloqueada ("próximamente") |

### Libreta de niveles — `/escape-room`

El selector de niveles es una **libreta hojeable** (`LevelBook.vue` + `LevelPage.vue`): espiral en el lomo, una hoja por nivel, animación de pasar página (flechas + teclado).

Cada hoja muestra: **cover** (foto pegada con cinta), número de nivel + badge TOPIK, **título**, **mood**, **tagline narrativo** (el hook), las **4 recompensas por tier**, los **intentos disponibles** (♥♥♥ = maxErrors + 1) y el botón **▶ START** que entra al juego (`/escape-room/play?level=<id>`). Niveles futuros muestran un sello "Próximamente" en lugar de START.

El registry vive en `app/seed/escape-room/registry.ts` (`LEVEL_REGISTRY`): 10 entradas, 1 jugable + 9 anunciadas.

### Sistema narrativo

Cada `Level` lleva ahora: `tagline` (hook de libreta), `intro`/`outro` (narrativa ambiental multipárrafo, separador `\n\n`) y `voiceIntro`/`voiceOutro` (líneas KO del NPC, futuras pistas TTS).

Flujo en juego: **cinemática de entrada** (`IntroCinematic.vue`, typewriter párrafo a párrafo, tap para avanzar, botón saltar) → gameplay → **pantalla de victoria** (`VictoryScreen.vue`: outro narrativo + tier + cosmético desbloqueado) o **game over suave** (`GameOverScreen.vue`: copy cálido, retry inmediato sin cinemática).

Las 10 narrativas (covers de inspiración en `public/escape-room/covers/`, placeholders AI hasta tener arte final):

| # | Nivel | Mood | Hook |
|---|---|---|---|
| 1 | Una mañana en el minbak | Slice of life · Cálido | Despiertas en una casa ajena; notas de halmeoni y un candado nuevo |
| 2 | El templo de la lluvia | Místico · Contemplativo | La campana solo deja salir a quien entiende lo que perdió |
| 3 | El mercado nocturno | Energético · Callejero | La ajumma retiene tu mochila; el mercado cierra en 20 min |
| 4 | El último tren a Seúl | Urgente · Contemporáneo | 13 minutos, un billete en coreano y un andén que no existe |
| 5 | La cocina del abuelo | Nostálgico · Familiar | Cocinar su receta exactamente como él, esta noche |
| 6 | El estudio de K-drama | Meta-pop · Divertido | El actor no llegó y la directora te mira fijo |
| 7 | El retiro de la empresa | Corporativo · Nocturno | Team building en la montaña; pistas en lenguaje formal |
| 8 | El palacio de las linternas | Histórico · Misterioso | Te quedaste tras el cierre; los pasillos se reordenan |
| 9 | La mansión del testamento | Intriga · Denso | Siete herederos y un documento que cambia según se lea |
| 10 | La cumbre de medianoche | Diplomático · Tenso | Un comunicado conjunto antes del amanecer; tú sostienes la pluma |

---

## ÍNDICE

1. [Concepto y visión](#1-concepto-y-visión)
2. [Principios de diseño (decisiones bloqueadas)](#2-principios-de-diseño-decisiones-bloqueadas)
3. [Anatomía de un nivel — template general](#3-anatomía-de-un-nivel--template-general)
4. [Sistema de puzzles](#4-sistema-de-puzzles)
5. [Sistema de pistas](#5-sistema-de-pistas)
6. [Sistema de fallo (roguelike)](#6-sistema-de-fallo-roguelike)
7. [Sistema de recompensas cosméticas](#7-sistema-de-recompensas-cosméticas)
8. [Estética: pixel art + Hangul estándar](#8-estética-pixel-art--hangul-estándar)
9. [Stack técnico](#9-stack-técnico)
10. [Pipeline de producción](#10-pipeline-de-producción)
11. [Roadmap de niveles](#11-roadmap-de-niveles)
12. [📜 NIVEL 1 — DOSSIER COMPLETO](#12--nivel-1--dossier-completo)
13. [Decisiones abiertas](#13-decisiones-abiertas)
14. [Siguientes pasos](#14-siguientes-pasos)

---

## 1. Concepto y visión

### Qué es

Un escape room **visual novel 2D** con estética **pixel art**, embebido como mini-juego dentro de la plataforma de gramática coreana. El jugador es transportado a escenas ambientadas en Corea (un minbak, un templo, una cocina, un mercado nocturno…), y debe resolver puzzles **gramaticales** para escapar/avanzar.

### Por qué existe

- La gramática tiene fama de aburrida. El escape room la **disfraza de aventura**.
- La plataforma ya tiene BD + explicaciones + práctica. Le falta **motivación recurrente**.
- Es el complemento perfecto a:
  - La **ruleta** (producción creativa rápida)
  - El tercer juego TBD (probablemente velocidad/Tetris)
- Cubre el ritmo de **sesión larga e inmersiva** (10-15 min por run), que ningún otro juego del set cubre.

### Qué NO es

- ❌ Un quiz disfrazado de juego (los puzzles deben *ser* las llaves, no ser un examen sorpresa)
- ❌ Un juego 3D ni con animación compleja (sobrediseño para puzzles lingüísticos)
- ❌ Una historia continua con cliffhangers (cada nivel es autoconclusivo)
- ❌ Pago / monetización adicional (cosméticos son recompensa intrínseca, no compra)

### Pilar narrativo

Cada nivel es una **historia cerrada**. Una noche, un viaje, una memoria, un caso. El jugador entra, vive la historia, escapa. No hay arco que conecte los niveles entre sí — cada uno puede pulirse al máximo sin presión de continuidad.

---

## 2. Principios de diseño (decisiones bloqueadas)

Estas decisiones están **cerradas**. No se renegocian salvo motivo explícito.

| # | Decisión | Por qué |
|---|---|---|
| D1 | **Niveles autoconclusivos** | Permite pulir cada uno al máximo y lanzarlos cuando estén listos sin compromisos |
| D2 | **3 tipos de puzzle**: crear, completar, seleccionar | Cubre los modos de práctica gramatical sin diluir el foco |
| D3 | **Roguelike**: fallar reinicia el nivel desde el principio | Tensión real, replay value, fuerza atención al input |
| D4 | **5× contenido por slot**: cada slot tiene un pool de 5 candidatos | Cada run se siente fresco aunque la estructura del nivel se mantenga |
| D5 | **Pixel art** (imágenes + texto) | Estética coherente, escalable, característica visual fuerte |
| D6 | **Coreano estándar** (no arcaico ni stylized) | Lo que el jugador aprende debe ser útil en el mundo real |
| D7 | **Web + móvil (responsive)** | Vive embebido en la plataforma, accesible desde cualquier dispositivo |
| D8 | **Recompensas: solo cosméticos** (perfiles, marcos, íconos, fondos) | Motivación intrínseca sin pay-to-win ni inflación |
| D9 | **Sistema de pistas con tiers** | Da control al jugador sobre dificultad sin castigar la victoria |
| D10 | **Gramática mapeada a códigos G### de la BD** | El juego refuerza exactamente lo que ya está en la plataforma |
| D11 | **Embebido en la plataforma Nuxt**, no standalone | Forma parte del producto; no se distribuye como app aparte |
| D12 | **Contenido modelado con `LocalizedString` desde el día 1** | V1 puede llenar solo `es`, pero el shape de 8 locales (`en/es/fr/pt-BR/th/id/vi/ja`) está reservado en el JSON. Evita migración futura. |

---

## 3. Anatomía de un nivel — template general

Toda nueva implementación de nivel sigue este molde:

### Estructura física

| Recurso | Cantidad |
|---|---|
| Cuartos/escenas principales | 3-5 |
| Imágenes de detalle/zoom | 5-10 |
| Variantes de escena (luz on/off, puerta abierta/cerrada) | 2-3 |
| **Imágenes pixel art totales** | **12-18** |

### Estructura de puzzles

| Recurso | Cantidad |
|---|---|
| Slots de puzzle | 5-6 |
| Candidatos por slot (pool randomizable) | 5 |
| **Puzzles escritos por nivel** | **25-30** |
| Gramáticas-tema (de la BD) | 3-5 |
| Pistas a escribir | 2 por puzzle = 50-60 |

### Estructura de audio

| Recurso | Cantidad |
|---|---|
| Pistas ambient (loop por escena) | 1 por cuarto |
| Líneas de voz coreana (TTS) | 20-30 |
| SFX (puerta, llave, candado, correcto/incorrecto…) | ~7 |

### Estructura de recompensas

| Recurso | Cantidad |
|---|---|
| Cosméticos del nivel | 4 (1 por tier) |
| Tema visual del set | 1 (debe ser coherente con la historia del nivel) |

### Duración objetivo

**10-15 minutos por run.** Si baja de 8 min no hay atmósfera; si supera 20 min en móvil se pierde el jugador.

### Tiempo de producción

- Primer nivel: **~100-150 horas** (motor + arte + escritura + audio + integración)
- Niveles 2+ (con motor ya hecho): **~50-80 horas cada uno**

### Flujo dentro de un nivel

```
APERTURA (narrador, contexto, hook)
   ↓
CUARTO 1 — puzzle fácil (selección)
   ↓
CUARTO 2 — puzzle medio (completar)
   ↓
CUARTO 3 — 1-2 puzzles paralelos (medio)
   ↓
CUARTO FINAL — puzzle de creación → ESCAPE
   ↓
PANTALLA DE RECOMPENSA (cosmético según tier)
```

**Modelo de movimiento:** lineal-explorable híbrido. El jugador puede revisar cuartos previos libremente, pero el puzzle final requiere todos los sub-puzzles resueltos.

---

## 4. Sistema de puzzles

### Los 3 tipos

**Tipo A — Selección (4 opciones)**
- El jugador lee algo en coreano y elige el significado/respuesta correcta
- Más fácil; usar como puzzle de entrada en cada nivel
- Bueno para *reconocimiento* y *comprensión*

**Tipo B — Completar oración**
- El jugador rellena una parte faltante (partícula, conjugación, palabra)
- Dificultad media; usar 2-3 por nivel
- Bueno para *aplicación de regla*

**Tipo C — Crear oración**
- El jugador construye una oración entera con tiles drag-and-drop, o escribe libremente
- Más difícil; reservar para el puzzle final del nivel
- Bueno para *producción*

### Pool de 5× por slot — cómo funciona

Cada slot del nivel tiene **5 candidatos escritos** que prueban la MISMA gramática.

Al iniciar un run, el motor sortea 1 candidato por slot. Resultado: el jugador hace los mismos 5 *tipos* de puzzles en los mismos cuartos, pero el *contenido específico* cambia.

**Por qué 5× por slot y no 5× totales:** la estructura repetida es buena (el jugador aprende los cuartos, sabe qué esperar). Lo que mata el replay es el contenido específico repetido. 5× por slot da variedad sin perder la familiaridad de la estructura.

### Principio de integración

**Los puzzles deben ser llaves del mundo, no exámenes pegados.**

❌ Mal: "click en la puerta → aparece quiz de gramática → si aciertas se abre"

✅ Bien: "el espíritu te bloquea el paso y solo se mueve si respondes correctamente a su pregunta" / "la nota de halmeoni está incompleta — descífrala para saber dónde está el desayuno"

Cada puzzle debe tener **consecuencia narrativa**, no solo ✓/✗.

### Calidad de distractores (Tipo A)

Para que el puzzle no sea trivial sin leer, los 3 distractores deben ser **plausibles pero falsos**. Heurística:

- **D1 — Negación invertida**: misma oración pero con 없어요 en lugar de 있어요 (o viceversa).
- **D2 — Sustantivo plausible**: misma estructura pero con un sustantivo del mismo campo semántico (사과 → 배, 빵 → 우유).
- **D3 — Lugar/marco plausible**: misma estructura pero con el lugar cambiado por otro lugar mencionable en la escena (부엌 → 거실).

**Antipatrón:** distractores que cambian dos elementos a la vez ("D) Buenos días. Hay café en el jardín" cuando la fuente dice "Hola. Hay desayuno en la cocina") — son demasiado obviamente falsos.

---

## 5. Sistema de pistas

### Mecánica

Cada puzzle tiene **2 pistas escritas**:

- **Pista 1 — GRATIS**: pista de vocabulario o conceptual. No revela la respuesta. Disponible siempre.
- **Pista 2 — CUESTA TIER**: pista del patrón/regla. Más directa. Usarla **bloquea todos los tiers superiores a Común** en este run.

### Por qué este modelo

- No castiga la victoria (siempre puedes terminar el nivel)
- Da control al jugador: ¿quiero el cosmético raro o quiero ayuda?
- Convierte la dificultad en una elección, no en una pared

### Reglas precisas

- Pista 1 usada → **no afecta** recompensa.
- Pista 2 usada (aunque sea en un solo puzzle del run) → solo se otorga 🟢 Común. Quedan bloqueados 🔵 Raro, 🟣 Épico y 🟡 Legendario en este run.
- Las pistas no expiran dentro del run.

> **Nota:** esta regla unifica lo que en la v1 del documento estaba inconsistente entre "Pista 2 bloquea solo Épico/Legendario" (Sección 5) y "Raro requiere no usar Pista 2" (Sección 7). La versión actual es: **Pista 2 = solo Común**. Es la única lectura que hace que cada tier signifique algo distinto.

---

## 6. Sistema de fallo (roguelike)

### Mecánica

Si el jugador comete cierto número de errores en un nivel → **GAME OVER** → reinicia desde el principio del nivel (cuarto 1) con un nuevo sorteo de puzzles del pool.

### Reglas precisas

| Aspecto | Valor |
|---|---|
| Errores permitidos por run | **2** (al tercero = game over) |
| Qué reinicia | El **nivel actual** (no el juego entero, porque los niveles son autoconclusivos) |
| Qué se conserva | Cosméticos ya desbloqueados en runs previos |
| Qué se pierde | Progreso dentro del nivel, contador de "runs sin morir" para el tier Legendario |

### Por qué 2 errores (no 1 ni 3)

- 1 error = demasiado brutal para principiantes, mata el motivo de seguir
- 3 errores = pierde tensión, el roguelike no se siente como tal
- 2 errores = "puedes dudar una vez, no dos" → enseña a leer bien antes de responder

### Cuándo aplica

El sistema roguelike es uniforme para todos los niveles del MVP. Si en testing los usuarios se frustran demasiado en niveles avanzados, se puede subir a 3 errores en niveles 5+ — pero esto sería un ajuste post-MVP.

---

## 7. Sistema de recompensas cosméticas

### Filosofía

**Solo cosméticos.** Nada de XP, niveles de cuenta, monedas convertibles ni mecánicas que distorsionen el aprendizaje. El cosmético es el trofeo visible del logro.

Tipos de cosmético:
- 🖼️ **Fondos de perfil** (backgrounds)
- 🖼️ **Marcos de foto de perfil** (frames)
- 👤 **Avatares** (profile pictures, algunos animados)
- 🎴 **Íconos** decorativos
- 📛 **Títulos** (string corto que aparece bajo el username)

### Los 4 tiers

| Tier | Cómo se desbloquea | Frecuencia objetivo | Ejemplo de recompensa |
|---|---|---|---|
| 🟢 **Común** | Completar el nivel (con o sin pistas, con o sin reintentos) | ~100% de jugadores que completan | Fondo temático |
| 🔵 **Raro** | Completar **sin usar Pista 2** en ningún puzzle | ~40-60% | Marco temático |
| 🟣 **Épico** | Sin Pista 2 + bajo cierto tiempo objetivo (varía por nivel, ~8 min en nivel 1) | ~10-20% | Avatar especial (a veces animado) |
| 🟡 **Legendario** | Completar **3 runs consecutivos sin un solo game over** | <5% | Set completo (avatar + marco + fondo + título) |

### Reglas

- Solo se otorga el tier más alto alcanzado en el run (los menores se asumen).
- Cosméticos son permanentes una vez desbloqueados.
- El conteo para el Legendario se reinicia si el jugador hace game over (no si simplemente sale del juego).
- **Si se usa Pista 2 en cualquier puzzle del run → solo se otorga 🟢 Común** (regla canónica, ver Sección 5).

### Temas de cosméticos

Cada nivel tiene un **set temático coreano**. La idea es que coleccionar cosméticos sea explorar la cultura visual de Corea.

Ejemplos por nivel (ver Roadmap):
- Nivel 1 (minbak): hanji, delantal de halmeoni, linterna de papel, amanecer en hanok
- Nivel 2 (templo): linternas de templo, mandala, monje, cerezo de noche
- Nivel 3 (oficina): badges corporativos, café en taza de papel, Gangnam skyline
- Nivel 4 (mercado): carteles de hangul neón, comida callejera, gato del mercado

---

## 8. Estética: pixel art + Hangul estándar

### Estilo visual de referencia

**Stardew Valley** (cálido, detallado) cruzado con **Mother 3** (suave, emotivo). Pixel art de paleta cálida, NO retro-arcade duro tipo NES.

### Especificaciones técnicas

| Aspecto | Valor |
|---|---|
| Resolución base de escena | **320×240 px** |
| Escalado en pantalla | nearest-neighbor (sin suavizado), x4 o x6 según display |
| Aspect ratio | **4:3** (funciona en vertical móvil y horizontal desktop) |
| Sprites de objetos zoom | 128×128 px base |
| Sprites de avatar/cosmético | 64×64 px base |

### Paleta sugerida

- **Cálidos** dominantes: cremas, ocres, melocotones
- **Maderas** claras (hanok wood)
- **Verdes apagados** (plantas, exterior)
- **Acentos suaves**: rosa amanecer, azul nocturno
- **Negro suave** (no #000000) para texto y contornos

### Tipografía coreana en pixel

- **Neodgm** (gratis, perfecta para Hangul retro) — fuente default
- Alternativa más legible en tamaños pequeños: **Galmuri**
- Tamaño mínimo: **16 px** de altura (debajo, Hangul es ilegible)
- Texto en español/otros locales: misma fuente si tiene soporte latino, o pareja con **Pixelify Sans**

### Coreano: estándar, no estilizado

El contenido lingüístico es **coreano contemporáneo educado** (-아/어요, -ㅂ/습니다 según contexto). No usar:
- Hanja (caracteres chinos) salvo decorativo en cuadros
- Lenguaje arcaico (sageuk) salvo en niveles temáticamente históricos
- Slang muy moderno (memes) — confunde al aprendiz

### Elementos culturales coreanos a usar (banco visual)

- Hanji (papel coreano) como textura de paredes
- Hanok (casa tradicional) como estructura arquitectónica
- Yo (요, futón coreano) en lugar de cama occidental
- 현관 (hyeon-gwan) — entrada con cambio de zapatos; marca cultural fuerte
- Olla de arroz eléctrica, palillos de metal, cuencos
- Linternas de templo, hilos rojos, máscaras hahoe
- Letreros de neón con hangul, comida callejera
- Cerámica Goryeo, abanico tradicional, hanbok

---

## 9. Stack técnico

### Decisiones (alineadas con la plataforma Nuxt actual)

- **Framework:** Nuxt 4 + Vue 3 (Composition API + `<script setup>`) — el mismo de la plataforma. NO React, NO Astro, NO Next.
- **Estado del juego:** Pinia 3 (un store dedicado por nivel activo).
- **Estilos:** Tailwind 3 + design tokens CSS (los mismos que `app/assets/styles/`).
- **i18n:** `@nuxtjs/i18n` 9.5 (ya configurado en la plataforma con 8 locales).
- **Audio:** Howler.js (se añade a `dependencies` — mejor control de loops/fades que HTML5 Audio crudo, y Web Audio API directo es overkill).
- **Hotspots:** `<div>` posicionados absolutamente sobre `<img>` de fondo, mínimo `44×44 px` de área táctil.
- **Sin Phaser/PixiJS** salvo necesidad de animaciones complejas (no para V1).

### Descartado

- ❌ **React / Zustand** — no es el stack de la plataforma. Migrar a React solo para el juego rompería la cohesión.
- ❌ **Ren'Py** — es para distribución standalone, no embebe en web.
- ❌ **Unity / Godot** — sobredimensionado para puzzles 2D, no embebe bien en una plataforma web.

### Localización (clave)

La plataforma soporta **8 locales** baked-in: `en, es, fr, pt-BR, th, id, vi, ja` ([munbeop/app/lib/domain/i18n.ts](../munbeop/app/lib/domain/i18n.ts)).

Todo texto **visible al jugador** se modela como `LocalizedString` (record con clave por locale), siguiendo el patrón que ya usan `seed/grammars.ts` y `seed/contexts.ts`:

```ts
import { L } from '~/seed/locale'
// L() es el constructor posicional: L(en, es, fr, pt-BR, th, id, vi, ja)
question: L(
  'What does halmeoni say?',
  '¿Qué dice halmeoni?',
  'Que dit halmeoni ?',
  'O que halmeoni diz?',
  'คุณยายพูดว่าอะไร',
  'Halmeoni bilang apa?',
  'Halmeoni nói gì?',
  'おばあちゃんは何を言っていますか?',
)
```

**El coreano (`ko`) NO se traduce** — es contenido didáctico. Esto es consistente con la regla del repo (`munbeop/README.md`: *"Coreano (`ko`, `name`, `example`) NO se traduce — es contenido didáctico"*).

**V1 — estrategia pragmática:** llenar `es` (idioma materno del autor) y dejar los otros 7 locales con el mismo string en `es` *o* con el inglés como fallback. El runtime de `LocalizedString` ya hace fallback a `DEFAULT_LOCALE = 'en'` si la clave del idioma activo está vacía. Lo importante es **reservar el shape**, no traducir todo en V1.

### Diseño responsive

- Imágenes en relación **4:3 o cuadrada** → funcionan en vertical (móvil) y horizontal (desktop).
- Hotspots mínimo **44×44 px** (estándar táctil iOS/Android).
- Móvil: scene a pantalla completa, panel de puzzle deslizando desde abajo.
- Desktop: scene + panel lateral o modal centrado.

### Ubicación de archivos en el repo

Siguiendo las reglas del proyecto (≤200 LOC por componente Vue, ≤150 por `app/lib/`, no god files):

```
munbeop/
├── app/
│   ├── components/escape-room/
│   │   ├── EscapeRoom.vue          # root, orquesta nivel + transiciones
│   │   ├── Room.vue                # escena (bg image + hotspots)
│   │   ├── Hotspot.vue             # rect clickable sobre escena
│   │   ├── SlotSelection.vue       # puzzle Tipo A
│   │   ├── SlotCompletion.vue      # puzzle Tipo B
│   │   ├── SlotCreation.vue        # puzzle Tipo C (drag-and-drop tiles)
│   │   ├── HintPanel.vue
│   │   ├── GameOverScreen.vue
│   │   ├── VictoryScreen.vue
│   │   └── RewardReveal.vue
│   ├── composables/
│   │   ├── useEscapeRoom.ts        # API pública del juego
│   │   └── useAudio.ts             # wrapper Howler.js
│   ├── lib/domain/
│   │   └── escape-room.ts          # types: Level, Room, Slot, Candidate, Reward, Hint
│   ├── lib/escape-room/
│   │   ├── shuffle.ts              # sorteo determinista por run-id (testeable)
│   │   ├── scoring.ts              # cálculo de tier alcanzado
│   │   └── rules.ts                # 2 errores, pista 2 = solo común, etc.
│   ├── stores/
│   │   └── escape-room.ts          # Pinia: estado del run actual
│   ├── pages/escape-room/
│   │   └── [levelId].vue           # ruta `/escape-room/nivel-01`
│   └── seed/escape-room/
│       └── level-01.ts             # JSON del Nivel 1 en TS (type-checked)
├── public/escape-room/level-01/
│   ├── rooms/*.png
│   ├── objects/*.png
│   ├── cosmetics/*.png
│   └── audio/*.ogg
└── tests/unit/escape-room/
    ├── shuffle.test.ts
    ├── scoring.test.ts
    └── rules.test.ts
```

### Contrato de datos (TypeScript schema)

Cada nivel se define como un módulo TS exportando un `Level` con tipo estricto. El shape (resumen):

```ts
// app/lib/domain/escape-room.ts
import type { LocalizedString } from './i18n'

export type GrammarCode = string // e.g. 'G003'

export type SlotType = 'selection' | 'completion' | 'creation'

export interface Hint {
  free: LocalizedString    // Pista 1 — vocab/conceptual
  premium: LocalizedString // Pista 2 — patrón/regla (usarla = solo Común)
}

export interface SelectionCandidate {
  korean: string                        // NO localizado
  question: LocalizedString
  options: LocalizedString[]            // exactly 4
  correctIndex: 0 | 1 | 2 | 3
  hints: Hint
}

export interface CompletionCandidate {
  korean: string                        // contiene '___' como hueco
  translation: LocalizedString
  answer: string                        // texto exacto en coreano
  hints: Hint
}

export interface CreationCandidate {
  korean: string                        // pregunta de halmeoni en coreano
  question: LocalizedString
  tiles: string[]                       // tokens correctos + distractores
  correctOrder: number[]                // índices en `tiles` formando la respuesta
  hints: Hint
}

export type Candidate = SelectionCandidate | CompletionCandidate | CreationCandidate

export interface Slot {
  id: string
  type: SlotType
  grammarFocus: GrammarCode[]
  candidates: Candidate[]               // length === 5
}

export interface Hotspot {
  id: string
  rect: [x: number, y: number, w: number, h: number]
  triggersSlot?: string
  cosmeticDetail?: string               // easter eggs
}

export interface Room {
  id: string
  title: LocalizedString
  image: string                         // path bajo /public/escape-room/<level>/
  ambientAudio: string
  hotspots: Hotspot[]
}

export interface Reward {
  id: string
  image: string
  name: LocalizedString
  description: LocalizedString
}

export interface Level {
  id: string                            // 'level-01'
  title: LocalizedString
  intro: LocalizedString
  outro: LocalizedString
  grammarCodes: GrammarCode[]
  topikLevel: 1 | 2 | 3 | 4 | 5 | 6
  rooms: Room[]
  slots: Slot[]
  rewards: {
    common: Reward
    rare: Reward
    epic: Reward
    legendary: Reward
  }
  rules: {
    maxErrors: number                   // default 2
    epicTimeThresholdSeconds: number    // ~480 para Nivel 1
    legendaryCleanRunsRequired: number  // default 3
  }
}
```

El tipo `Level` vive en `app/lib/domain/escape-room.ts`. Cada nivel exporta una constante tipada (mismo patrón que `TOPIK_1_GRAMMAR` en `app/seed/grammars-n1.ts`).

---

## 10. Pipeline de producción

### Por nivel — proceso

1. **Diseñar el dossier** (este documento es plantilla)
   - Premisa, cuartos, slots con 25 puzzles, cosméticos
   - ~10 horas
2. **Generar arte pixel**
   - Opción recomendada: **híbrido** — IA (Midjourney/Flux) para concept → Aseprite manual para pixel-perfect
   - 16 imágenes × 2-3h = 30-50 horas
3. **Producir audio**
   - TTS coreano para voz (ver opciones más abajo)
   - Ambient + SFX (Freesound + edición)
   - 5-8 horas
4. **Codear/configurar el nivel**
   - Escribir el TS del nivel siguiendo el shape de Sección 9
   - Conectar al motor (si motor ya existe, este paso es casi nulo)
   - 5-10 horas si motor existe, 40-60h si es el primer nivel
5. **Integración + testing**
   - Embebido en la plataforma (`pages/escape-room/[levelId].vue`)
   - Tests unitarios para `shuffle.ts`, `scoring.ts`, `rules.ts`
   - QA: jugar 5-10 runs, ajustar dificultad
   - 15-25 horas

### Herramientas recomendadas

| Tarea | Herramienta | Coste |
|---|---|---|
| Pixel art manual | **Aseprite** | ~$20 una vez |
| Concept art IA | **Midjourney** o **Flux** | $10-30/mes |
| TTS coreano (premium) | **ElevenLabs** | ~$5/mes |
| TTS coreano (económico) | **OpenAI TTS HD** | ~$0.30 por nivel |
| TTS coreano (gratis cupo) | **Google Cloud TTS WaveNet** | Gratis hasta cierto cupo |
| SFX gratis | **Freesound.org** | Gratis (atribución) |
| Música ambient | **Pixabay Music** o **Suno AI** | Gratis / suscripción |

### Reutilización (cómo bajar coste de niveles 2+)

- **Motor del juego** se construye una vez (40-60h Nivel 1) y se reusa en todos
- **Sistema de cosméticos / UI / pistas / roguelike** se reusa
- **Variantes de escena** (mismo cuarto con/sin luz) = 1 imagen base + edición rápida
- **NPCs recurrentes** (halmeoni, monje, taxista) entre niveles temáticamente relacionados
- **Audio TTS** generable a demanda con la misma voz

---

## 11. Roadmap de niveles

### MVP — Lanzar primero

**Solo Nivel 1.** No esperar a tener 3 niveles antes de lanzar.

Por qué:
1. Validar la mecánica con usuarios reales antes de invertir más
2. 1 nivel pulido > 3 mediocres
3. Feedback temprano informa los niveles siguientes

### Post-MVP — niveles propuestos

| # | Tema | TOPIK | Gramáticas objetivo | Tono |
|---|---|---|---|---|
| 1 | **Una mañana en el minbak** | 1 | G003, G005, G012, G027, G031, G032 | Cálido, slice-of-life ✅ DISEÑADO |
| 2 | **El templo de la lluvia** | 2 | G013, G016, G034, G035, G036, G050 | Místico, contemplativo ✅ DISEÑADO |
| 3 | **El mercado nocturno** | 2-3 | -아/어 보다, -아/어 주다, comparativos, G021 (-지만), G019 (-고) | Energético, callejero |
| 4 | **El último tren a Seúl** | 3 | -면서, -자마자, -는 동안, -고 나서 | Urgente, contemporáneo |
| 5 | **La cocina del abuelo** | 3 | -아/어 놓다/두다, -게 되다, voz pasiva | Nostálgico, familiar |
| 6 | **El estudio de K-drama** | 3-4 | Discurso indirecto, -대요/-(이)래요 | Meta-pop, divertido |
| 7 | **La oficina de Gangnam** | 4 | -았/었던, -ㄴ/는다는 것이다, formal -습니다 | Corporativo, frío |
| 8 | **El palacio Joseon de noche** | 4-5 | Honoríficos altos, -(으)시-, formas literarias suaves | Histórico, misterioso |
| 9 | **El juicio de la era moderna** | 5-6 | Causativos -게 하다, expresiones idiomáticas, refranes | Dramático, denso |
| 10 | **La cumbre diplomática** | 5-6 | Lenguaje formal escrito, -(으)ㅁ/-기, periodístico | Formal, tenso |

> El remapeo de gramáticas de los niveles 2-4 se decidió en el dossier del nivel 2 (§5.2 de [`escape-room-level-02.md`](./escape-room-level-02.md)): -기 전에/-(으)ㄴ 후에 (G035/G036) adelantan al nivel 2 porque el orden ritual del 49재 es su hogar narrativo; el nivel 3 hereda -지만/-고; el nivel 4 («El último tren a Seúl») gana -는 동안/-고 나서 para compensar.

**Ritmo de release sugerido:** 1 nivel nuevo cada 3-4 semanas una vez el motor está estable. Objetivo a 6 meses: 5-6 niveles vivos. A 12 meses: 10-12.

### Variedad de NPCs y locaciones

Los temas están elegidos para que la **estética visual y cultural varíen mucho** entre niveles — el jugador siempre entra a un mundo nuevo, no a "otra habitación más".

---

## 12. 📜 NIVEL 1 — DOSSIER COMPLETO

### 12.1 Resumen

| Campo | Valor |
|---|---|
| Título | **Una mañana en el minbak (민박)** |
| Nivel TOPIK | 1 (principiante) |
| Tono | Cálido, slice-of-life, ligeramente misterioso (NO terror) |
| Referencia tonal | Corto de Studio Ghibli |
| Gramáticas-tema | G003, G005, G012, G027, G031, G032 (definidas en [`munbeop/app/seed/grammars-n1.ts`](../munbeop/app/seed/grammars-n1.ts)) |
| Cuartos | 4 |
| Slots de puzzle | 5 |
| Puzzles escritos | 25 (5 × 5) |
| Imágenes pixel art | ~16 |
| Duración por run | 10-12 min |
| Cosméticos | 4 (1 por tier) |

### 12.2 Historia

**Premisa:** El jugador es un huésped que pasó la noche en un pequeño minbak (민박, hospedaje tradicional coreano) en un pueblo de Corea. La dueña, una halmeoni (할머니, abuelita) muy amable, lo recibió anoche. Esta mañana el jugador se despierta y la halmeoni ya no está — salió temprano y le dejó **una serie de notas** por la casa explicando dónde encontrar el desayuno, cómo abrir la puerta, y dónde reunirse con ella para tomar un café.

**Conflicto:** La puerta del frente está cerrada con un candado que pide un "código" — la halmeoni quiere asegurarse de que el jugador entienda sus instrucciones antes de salir solo al pueblo. Las notas son tiernas, pero hay que leerlas, completarlas y responder a su pregunta final para escapar.

**Cierre:** Al resolver el último puzzle, la puerta se abre. Cinemática corta: el jugador sale al amanecer del pueblo coreano, ve el café a lo lejos. Pantalla final: *"Halmeoni te espera con un buen café. ¡Hasta mañana!"*

**Por qué funciona como Nivel 1:**
- Tono amistoso → no asusta a un principiante
- Vocabulario doméstico (cuarto, cocina, comida) ya familiar
- La halmeoni "guía" al jugador como una maestra implícita
- La gramática se descubre en uso, no en clase

### 12.3 Gramáticas del nivel

| Código | Gramática | Cómo aparece |
|---|---|---|
| G003 | 이/가 — partícula de sujeto | Slot 2 (foco) + notas |
| G005 | 에 — partícula de lugar/destino/tiempo | Slot 3 + Slot 5 |
| G012 | -아/어요 — presente educado | Toda la voz de halmeoni |
| G027 | 있다/없다 — existencia | Slot 1 + Slot 3 |
| G031 | Números (sino + nativos) | Slot 4 |
| G032 | Expresiones de tiempo | Slot 4 + Slot 5 |

### 12.4 Cuartos / Escenas

#### Cuarto 1 · La habitación de huéspedes (손님방)
**Layout visual:** Cuarto pequeño y acogedor. Futón en el suelo (revuelto, recién levantado). Mesa baja al lado con una **nota plegada** encima. Ventana al fondo dejando entrar luz dorada de amanecer. Una pequeña planta en una esquina. Estantería con un libro y un reloj despertador (apagado, sugiere que ya sonó).

**Interactivos:**
- 🟡 Nota sobre la mesa baja → **Slot 1**
- ⚪ Ventana (cosmético, sonido de pájaros al click)
- ⚪ Libro en la estantería (easter egg: dice `한국어 교과서`)

#### Cuarto 2 · La sala (거실)
**Layout visual:** Sala estilo hanok modesta. Pared con fotos familiares enmarcadas (incluyendo una de halmeoni joven y un gato). Mueble bajo de madera con teléfono antiguo y florero. **Segunda nota** pegada con cinta en el mueble. Pared con textura de hanji. Jardín visible por la ventana con un árbol.

**Interactivos:**
- 🟡 Nota en el mueble → **Slot 2**
- ⚪ Foto de halmeoni joven (easter egg: `할머니는 1965년에 태어났어요`)
- ⚪ Teléfono (sonido al click)

#### Cuarto 3 · La cocina (부엌)
**Layout visual:** Cocina pequeña tradicional. **Refrigerador** a la izquierda, **mesa de comedor** (식탁) en el centro con mantel, **alacena** (찬장) arriba, **fogón con olla** (냄비) al fondo, **cuenco de arroz** (그릇) en la encimera. **Reloj de cocina** en la pared mostrando una hora. **Tercera nota** pegada en el refrigerador.

**Interactivos:**
- 🟡 Nota en el refrigerador → **Slot 3**
- 🟡 Reloj de cocina → **Slot 4** (disponible tras Slot 3)
- 5 objetos clickeables (con close-up): refrigerador (사과), mesa (빵), alacena (컵), olla (국), cuenco (밥). Slot 3 randomiza cuál pide la nota.

#### Cuarto 4 · La entrada / 현관
**Layout visual:** Pasillo de entrada coreano. Zapatos del jugador (zapatillas occidentales) al lado de zapatillas de casa tradicionales de halmeoni. **Puerta corrediza** al fondo con **candado moderno** que pide un código. Sobre el candado, **cuarta y última nota** colgada con hilo rojo. Pequeña planta y paragüero con paraguas de papel oleado coreano.

**Interactivos:**
- 🟡 Nota colgando del candado → **Slot 5** (puzzle final)
- 🔒 Candado → recibe la respuesta del Slot 5
- ⚪ Zapatos (cosmético: pequeña animación de "calzarse" antes de salir)

### 12.5 Mapa de puzzles

```
[CINEMÁTICA APERTURA]
  Voz suave de halmeoni en off: "잘 잤어요? 안녕!"
       ↓
CUARTO 1 — habitación
  Click en la nota → SLOT 1 (selección)
  Gramática: G012 + G027
       ↓
CUARTO 2 — sala
  Click en la nota → SLOT 2 (completar 이/가)
  Gramática: G003 (foco)
       ↓
CUARTO 3 — cocina (orden libre entre Slot 3 y Slot 4)
  Click en la nota del refrigerador → SLOT 3 (encontrar objeto)
    Gramática: G005 + G027
  Click en el reloj → SLOT 4 (decir la hora)
    Gramática: G031 + G032
       ↓
CUARTO 4 — entrada
  Click en la nota del candado → SLOT 5 (responder pregunta)
  Gramática: G005 + G012 + G032 (integración)
       ↓
[CINEMÁTICA SALIDA]
  Candado abierto. Puerta se desliza. Amanecer. Café a lo lejos.
  Pantalla: "Halmeoni te espera. ¡Hasta mañana!"
  Pantalla de recompensa: cosmético desbloqueado según tier alcanzado.
```

### 12.6 Pool completo de puzzles (25)

> **Notación:** Cada candidato muestra el coreano (lo que ve el jugador), la traducción interna, la pregunta/opciones, y las 2 pistas.
> En cada run, el motor sortea 1 candidato por slot del pool de 5.
> Los textos están en español (V1); para producción multi-locale se rellena el resto del `LocalizedString` antes de integrar.

#### SLOT 1 · Leer la primera nota de halmeoni
**Cuarto:** 1 · **Tipo:** Selección (4 opciones) · **Gramática foco:** G027 (있다) · **Refuerza:** G012, G003

**Candidato 1.1**
- **Nota (KO):** `안녕! 아침이 있어요. 부엌에 있어요.`
- **Pregunta:** ¿Qué dice halmeoni?
- **Opciones:**
  - A) Hola. Hay desayuno. Está en la cocina. ✅
  - B) Hola. Hay desayuno. Está en la habitación. *(D3 — lugar plausible)*
  - C) Hola. Hay café. Está en la cocina. *(D2 — sustantivo plausible)*
  - D) Hola. No hay desayuno. Está en la cocina. *(D1 — negación invertida)*
- **Pista 1 (gratis):** `아침` = mañana / desayuno. `부엌` = cocina.
- **Pista 2 (premium):** `있어요` afirma existencia; el opuesto es `없어요`.

**Candidato 1.2**
- **Nota (KO):** `좋은 아침이에요. 부엌에 빵이 있어요.`
- **Pregunta:** ¿Qué dice halmeoni?
- **Opciones:**
  - A) Buenos días. Hay pan en la cocina. ✅
  - B) Buenos días. Hay leche en la cocina. *(D2)*
  - C) Buenos días. No hay pan en la cocina. *(D1)*
  - D) Buenos días. Hay pan en la sala. *(D3)*
- **Pista 1:** `좋은 아침` es el saludo formal "buenos días". `빵` = pan.
- **Pista 2:** Estructura `[lugar]에 [cosa]이/가 있어요` = "en [lugar] hay [cosa]".

**Candidato 1.3**
- **Nota (KO):** `안녕! 부엌에 우유가 있어요.`
- **Pregunta:** ¿Qué dice halmeoni?
- **Opciones:**
  - A) Hola. Hay leche en la cocina. ✅
  - B) Hola. Hay agua en la cocina. *(D2 — 물 vs 우유)*
  - C) Hola. No hay leche en la cocina. *(D1)*
  - D) Hola. Hay leche en la sala. *(D3)*
- **Pista 1:** `우유` = leche.
- **Pista 2:** `있어요` indica existencia (hay).

**Candidato 1.4**
- **Nota (KO):** `아침이 있어요. 식탁에 빵이 있어요.`
- **Pregunta:** ¿Qué dice halmeoni?
- **Opciones:**
  - A) Hay desayuno. Hay pan en la mesa del comedor. ✅
  - B) Hay desayuno. Hay arroz en la mesa del comedor. *(D2)*
  - C) Hay desayuno. No hay pan en la mesa. *(D1)*
  - D) Hay desayuno. Hay pan en la cocina. *(D3 — 식탁 ≠ 부엌)*
- **Pista 1:** `식탁` = mesa de comedor (distinto de la cocina entera, `부엌`).
- **Pista 2:** La oración tiene DOS `있어요` — dos cosas que existen.

**Candidato 1.5**
- **Nota (KO):** `안녕! 부엌에 사과가 있어요.`
- **Pregunta:** ¿Qué dice halmeoni?
- **Opciones:**
  - A) Hola. Hay manzanas en la cocina. ✅
  - B) Hola. Hay peras en la cocina. *(D2 — 배 vs 사과)*
  - C) Hola. No hay manzanas en la cocina. *(D1)*
  - D) Hola. Hay manzanas en la sala. *(D3)*
- **Pista 1:** `사과` = manzana. `부엌` = cocina.
- **Pista 2:** Patrón `[lugar]에 [cosa]가 있어요` — comprobar tanto el lugar como la cosa.

---

#### SLOT 2 · Completar la partícula 이/가
**Cuarto:** 2 · **Tipo:** Completar (botones `이` / `가`) · **Gramática foco:** G003

Regla: `이` después de consonante (받침), `가` después de vocal.

**Candidato 2.1**
- **Nota:** `사진___ 벽에 있어요.`
- **Traducción:** La foto está en la pared.
- **Respuesta:** `이` (사진 termina en consonante ㄴ)
- **Pista 1:** Mira la última letra de `사진`. ¿Termina en consonante o vocal?
- **Pista 2:** Consonante → `이`, vocal → `가`.

**Candidato 2.2**
- **Nota:** `책___ 책상에 있어요.`
- **Traducción:** El libro está en el escritorio.
- **Respuesta:** `이` (책 termina en consonante ㄱ)
- **Pista 1:** `책` = libro, `책상` = escritorio. ¿Cuál es el sujeto?
- **Pista 2:** `책` termina en ㄱ — consonante.

**Candidato 2.3**
- **Nota:** `꽃___ 창문에 있어요.`
- **Traducción:** La flor está en la ventana.
- **Respuesta:** `이` (꽃 termina en consonante ㅊ)
- **Pista 1:** `꽃` = flor.
- **Pista 2:** `꽃` termina en ㅊ (consonante).

**Candidato 2.4**
- **Nota:** `고양이___ 의자에 있어요.`
- **Traducción:** El gato está en la silla.
- **Respuesta:** `가` (고양이 termina en vocal 이)
- **Pista 1:** `고양이` = gato.
- **Pista 2:** `고양이` termina en vocal — usa `가`.

**Candidato 2.5**
- **Nota:** `시계___ 벽에 있어요.`
- **Traducción:** El reloj está en la pared.
- **Respuesta:** `가` (시계 termina en vocal ㅔ)
- **Pista 1:** `시계` = reloj.
- **Pista 2:** `시계` termina en vocal — usa `가`.

---

#### SLOT 3 · Encontrar el objeto correcto en la cocina
**Cuarto:** 3 · **Tipo:** Selección visual (click en close-up) · **Gramática foco:** G005 + G027

**Candidato 3.1**
- **Nota:** `냉장고에 사과가 있어요.`
- **Traducción:** Hay una manzana en el refrigerador.
- **Respuesta:** Click en close-up del refrigerador (con manzana visible dentro)
- **Distractores:** mesa con pan, alacena con tazas, olla con sopa
- **Pista 1:** `냉장고` = refrigerador.
- **Pista 2:** `에` indica el lugar donde está el sujeto.

**Candidato 3.2**
- **Nota:** `식탁에 빵이 있어요.`
- **Traducción:** Hay pan en la mesa del comedor.
- **Respuesta:** Close-up de la mesa con pan
- **Distractores:** refrigerador, alacena, olla
- **Pista 1:** `식탁` = mesa (de comedor).
- **Pista 2:** `빵` = pan.

**Candidato 3.3**
- **Nota:** `찬장에 컵이 있어요.`
- **Traducción:** Hay una taza en la alacena.
- **Respuesta:** Close-up de la alacena abierta con tazas
- **Distractores:** refrigerador, mesa, cuenco
- **Pista 1:** `찬장` = alacena (mueble alto).
- **Pista 2:** `컵` = taza.

**Candidato 3.4**
- **Nota:** `냄비에 국이 있어요.`
- **Traducción:** Hay sopa en la olla.
- **Respuesta:** Close-up de la olla con sopa caliente
- **Distractores:** refrigerador, mesa, alacena
- **Pista 1:** `냄비` = olla (de cocinar).
- **Pista 2:** `국` = sopa coreana.

**Candidato 3.5**
- **Nota:** `그릇에 밥이 있어요.`
- **Traducción:** Hay arroz en el cuenco.
- **Respuesta:** Close-up del cuenco con arroz blanco
- **Distractores:** refrigerador, olla, alacena
- **Pista 1:** `그릇` = cuenco / plato hondo.
- **Pista 2:** `밥` = arroz (cocido).

---

#### SLOT 4 · Decir la hora correcta
**Cuarto:** 3 · **Tipo:** Creación con tiles (drag-and-drop) · **Gramática foco:** G031 + G032 + G012

**Candidato 4.1**
- **Reloj muestra:** 8:00
- **Respuesta:** `지금 여덟 시예요.`
- **Tiles:** [지금] [여덟] [시예요] + distractores: [아홉] [일곱] [분]
- **Pista 1:** Números nativos: 하나·둘·셋·넷·다섯·여섯·**일곱**·**여덟**·아홉·열.
- **Pista 2:** "Es la X (en punto)" → `X 시예요`.

**Candidato 4.2**
- **Reloj muestra:** 9:30
- **Respuesta:** `지금 아홉 시 삼십 분이에요.`
- **Tiles:** [지금] [아홉] [시] [삼십] [분이에요] + distractores: [여덟] [오십]
- **Pista 1:** Hora usa números nativos (`아홉` = 9). Minutos usan sino-coreanos (`삼십` = 30).
- **Pista 2:** Estructura: `[hora] 시 [minutos] 분`.

**Candidato 4.3**
- **Reloj muestra:** 7:00
- **Respuesta:** `지금 일곱 시예요.`
- **Tiles:** [지금] [일곱] [시예요] + distractores: [여섯] [여덟]
- **Pista 1:** `일곱` = siete (número nativo).
- **Pista 2:** En punto = `X 시예요`.

**Candidato 4.4**
- **Reloj muestra:** 6:00
- **Respuesta:** `지금 여섯 시예요.`
- **Tiles:** [지금] [여섯] [시예요] + distractores: [일곱] [다섯]
- **Pista 1:** `여섯` = seis.
- **Pista 2:** Patrón: `지금 + [número] + 시예요`.

**Candidato 4.5**
- **Reloj muestra:** 11:00
- **Respuesta:** `지금 열한 시예요.`
- **Tiles:** [지금] [열한] [시예요] + distractores: [열] [열두]
- **Pista 1:** 11 en nativo = `열한` (no `열일`).
- **Pista 2:** 10 + 1 → `열` + `한` → `열한 시`.

---

#### SLOT 5 · Responder a halmeoni y abrir el candado (FINAL)
**Cuarto:** 4 · **Tipo:** Creación (oración completa con tiles) · **Gramática foco:** G005 + G012 + G032 (integración)

> **Mecánica:** El nombre del café y la hora se establecen en notas de cuartos previos y se randomizan al inicio del run. El candidato del Slot 5 controla qué PREGUNTA hace halmeoni; el contenido específico de la respuesta usa los valores que el jugador ya leyó.

**Candidato 5.1**
- **Pregunta de halmeoni:** `어디에서 만나요?`
- **Traducción:** ¿Dónde nos vemos?
- **Respuesta esperada (ej):** `별빛 카페에서 만나요.`
- **Tiles:** [별빛 카페에서] [만나요] + distractores: [별빛 카페에] [별빛 카페가]
- **Pista 1:** El nombre del café está en una nota anterior.
- **Pista 2:** "Lugar DONDE pasa una acción" usa `에서`, no `에`.

**Candidato 5.2**
- **Pregunta:** `몇 시에 가요?`
- **Traducción:** ¿A qué hora vas?
- **Respuesta esperada:** `열 시에 가요.`
- **Tiles:** [열] [시에] [가요] + distractores: [시예요] [에서]
- **Pista 1:** La hora está en una nota o el reloj anterior.
- **Pista 2:** "A LA hora X" usa `에`, no `에서`.

**Candidato 5.3**
- **Pregunta:** `어디에 가요?`
- **Traducción:** ¿A dónde vas?
- **Respuesta esperada:** `햇살 카페에 가요.`
- **Tiles:** [햇살 카페에] [가요] + distractores: [햇살 카페에서] [가세요]
- **Pista 1:** El destino se marca con `에` + verbo de movimiento (`가다`).
- **Pista 2:** No es `에서` (lugar de acción) — es `에` (destino).

**Candidato 5.4**
- **Pregunta:** `몇 시에 카페에서 만나요?`
- **Traducción:** ¿A qué hora nos vemos en el café?
- **Respuesta esperada:** `여덟 시에 카페에서 만나요.`
- **Tiles:** [여덟 시에] [카페에서] [만나요] + distractores: [여덟 시에서] [카페에] [봐요]
- **Pista 1:** Necesitas tanto la hora como el lugar del encuentro (ambos están en notas previas).
- **Pista 2:** "A la hora X" → `시에` (G032). "En el lugar donde pasa la acción" → `에서` (G005).

> **Nota de diseño:** este candidato reemplaza al 5.4 de la v1 (`할머니가 어디에 있어요?`), que sonaba forzado narrativamente porque halmeoni se enviaba un mensaje a sí misma. El nuevo 5.4 integra G032 + G005 en una sola oración — más difícil pero más útil como puzzle de cierre.

**Candidato 5.5**
- **Pregunta:** `무엇이 있어요?`
- **Traducción:** ¿Qué hay?
- **Respuesta esperada:** `지도가 있어요.`
- **Tiles:** [지도가] [있어요] + distractores: [지도이] [없어요]
- **Pista 1:** Pregunta "qué hay" → respondes con `[cosa] + 이/가 + 있어요`.
- **Pista 2:** `지도` termina en vocal → usa `가`.

### 12.7 Cosméticos del nivel 1

Tema: **"Amanecer en el minbak"**

| Tier | Cómo se desbloquea | Cosmético | Descripción visual |
|---|---|---|---|
| 🟢 Común | Completar el nivel (incluso usando Pista 2) | **Fondo "Minbak Sunrise"** | Pixel art del techo del hanok con amanecer rosa-melocotón |
| 🔵 Raro | Completar **sin usar Pista 2 en ningún puzzle** | **Marco "Delantal de Halmeoni"** | Marco de perfil con estampado de delantal coreano floreado |
| 🟣 Épico | Sin Pista 2 + run < 8 min | **Avatar "Linterna Hanji"** | Avatar pixel animado: silueta con linterna de papel coreano brillando |
| 🟡 Legendario | 3 runs consecutivos sin game over (sin Pista 2 en ningún run de la racha) | **Set completo + título "민박 손님"** | Avatar + marco + fondo + título "Huésped del minbak" |

### 12.8 Lista de assets del nivel 1

#### Imágenes pixel art (16 totales)

**Escenas principales (4):**
- [ ] `room-01-bedroom.png` (320×240)
- [ ] `room-02-living.png` (320×240)
- [ ] `room-03-kitchen.png` (320×240)
- [ ] `room-04-entrance.png` (320×240)

**Close-ups (10):**
- [ ] `note-01.png` (128×128)
- [ ] `note-02.png` (128×128)
- [ ] `note-03.png` (128×128)
- [ ] `note-final.png` (128×128)
- [ ] `obj-fridge.png` (128×128) — refrigerador con manzana
- [ ] `obj-table-bread.png` (128×128) — mesa con pan
- [ ] `obj-cupboard.png` (128×128) — alacena con tazas
- [ ] `obj-pot.png` (128×128) — olla con sopa
- [ ] `obj-bowl.png` (128×128) — cuenco con arroz
- [ ] `obj-clock.png` (96×96)

**Estados y cinemáticas (4):**
- [ ] `lock-closed.png`
- [ ] `lock-open.png`
- [ ] `cinematic-intro.png` — exterior hanok amanecer
- [ ] `cinematic-outro.png` — calle con café a lo lejos

**Cosméticos del nivel (4):**
- [ ] `cosmetic-bg-sunrise.png`
- [ ] `cosmetic-frame-apron.png`
- [ ] `cosmetic-avatar-lantern.png` (animado, 2-4 frames)
- [ ] `cosmetic-set-complete.png` (preview)

Todos los assets viven bajo `munbeop/public/escape-room/level-01/`.

#### Audio del nivel 1

**Voz halmeoni (TTS coreano, una sola voz consistente):**
- [ ] Saludo apertura: `잘 잤어요? 안녕!`
- [ ] 5 lecturas de notas Slot 1
- [ ] 5 lecturas de notas Slot 2
- [ ] 5 lecturas de notas Slot 3
- [ ] 5 preguntas finales Slot 5
- [ ] Cierre: `잘 가요. 카페에서 봐요!`
- Total: **22 líneas**. El Slot 4 no necesita voz (es visual, el reloj habla por sí solo).

**Ambient (4 loops):**
- [ ] `ambient-bedroom.ogg` — pájaros mañana
- [ ] `ambient-living.ogg` — silencio cálido + reloj viejo
- [ ] `ambient-kitchen.ogg` — burbujeo olla + gota grifo
- [ ] `ambient-entrance.ogg` — silencio + viento leve

**SFX:**
- [ ] `sfx-paper-rustle.ogg`
- [ ] `sfx-door-slide.ogg`
- [ ] `sfx-lock-click.ogg`
- [ ] `sfx-correct.ogg` — pluck gayageum
- [ ] `sfx-wrong.ogg`
- [ ] `sfx-unlock-victory.ogg` — campana templo + acorde
- [ ] `sfx-select.ogg`

#### UI

- [ ] Marco de panel de puzzle (estilo pixel hanji)
- [ ] Botón "pista" (icono linterna)
- [ ] Indicador de tier de recompensa (4 estrellas)
- [ ] Pantalla "Game Over" estilo Stardew Valley (no agresiva)
- [ ] Pantalla de victoria con cosmético desbloqueado

### 12.9 Estimación de producción del Nivel 1

| Fase | Horas |
|---|---|
| Escritura de puzzles + revisión gramática | ~10 h (ya cubierto en este doc) |
| Generación arte (16 imágenes pixel) | 30-50 h |
| Audio TTS + edición | 5-8 h |
| Programación motor del juego (Vue + Pinia + Howler) | 40-60 h (una sola vez para toda la franquicia) |
| Integración + testing (incluye tests unitarios de `shuffle/scoring/rules`) | 15-25 h |
| **Total Nivel 1** | **100-150 h** (~3-4 semanas full-time, 6-8 semanas part-time) |

Niveles 2+: ~50-80 h cada uno (motor ya hecho).

---

## 13. Decisiones abiertas

Cosas asumidas en este documento que necesitan visto bueno explícito antes de avanzar a producción:

| # | Decisión asumida | Alternativa | Necesario para |
|---|---|---|---|
| 1 | Reinicio en game over = nivel actual | Reinicio del juego entero | Cerrar la mecánica roguelike |
| 2 | 2 errores = game over | 1 (más brutal) o 3 (más permisivo) | Configurar la dificultad inicial |
| 3 | Gramáticas del Nivel 1: G003, G005, G012, G027, G031, G032 | Otra combinación TOPIK 1 | Empezar producción del Nivel 1 |
| 4 | Tono "minbak con halmeoni" (cálido/Ghibli) | Misterio, aventura, horror suave | Empezar concept art del Nivel 1 |
| 5 | Fuente Hangul: Neodgm | Galmuri u otra | Decidir UI y arte |
| 6 | 4 tiers de cosméticos | Simplificar a 2 (común/raro) | Cerrar sistema de recompensas |
| 7 | V1 textual solo en `es`, shape `LocalizedString` reservado | Llenar los 8 locales desde V1 (TTS solo `ko`) | Definir scope de traducción V1 |

> La fila "framework de la plataforma" de la v1 ya se cerró: la plataforma corre en **Nuxt 4 + Vue 3 + Pinia + Tailwind**, y el escape room hereda ese stack (ver Sección 9). Se elimina de esta lista.

---

## 14. Siguientes pasos

Una vez confirmadas las 7 decisiones abiertas, el orden de implementación es:

1. **Crear `app/lib/domain/escape-room.ts`** con los tipos `Level`, `Room`, `Slot`, `Candidate` (selección/completar/creación), `Hint`, `Reward`. Es la fundación type-checked de todo el resto.
2. **Crear `app/lib/escape-room/shuffle.ts`, `scoring.ts`, `rules.ts`** con tests unitarios en `tests/unit/escape-room/`. Estos módulos son puros (sin Vue), fáciles de testear, y encapsulan toda la lógica del juego.
3. **Cablear el store Pinia `app/stores/escape-room.ts`** con: estado del run actual (cuarto activo, candidatos sorteados, errores cometidos, pistas usadas, tiempo transcurrido).
4. **Escribir `app/seed/escape-room/level-01.ts`** transcribiendo las 5 secciones de puzzle de este documento al shape de `Level` (con `LocalizedString` rellenado en `es`, los otros 7 locales pueden quedar vacíos y caer al fallback).
5. **Construir el prototipo de UN cuarto** (`Room.vue` + `SlotSelection.vue` + `HintPanel.vue`) renderizando el Slot 1 con placeholders de imagen — solo para validar la arquitectura.
6. **Generar arte real** del Cuarto 1 + sus 5 candidatos visuales, sustituir placeholders.
7. **Producir TTS coreano** de las 22 líneas de halmeoni con voz consistente, exportar a OGG bajo `public/escape-room/level-01/audio/`.
8. **Integrar Howler.js** vía `composables/useAudio.ts` con loops ambient + SFX + voz.
9. **Resto de cuartos y slots**, iterando.
10. **Página `pages/escape-room/[levelId].vue`** con embed responsive (móvil + desktop).
11. **QA con usuarios reales** — 5-10 personas que aprendan coreano juegan el Nivel 1, ajustar dificultad/timing en base a observación.

---

## Histórico de cambios

- **2026-06-11 (v3)** — UX nueva + implementación V1 completa:
  - `/practice` es ahora un hub de cartas (`GameCard`); la ruleta vive en `/practice/ruleta`.
  - Selector de niveles = libreta hojeable (`LevelBook`/`LevelPage`) con covers, rewards, intentos y START por hoja.
  - `Level` ganó `tagline`, `voiceIntro`, `voiceOutro`; `intro`/`outro` son narrativa ambiental multipárrafo.
  - `LEVEL_REGISTRY` con las 10 narrativas (1 jugable + 9 anunciadas) y covers de inspiración.
  - Gameplay completo: `IntroCinematic` (typewriter), `SlotCompletion`, `SlotCreation` (fichas táctiles), `VictoryScreen` (tier + cosmético + outro), `GameOverScreen` (suave, retry sin cinemática), tabs de cuartos, corazones de intentos.
  - Todo el chrome UI internacionalizado (`games.*`, `escape.*` × 8 locales).
- **2026-06-09 (v2)** — Correcciones tras revisión:
  - Stack alineado con la plataforma real (Nuxt 4 + Vue 3 + Pinia + Tailwind), no React + Zustand.
  - Localización elevada a decisión bloqueada (D12): `LocalizedString` reservado desde V1; texto rellenado en `es`, los otros 7 locales caen al fallback.
  - Resuelta la contradicción Sección 5 vs Sección 7: **Pista 2 en cualquier puzzle → solo se otorga Común**.
  - Slot 1: distractores reescritos siguiendo la heurística D1/D2/D3 (negación, sustantivo, lugar) — los anteriores eran trivialmente descartables.
  - Slot 1 Cand 1.3: normalizado el saludo a `안녕!` (era `안녕하세요`, inconsistente con los otros 4 candidatos).
  - Slot 5 Cand 5.4: reemplazado (`할머니가 어디에 있어요?` rompía la ficción; el nuevo `몇 시에 카페에서 만나요?` integra G032 + G005 limpiamente).
  - G031 y G032 separados en la tabla de gramáticas del nivel (eran códigos distintos tratados como uno).
  - Decisión "framework de la plataforma" eliminada de las abiertas — ya está cerrada (Nuxt 4).
  - Sección 8: "Genkan" eliminado (es término japonés); ahora solo `현관 (hyeon-gwan)`.
  - Sección 9 ampliada con: localización detallada, ubicación exacta de archivos en el repo, TypeScript schema del nivel.
  - Sección 14 reescrita como secuencia concreta de archivos a crear, en orden de dependencia.
  - Asset filenames normalizados a kebab-case (alineado con convenciones del repo).
- **2026-06-09 (v1)** — Documento maestro creado. Consolida todas las decisiones de diseño hasta la fecha + dossier completo del Nivel 1. Reemplaza el `nivel_01.md` previo (ya borrado).
