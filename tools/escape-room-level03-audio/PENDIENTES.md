# Pendientes — Audio Nivel 3 «El mercado nocturno (달빛시장)»

Hermano de `tools/escape-room-level02-audio/PENDIENTES.md`. El set de audio del
nivel 3 (48 OGG: 32 voces + 8 SFX de mercado + 4 ambientes + 4 SFX genéricos de
UI reusados) está generado, en formato estándar (44100 Hz mono OGG/Vorbis),
cableado en el seed y verificado por test de existencia en disco.

## ⚠️ CAVEAT PRINCIPAL — placeholder no escuchado

**Todo el audio es síntesis procedural (ambient/SFX, numpy/scipy) + TTS
(edge-tts) — limpio por métrica pero NO escuchado.** Como en L2, no se puede
juzgar de oído desde aquí. Candidatos top a re-escucha / reemplazo por un humano:

- **El beat del giro** (`voice-beat-slot4.ogg`, 이모, ~14s): el momento emocional
  del nivel; la entonación TTS importa más aquí que en cualquier línea.
- **Las 5 despedidas de 도윤** (`voice-slot6-farewell-*`): el clímax. Confirmar que
  la voz masculina joven (InJoon + pitch) suena tímida-cálida, no robótica.
- **El rechazo suave** (`voice-slot6-softreject.ogg`, 이모) y la reacción de 하나
  (`voice-slot2-correct.ogg`): emoción/comedia que el TTS aplana fácil.
- **Los 8 SFX procedurales**: `sfx-griddle-sizzle` (el asset del nivel) y
  `sfx-bus-air` son los más importantes; verificar que la plancha suena a
  chisporroteo y no a ruido blanco, y que el bus suena a aire comprimido.
- **Los 4 ambientes**: seamless por construcción (señal periódica; ver
  `gen_ambient.py`), pero el timbre (¿el mercado suena vivo?) no está validado.

## Líneas TTS generadas pero NO cableadas a un evento de flujo

El motor genérico (de L1/L2) reproduce: intro/outro voice, ambient por sala,
reacción por slot, el beat, la voz del candidato sorteado del Slot 1 (al abrir) y
del Slot 6 (al acertar) + su softReject, y los SFX de hotspot. Quedan generadas y
listas pero SIN disparador en el flujo actual (igual que algunas de L2):
`voice-thesis`, `voice-slot2-frame`, `voice-slot3-haggle-1..5`,
`voice-slot5-list-1..5`, `voice-slot6-trigger`, `voice-outro-hotteok`. Si en un
pase futuro se generaliza `EscapeRoom.vue` para hablar la línea del candidato
sorteado en TODOS los slots (no solo el 1), se cablean sin regenerar nada.

## Notas

- **Las 3 voces** se diferencian por voz+rate+pitch de edge-tts (이모/하나 sobre
  `ko-KR-SunHiNeural` con pitch opuesto; 도윤 sobre `ko-KR-InJoonNeural`). Una voz
  femenina distinta para 하나 mejoraría el contraste si edge-tts añade otra KO.
- Determinismo: ambient/SFX sembrados (md5 estable); TTS es red, no determinista.
- `out/` y `__pycache__/` ignorados. `common.py` es el toolkit DSP portado de L2.
- **Incidente de generación (resuelto):** un `AUDIO_DIR` mal editado mandó los
  primeros 44 OGG a `level-02/audio`; se recuperó L2 con `git checkout` + `git
  clean` (L2 quedó prístino) y se redirigió a `level-03`. Lección: verificar
  `AUDIO_DIR` antes de generar.
