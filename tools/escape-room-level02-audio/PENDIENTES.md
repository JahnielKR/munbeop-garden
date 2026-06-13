# PENDIENTES — QA técnico de audio · Escape Room Nivel 2 «El templo de la lluvia (청우사)»

Fecha: 2026-06-13 · Revisor: QA automatizado (no se puede escuchar; juicio por
propiedades medibles). Hojas de contacto espectrales en `out/contact_*.png`,
reporte crudo en `out/qa_report.json`.

> **Aviso importante.** Todo este audio es **sintetizado** (ambiente + SFX por DSP
> procedural en `gen_ambient.py`/`gen_sfx.py`) o **TTS** (las 29 voces, edge-tts
> `ko-KR-InJoonNeural`). Las métricas confirman que es **técnicamente sólido** —
> formato, niveles, sin clipping, sin silencios, loops sin costura, cola de campana
> larga, espectros plausibles. Lo que las métricas **no** pueden confirmar es el
> juicio del oído: musicalidad, naturalidad de la voz, si la lluvia «suena» a
> lluvia. **Todos los archivos quedan pendientes de una QA de oído humano antes de
> considerarse finales.** Abajo se separa lo medible-sólido de lo que más conviene
> re-escuchar/reemplazar.

## Veredicto global (medible)

- **42/42 archivos presentes** (5 ambiente + 8 SFX + 29 voz). ✔
- **42/42 OGG/Vorbis · 44100 Hz · MONO.** ✔
- **0 archivos con clipping** (`|x| ≥ 0.999`); ninguno silencioso/casi-vacío. ✔
- **Duraciones: todas dentro de su rango objetivo.** ✔
- **Determinismo (ambiente + SFX): el PCM decodificado es byte-idéntico** al
  re-ejecutar `gen_ambient.py` + `gen_sfx.py` (13/13). ✔
  - *Nota menor (no bloqueante):* el contenedor OGG **no** es byte-idéntico entre
    corridas — libvorbis incrusta un serial de stream / vendor string variable en
    la cabecera. Eso **no** afecta a las muestras ni a la reproducción. Si se
    quisiera repetibilidad byte-a-byte del archivo, habría que fijar el serial del
    encoder o post-procesar la cabecera; hoy la garantía es a nivel de muestras,
    que es lo que pide el SPEC («el buffer de entrada es byte-idéntico»).

---

## Ambiente — 5 lechos · TÉCNICAMENTE SÓLIDOS

Todos: 44.1k mono OGG, RMS ≈ −22 dBFS (excepto `jongnu-clear`, por diseño), pico
< −5.9 dBFS (bajo el techo −6 con margen), **costura de loop PRE-codec = 0.0000**
(muy por debajo del objetivo < 0.05; medido por el propio generador). Broadband
confirmado por el ancho de banda espectral (rango de lluvia filtrada paso-bajo),
no por «planitud» (la lluvia está coloreada/filtrada, no es ruido blanco — su
planitud espectral es baja a propósito).

| Archivo | dur | pico | RMS | centroide | bw | costura (pre/post-codec) | Notas |
|---|---|---|---|---|---|---|---|
| `ambient-dasil.ogg` | 16.0s | −7.9 | −22.1 | 774 Hz | 623 Hz | 0.0000 / 0.12 | Sólido. Lluvia cálida + brasa. |
| `ambient-daeungjeon.ogg` | 16.0s | −6.0 | −22.0 | 432 Hz | 318 Hz | 0.0000 / 0.04 | Sólido. La más oscura/amortiguada. |
| `ambient-seungbang.ogg` | 14.0s | −5.9 | −22.7 | 507 Hz | 349 Hz | 0.0000 / 0.01 | Sólido. Íntima, RMS algo más bajo (a propósito). |
| `ambient-jongnu.ogg` | 18.0s | −7.1 | −22.1 | 982 Hz | 892 Hz | 0.0000 / 0.04 | Sólido. La más ancha + viento. |
| `ambient-jongnu-clear.ogg` | 18.0s | −5.9 | **−32.8** | 2385 Hz | 994 Hz | 0.0000 / 0.07 | Sólido **por diseño**: el estado «despejado» es casi-silencio (gotas espaciadas + pájaros). El RMS bajo y el centroide alto son intencionales, NO un defecto. |

**Notas de loop:** la costura post-codec (0.01–0.12) está inflada por la frontera
de frame de Vorbis, exactamente como advierte el SPEC; el criterio real es el
buffer float pre-codec, que es **0.0000** en los cinco. **Loops correctos.**

**Para el oído humano (pendiente):** confirmar que cada lecho «se siente» como su
cuarto (calidez de `dasil`, oscuridad de `daeungjeon`, intimidad de `seungbang`,
amplitud/viento de `jongnu`, aire-post-lluvia de `jongnu-clear`) y que el bucle no
«respira» de forma audible al ciclar. Riesgo bajo, pero es síntesis DSP: puede
sonar a «ruido filtrado» más que a lluvia real para un oído exigente.

---

## SFX — 8 efectos · TÉCNICAMENTE SÓLIDOS

Todos pico ≈ −1 dBFS (objetivo), sin clipping, duración en rango.

