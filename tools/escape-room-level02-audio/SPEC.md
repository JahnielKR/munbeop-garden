# Especificación de audio — Escape Room Nivel 2 «El templo de la lluvia (청우사)»

Referencia obligatoria para todo `gen_*.py` de **audio** de esta carpeta. Fuente
narrativa: `docs/escape-room-level-02.md`. Rutas de runtime (los `ambientAudio`
por cuarto + las voces): `munbeop/app/seed/escape-room/level-02.ts`.

Hermana de `tools/escape-room-level02/STYLE.md` (el pipeline de **arte**): misma
disciplina de carpeta (`common.py` = librería compartida, `out/` = solo review),
mismo determinismo, mismo «no puedo verlo/oírlo, lo juzgo por métricas». Lo que
cambia es el medio: aquí síntesis DSP en vez de pixel-art.

## Tono (el mismo de la biblia visual, traducido a sonido)

«El jardín de las palabras» (Shinkai) × un episodio quieto de «Mushishi»:
**melancolía luminosa, duelo sereno bajo lluvia constante. NO terror, NO
retro-arcade, NO melodrama.** La tarde del día 49 (49재) por un maestro muerto.

Reglas de sonido que se derivan de eso:

- **Todo es suave y filtrado paso-bajo.** La lluvia se oye *a través* de tejados,
  puertas, aleros — nunca cruda. Los graves dominan; los agudos son escasos.
- **El calor es el único contraste**, igual que en el arte: la brasa que cruje,
  el agua que hierve, el ronroneo del gato. Pequeños, cercanos, cálidos.
- **El silencio es un material.** Los lechos ambientales dejan respirar; el cuarto
  4 «despejado» es casi-silencio con gotas espaciadas.
- **La campana (범종) es EL sonido del nivel.** Un único tañido brillante de bronce
  con un 여음 (resonancia) larguísimo y palpitante (맥놀이). Toda la historia se
  apoya en ese sonido — su síntesis es la pieza más cuidada del pipeline.

## Estándar de formato (CADA archivo, sin excepción)

- **44100 Hz · MONO · OGG/Vorbis.** Escritura única vía
  `soundfile.write(path, samples_float32, 44100, format='OGG', subtype='VORBIS')`,
  envuelto por `common.write_ogg()`.
- **Muestras estrictamente en (−1, 1).** `write_ogg` aplica un *hard-guard* a
  `|x| < 0.999` (`CLIP_GUARD`): deja headroom y **nunca** clipea. El que escribe
  deja margen; el guard es la última red, no la herramienta de nivel.
- **Niveles objetivo** (dBFS):
  | Familia | Normalización | Objetivo |
  |---|---|---|
  | SFX | pico | `peak ≈ −1.0 dBFS` (`PEAK_SFX_DBFS`) |
  | Lechos ambientales | RMS + techo de pico | `RMS ≈ −22 dBFS` (`AMBIENT_RMS_DBFS`), `peak < −6 dBFS` (`AMBIENT_PEAK_CEIL_DBFS`) |
  | Voz | pico | `peak ≈ −2.0 dBFS` (`PEAK_VOICE_DBFS`) |
  Los lechos se normalizan con `normalize_rms()` y luego se escriben con
  `write_ogg(..., normalize=False)` para **no** pisar el RMS con una
  re-normalización de pico.
- **Determinismo.** Síntesis procedural (ambiente + SFX) = determinista: siembra
  con `common.rng(SEED)` (`np.random.default_rng`). Re-ejecutar → buffer float
  idéntico → OGG estable. Vorbis es *lossy*, pero el buffer de entrada es
  byte-idéntico, así que el archivo es reproducible. La **voz** (edge-tts) NO
  necesita ser byte-determinista.
- **No puedes escuchar.** Calidad = diseño DSP + propiedades medibles. Tras
  escribir CADA archivo: léelo de vuelta con `read_ogg()` y corre `analyze()`;
  confirma `sr=44100`, mono, duración objetivo, pico/RMS en banda, centroide
  espectral plausible, T60 (campana/reverb) y discontinuidad de costura (loops).

### Nota de medición (importante)

- **La costura del loop se mide sobre el buffer float PRE-escritura**
  (`loop_seam_discontinuity(buffer)` antes de `write_ogg`). Vorbis introduce una
  pequeña discontinuidad de frontera de frame al leer un buffer no-bucleado, que
  infla la métrica post-codec (~0.14 en pruebas) aunque el loop float esté
  perfecto (~0.04). El objetivo es **< 0.05 en el buffer float**.
- `est_t60` es honesto para eventos únicos (campana, colas de reverb, anillos de
  gota); **no** para ruido estacionario (un lecho de lluvia devuelve un T60 sin
  sentido — no lo uses como criterio ahí).

## Manifiesto de audio

Todo bajo `munbeop/public/escape-room/level-02/audio/`. Los `ambientAudio` del
seed se resuelven como `audio/<archivo>` (ver `level-02.ts`). Las voces viven
bajo `audio/voice/`.

### Lechos ambientales — 5 loops (12–20 s, sin costura)

Loop sin click vía `seamless_loop()`; `normalize_rms(−22, techo −6)`; escritura
`normalize=False`. Base de lluvia = `pink_noise` (+ `brown_noise` para cuerpo
grave) con paso-bajo según cuánto «la amortigua» la arquitectura.

| Archivo | Dur. | Nivel | Intención de diseño | Centroide aprox. |
|---|---|---|---|---|
| `ambient-dasil.ogg` | 16 s | RMS −22, pk <−6 | Lluvia en el tejado + crepitar débil del brasero (화로) + tetera lejana. El cuarto cálido: pink-noise LP ~2 kHz + granos de brasa (chasquidos cortos, banda 2–5 kHz, raros y deterministas) + un silbido casi-inaudible de tetera (sinusoide ~1.4 kHz con vibrato leve, muy bajo). | ~600–1100 Hz |
| `ambient-daeungjeon.ogg` | 16 s | RMS −22, pk <−6 | Lluvia amortiguada por las puertas abiertas + crujidos de madera. Lluvia más oscura (LP ~1.2 kHz, sin agudos) + crujidos: tonos de madera (50–200 Hz) con envolvente lenta y muy esporádicos. Sala grande, vacía. | ~400–800 Hz |
| `ambient-seungbang.ogg` | 14 s | RMS −22, pk <−6 | La lluvia más íntima + goteo cercano del alero. El cuarto más austero: lluvia muy queda (LP ~1 kHz, RMS algo más bajo dentro de la banda) + gotas de alero cercanas y nítidas (anillos resonantes cortos, `env_exp_decay` ~80 ms, banda 800–2500 Hz) espaciadas. Casi monocromo, como su arte. | ~500–900 Hz |
| `ambient-jongnu.ogg` | 18 s | RMS −22, pk <−6 | Lluvia abierta + viento del valle. Pabellón sin paredes: lluvia más ancha (LP ~3 kHz) + capa de viento (`brown_noise` + `bandpass` 200–900 Hz con LFO de amplitud muy lento). El más espacioso y frío. | ~700–1400 Hz |
| `ambient-jongnu-clear.ogg` | 18 s | RMS −22, pk <−6 | Post-lluvia: gotas espaciadas, pájaros tímidos, silencio aireado. El estado «despejado» del cuarto 4: casi-silencio (lecho de aire muy bajo) + gotas sueltas (anillos espaciados, cada vez más raros) + 1–2 trinos cortos de pájaro (sinusoides moduladas FM suaves, lejanas). Lo escucha el jugador tras el tañido. | ~900–1800 Hz |

> El seed actual define `ambient-{dasil,daeungjeon,seungbang,jongnu}.ogg`.
> `ambient-jongnu-clear.ogg` es el lecho del estado limpio del cuarto 4 (post-
> tañido); el motor lo cruza tras el Slot 6 (o lo cablea la capa de escena). Si el
> seed aún no lo referencia, queda listo para cuando el estado «clear» se conecte.

### SFX — 8 efectos

Normalización de pico a −1 dBFS (`write_ogg` por defecto). Deterministas con
`rng(SEED)`. Fundidos de extremo con `fade_io` salvo donde un onset seco sea el
punto (moktak).