| Archivo | dur | pico | RMS | centroide | t60 | Notas |
|---|---|---|---|---|---|---|
| `sfx-bell-toll.ogg` ⭐ | 12.70s | −1.18 | −20.0 | 156 Hz | **12.4s** | **EL asset. Cola (여음) confirmada ≥ 8s.** Energía a 8s = −45 dBFS (vs −11 a 0.5s): 34 dB de caída, sigue audible. Cuerpo grave (centroide ~156 Hz). Parciales inarmónicos + 맥놀이 visibles en la hoja. |
| `sfx-moktak.ogg` | 0.25s | −0.87 | −13.3 | 321 Hz | 0.14s | Sólido. Golpe seco, ataque rápido, t60 < 0.2s. |
| `sfx-tea-pour.ogg` | 3.00s | −0.56 | −18.9 | 2221 Hz | — | Sólido. Banda media, chorro + glugs. |
| `sfx-paper-page.ogg` | 0.50s | −2.81 | −21.2 | 11268 Hz | — | Sólido. Centroide muy alto (>3 kHz, swish de papel). Pico −2.8 (más bajo que −1; aceptable, no clipea). |
| `sfx-brush-sign.ogg` | 0.80s | −1.78 | −18.1 | 3344 Hz | — | Sólido. Raspado de pincel, centroide alto. |
| `sfx-door-wood.ogg` | 0.70s | −0.99 | −17.8 | 32 Hz | 0.19s | Sólido en niveles. Centroide muy bajo (32 Hz) — domina el cuerpo grave/«tonk»; verificar con el oído que el roce del riel se oye y no solo el golpe. |
| `sfx-rain-stop.ogg` | 11.00s | −0.85 | −13.9 | 56 Hz | — | Sólido. Decaimiento en 3 fases (RMS↓ monótono, centroide 68→1692 Hz: quedan las gotas agudas). Clímax del nivel. |
| `sfx-cat-purr.ogg` | 3.00s | −0.97 | −9.6 | 71 Hz | — | Sólido. Loopable: costura pre-codec 0.015 (< 0.05). Graves dominantes (ronroneo AM). |

**Para el oído humano (pendiente):**
- `sfx-bell-toll` — es la pieza estrella; aunque mide perfecto (cola larga,
  맥놀이, golpe brillante), **merece la escucha más cuidadosa**: que el ataque
  «suene a bronce golpeado», que la palpitación lenta sea bella y no mareante, y
  que la cola florezca en la reverb sin volverse metálica.
- `sfx-door-wood` — centroide de 32 Hz sugiere que el «tonk» final domina; oír si
  el roce del riel (300–1500 Hz) está suficientemente presente.
- El resto (moktak, té, página, pincel, rain-stop, purr): bajo riesgo, son texturas
  cortas/de fondo; aun así, oír que no suenan «sintéticos» de más.

---

## Voz — 29 líneas TTS · TÉCNICAMENTE SÓLIDAS (pero son TTS)

`ko-KR-InJoonNeural`, rate −10%. **29/29** presentes. Todas:
- dur > 0.4s (rango real 0.72s–9.46s). ✔
- pico ≤ −1.2 dBFS, objetivo ≈ −2 (rango −2.73…−1.22), **0 con clipping**. ✔
- energía dominante en la banda de habla **200–4000 Hz** (ratio 0.53–0.90, todas
  > 0.5), con estructura de formantes clara en la hoja de contacto. ✔ (espectro
  «speech-like» confirmado.)

Las más cortas (`voice-slot6-correct` 0.72s, ratio 0.53; `voice-outro-exchange-1`
1.34s) y las más largas (`voice-slot5-absolution` 9.46s, `voice-slot5-conf-5`
9.26s) están todas dentro de norma. Ninguna línea es silenciosa ni recortada.

**Para el oído humano (pendiente) — esto es lo más importante de re-escuchar:**
La verificación técnica **no juzga** pronunciación, prosodia ni emoción. Son voces
**TTS**: pueden sonar planas o «robóticas» en las líneas con más carga dramática.
Priorizar la escucha de:
- `voice-intro` / `voice-outro` — abren y cierran el nivel; el tono debe ser cálido
  y sereno.
- `voice-slot5-absolution`, `voice-beat-slot5`, las `voice-slot5-conf-*` — la
  confesión: la emoción TTS es donde más se nota la falta de alma; candidatas nº1
  a reemplazo por voz humana si el presupuesto narrativo lo pide.
- `voice-slot6-farewell-*` — la despedida (el «farewell shot» del nivel); deben
  conmover.
- Verificar que la **misma voz** suena consistente en las 29 (edge-tts no es
  byte-determinista; si se regeneró por lotes, confirmar que no cambió el timbre).

---

## Resumen de acción

| Estado | Archivos |
|---|---|
| **Técnicamente sólido, OK para integrar como placeholder** | Los 42. |
| **Re-escuchar con prioridad (TTS con carga emocional)** | `voice-slot5-*` (6), `voice-slot6-farewell-*` (5), `voice-intro`, `voice-outro`. |
| **Re-escuchar (pieza estrella, debe ser bella)** | `sfx-bell-toll`. |
| **Pequeña verificación de mezcla** | `sfx-door-wood` (¿se oye el riel?). |
| **Candidatos a reemplazo por audio humano (si hay presupuesto)** | Las voces de la confesión/despedida; el resto puede quedar sintetizado. |

Ningún hallazgo es **bloqueante**: no faltan archivos, no hay formato erróneo, no
hay clipping, la campana dura ≥ 8s de cola y los 5 lechos hacen loop. Los
pendientes son todos de **calidad subjetiva pendiente de oído**, no de corrección
técnica.