| Archivo | Dur. | Intención de diseño | Métricas clave |
|---|---|---|---|
| `sfx-bell-toll.ogg` | **≥ 10 s** | **EL asset.** 범종: golpe brillante de bronce → 여음 que decae **≥ 8 s**. `additive_bell(f0≈70–110 Hz, BELL_PARTIALS inarmónicos, decay_t60≈9 s, beat_hz≈1.1)`: parciales inarmónicos, el más grave partido en par desafinado para el **맥놀이** (palpitación lenta), transitorio de golpe brillante (ruido filtrado 1.8–7 kHz, ~50 ms) sobre el ataque, thud grave de masa. Luego `reverb(decay_t60≈2.5, tail_s≈1)` para que el bronce florezca en piedra+madera. | `t60 ≥ 8 s` (여음), `dur ≥ 10 s`, `peak ≈ −1`, centroide del cuerpo grave (~120–180 Hz) |
| `sfx-moktak.ogg` | ~0.25 s | Golpe seco de pez de madera (목탁). Click de cuerpo de madera: par de modos cortos (300/900 Hz aprox.) con `env_adsr` de ataque casi-cero y decay rápido + un toque de ruido filtrado para el «tok». Seco, sin reverb (o reverb mínima de sala). | `dur ~0.25 s`, ataque < 5 ms, `t60 < 0.2 s` |
| `sfx-tea-pour.ogg` | ~3 s | Vertido de té con resonancias de «glug». Chorro = ruido `bandpass` (1–4 kHz) modulado en amplitud + burbujas: serie de `glug` (sinusoides de pitch ascendente, `env_exp_decay` cortas, banda 200–700 Hz) que descienden de frecuencia al llenarse la taza. Cálido, doméstico. | `dur ~3 s`, centroide medio, RMS estable |
| `sfx-paper-page.ogg` | ~0.5 s | Vuelta de página. Ráfaga de ruido `highpass` (~2 kHz) con envolvente de «swish» (dos sub-eventos: el roce + el asentamiento), muy corta. Papel hanji, no cartón. | `dur ~0.5 s`, centroide alto (>3 kHz), `peak ≈ −1` |
| `sfx-brush-sign.ogg` | ~0.8 s | Raspado de pincel sobre papel (la firma). Ruido `bandpass` (1.5–6 kHz) modulado por una envolvente de presión (sube-baja, como un trazo) + grano de fricción. Un solo trazo, íntimo. | `dur ~0.8 s`, centroide alto, envolvente con cresta media |
| `sfx-door-wood.ogg` | ~0.7 s | Puerta corrediza de madera. Roce de riel = ruido `bandpass` (300–1500 Hz) con `env_adsr` (ataque suave, meseta, release) + un «tonk» de tope al final (modo de madera corto). Hanok, no chirrido de terror. | `dur ~0.7 s`, centroide medio-bajo, golpe final |
| `sfx-rain-stop.ogg` | ~10–12 s | Decaimiento en 3 fases (la lluvia parando). Fase 1 «cortina» (lluvia llena, `brown+pink` LP ~2.5 kHz) → fase 2 «hilos» (se adelgaza, baja densidad y nivel) → fase 3 «gotas» (anillos sueltos cada vez más raros) → casi-silencio. Crossfades de fase con envolventes. El sonido del clímax del nivel — la lluvia muere por fases tras el tañido. | `dur ~10–12 s`, RMS descendente monótono, centroide subiendo (queda lo agudo de las gotas) |
| `sfx-cat-purr.ogg` | ~3 s | Ronroneo grave AM, loopable. Portadora grave (~25–30 Hz cuerpo + armónicos bajos) modulada en amplitud a ~25 Hz (la pulsación del ronroneo) con `pink_noise` LP de textura. `seamless_loop` para que el cosmético lo cicle. Cercano, cálido. | `dur ~3 s` (loop), graves dominantes, `loop_seam < 0.05` |

### Voz — 29 líneas TTS coreanas (las escribe un agente hermano)

Bajo `audio/voice/`. **Una sola voz masculina consistente** `ko-KR-InJoonNeural`,
`rate −10%` (vía edge-tts). Pico ≈ −2 dBFS (`PEAK_VOICE_DBFS`). No necesita ser
byte-determinista. El inventario exacto de 29 líneas (intro/outro + las líneas
fijas del monje 우담 por cuarto/slot + las de los pools) lo define y autora el
agente de voz a partir de `docs/escape-room-level-02.md` §11/§7 y de los
`voiceLine`/`voiceIntro`/`voiceOutro` del seed. Líneas ancla ya en el seed:

- `voiceIntro`: «어서 오세요. 비가 그칠 때까지 차 한잔 해요.»
- `voiceOutro`: «비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.»
- (slot-3) «…스승님이 보내신 것 같아요.»
- (cup) «스승님이 떠나신 후에도 매일 두 잔을 준비했어요.»

> Este `common.py` aporta a la voz solo el estándar de E/S: `write_ogg(path,
> samples, peak_dbfs=PEAK_VOICE_DBFS)` re-empaqueta el MP3 de edge-tts a OGG/Vorbis
> mono 44.1 k normalizado a −2 dBFS, y `read_ogg`/`analyze` lo verifican.

**Conteo:** 5 lechos + 8 SFX + 29 voces = **42 archivos de audio**.

## Shared helpers API (`common.py`)

La librería DSP compartida. Mono, 44100 Hz, float32. Cada helper lleva docstring
nombrando a sus consumidores. (Todas las frecuencias en Hz, tiempos en segundos.)

### Constantes / rutas

`SR=44100`, `EPS`, `CLIP_GUARD=0.999`, `PEAK_SFX_DBFS=−1.0`,
`PEAK_VOICE_DBFS=−2.0`, `AMBIENT_RMS_DBFS=−22.0`, `AMBIENT_PEAK_CEIL_DBFS=−6.0`,
`HERE`, `REPO`, `AUDIO_DIR`, `VOICE_DIR`, `OUT_DIR`, `BELL_PARTIALS`.

### Funciones

| Función | Firma | Rol | Consumidores |
|---|---|---|---|
| `rng` | `(seed) -> Generator` | La ÚNICA fuente de azar (determinismo) | todo generador procedural + todo `gen_*.py` |
| `db_to_amp` / `amp_to_db` | `(db)` / `(amp)` | dBFS ↔ amplitud lineal | normalizadores, análisis |
| `peak_dbfs` | `(x) -> float` | Pico en dBFS | self-check de todo writer |
| `rms_dbfs` | `(x) -> float` | RMS en dBFS (loudness real de lechos) | writers de ambiente |
| `duration_s` | `(x, sr=SR)` | Duración en s | análisis |
| `spectral_centroid` | `(x, sr=SR)` | Frecuencia media ponderada (brillo) | todo writer |
| `spectral_bandwidth` | `(x, sr=SR)` | Dispersión espectral (timbre) | dumps de QA |
| `est_t60` | `(x, sr=SR)` | T60 de un decaimiento (campana/reverb) | bell, reverb, gotas |
| `loop_seam_discontinuity` | `(x) -> float` | Salto en la costura del loop (mídelo PRE-codec) | writers de loops |
| `normalize_peak` | `(x, peak_dbfs=−1)` | Escala a un pico objetivo | SFX, voz |
| `normalize_rms` | `(x, rms_dbfs=−22, peak_ceiling_dbfs=−6)` | Escala a RMS con techo de pico | lechos ambientales |
| `write_ogg` | `(path, x, peak_dbfs=−1, normalize=True, sr=SR) -> Path` | **Writer único**: mono+normaliza+guard `<0.999`+resuelve bajo `audio/`+escribe OGG/Vorbis | todo `gen_*.py` |
| `read_ogg` | `(path) -> (x, sr)` | Lee de vuelta (mono float32) para verificar | self-check de todo writer |
| `save_out_ogg` | `(name, x, peak_dbfs=−1)` | OGG de review en `out/` (no se embarca) | renders de preview |
| `white_noise` | `(n, gen, amp=1)` | Ruido blanco | pink, lluvia, vertido, rain-stop |
| `pink_noise` | `(n, gen, amp=1)` | Ruido rosa 1/f (lecho natural de lluvia) | todos los lechos de lluvia, purr |
| `brown_noise` | `(n, gen, amp=1)` | Ruido marrón 1/f² (cuerpo grave/viento) | jongnu (viento), rain-stop |
| `lowpass` | `(x, cutoff, order=4, sr=SR)` | Paso-bajo butterworth `filtfilt` | casi todo (el sonido suave) |
| `highpass` | `(x, cutoff, order=4, sr=SR)` | Paso-alto butterworth `filtfilt` | gotas, página/pincel, mezcla |
| `bandpass` | `(x, low, high, order=4, sr=SR)` | Paso-banda butterworth `filtfilt` | tea-pour, viento, purr, golpe |
| `peaking` | `(x, f0, gain_db, q=1, sr=SR)` | EQ peaking RBJ (resonancia/realce) | tea-pour, color ambiental, purr |
| `apply_envelope` | `(x, env)` | Multiplica por envolvente (ajusta longitud) | todo lo que modula |
| `env_adsr` | `(n, attack, decay, sustain, release, sr=SR)` | Envolvente ADSR | moktak, door, brush, granos de purr |
| `env_exp_decay` | `(n, t60, sr=SR)` | Decaimiento exponencial (−60 dB en t60) | parciales de campana, colas de reverb, gotas |
| `fade_io` | `(x, fade_in_s=0, fade_out_s=0, sr=SR)` | Fundidos raised-cosine de extremo | SFX, previews de ambiente |
| `reverb` | `(x, decay_t60=2.5, mix=0.35, sr=SR, tail_s=None)` | Reverb Schroeder (4 combs + 2 allpass) | **bell (여음)**, rain-stop, moktak, color |
| `additive_bell` | `(f0=92, partials=BELL_PARTIALS, decay_t60=9, beat_hz=1.1, sr=SR, dur_s=None, gen=None)` | **범종**: parciales inarmónicos + 맥놀이 + 여음 + golpe brillante | `sfx-bell-toll` |
| `seamless_loop` | `(x, crossfade_s=1.0, sr=SR)` | Crossfade equal-power de cola sobre cabeza (loop sin click) | los 5 lechos, sfx-cat-purr |
| `analyze` | `(x, sr=SR) -> dict` | Reporte de QA de una sola llamada (dur/peak/rms/centroide/bw/t60/seam) | self-check de todo writer |

### Detalles de diseño que el QA verifica

- **`write_ogg`** es la única vía de escritura de assets embarcados. Garantiza
  mono, `|x| < 0.999`, OGG/Vorbis 44.1 k, y rutas bajo `audio/`. Para lechos:
  `normalize_rms(...)` y luego `write_ogg(..., normalize=False)`.
- **`additive_bell`** es la pieza estrella: parciales inarmónicos de `BELL_PARTIALS`
  (los agudos decaen más rápido → brillante en el golpe, oscuro en la cola), el
  parcial más grave partido en par desafinado a `beat_hz` para el 맥놀이, y un
  transitorio de golpe. Verificar `t60 ≥ 8 s` y `dur ≥ 10 s`. Pasar por `reverb`.
- **`reverb`** usa delays de comb casi-coprimos (29.7/37.1/41.1/43.7 ms) para
  evitar timbre metálico; allpasses (5/1.7 ms) difunden; paso-bajo en la cola
  húmeda (los cuartos pierden agudos al decaer). `tail_s` permite que la cola
  suene más allá de la señal seca.
- **`seamless_loop`** acorta el buffer en `crossfade_s` y mezcla la cola sobre la
  cabeza con pesos equal-power; el resultado se reproduce extremo-a-extremo sin
  click. Verificar con `loop_seam_discontinuity()` **sobre el buffer float**.
- **Determinismo**: ningún `np.random.*` global. Siembra con `rng(SEED)` y pásalo.

## Flujo de trabajo obligatorio por script

1. `python tools/escape-room-level02-audio/gen_<clave>.py` desde la raíz del repo.
2. El script sintetiza determinista (`rng(SEED)`), escribe el asset final con
   `write_ogg` (o `normalize_rms`+`write_ogg(normalize=False)` para lechos), y
   guarda un preview en `out/` si ayuda a la revisión.
3. **Verifica con métricas** (no puedes oírlo): `read_ogg` el archivo y corre
   `analyze`; confirma `sr=44100`, mono, duración objetivo, pico/RMS en banda,
   centroide plausible, T60 (campana/reverb) y costura (loops, PRE-codec). Itera
   el diseño DSP hasta que las métricas casen con la tabla del manifiesto.
4. `common.py` es la librería compartida (puede exceder 400 líneas); los
   `gen_*.py` de escena se mantienen pequeños.
