# Pendientes — Arte Nivel 3 «El mercado nocturno (달빛시장)»

Backlog de pulido del arte, hermano de `tools/escape-room-level01/PENDIENTES.md`
y `…level02/PENDIENTES.md`. Los 21 assets están generados, en paleta, con tamaños/
alpha correctos y revisados ronda a ronda por cada agente (≥3) + una revisión a ojo
del owner-agent sobre las 4 zonas base y el `cinematic-outro`. Lo de abajo es pulido,
no bloqueante: el nivel ya está jugable con estos PNGs (deja de usar el gradiente).

## Observado en la revisión a ojo (3× previews)

- **room-02-meokja · muro de neón demasiado prominente (roza L3-a).** El
  `neon_alley` del fondo llena el tercio superior brillante y a 3× los trazos
  leen como «111 / 444 / 44» (numerales repetidos). Verificar a **1× real** si ya
  es suficientemente abstracto; si no, recesar/atenuar el muro (bajar `lit_cols`,
  empujarlo detrás con un velo oscuro como hace `gen_room-01-hotteok.py`) y variar
  los trazos de `neon_sign` para que no lean como dígitos. Es la escena más
  cargada del nivel → la que más nota.
- **cinematic-outro · marco naranja en la ventanilla de 도윤.** Hay un recuadro
  ámbar alrededor de la ventana del bus donde está 도윤 rapado. Decidir si es un
  «foco» intencional (el calor de la plancha siguiéndolo) o un sobrante a quitar.
  Honra L3-b (nada oculto) en lo demás: sin segunda sombra, despedida a plena luz.
- **Composición del outro** un pelín apretada (puesto + 이모/하나 en el tercio
  izquierdo, bus en los dos tercios derechos). Funciona, pero hay margen para
  separar a las dos figuras del bus y darles más andén.

## Revisión pendiente (no hecha a ojo por el owner-agent)

- **Pase a 1× real de las 9 escenas** (4 zonas + 3 variantes + 2 cinemáticas) con
  ojo de QA: confirmar L3-a (cero coreano/numeral legible) a tamaño de juego, no
  solo en el preview 3×.
- **Variantes** (`room-01-hotteok-closing`, `room-03-manmulsang-wrapped`,
  `room-04-busstop-bus`), `cinematic-intro`, y los close-ups/cosméticos: generados
  e iterados por sus agentes, pero no revisados a ojo por el owner-agent. Mirar y
  criticar contra la biblia.
- **Anclas cruzadas a 8×**: confirmar que 이모/도윤/하나 son las MISMAS personas en
  sus zonas y en el outro (como el `monk` del L2 a 8×).

## Notas de implementación (de los reports de generación)

- `market_stall` hornea su propio mostrador de ancho completo al fondo de su bbox;
  para una bahía bajo-mostrador abierta hay que sobrepintar esa región (hecho en
  room-01 vía relleno de la bahía izquierda). Composición, no bug.
- Determinismo confirmado por los agentes (md5 estable por asset); `out/` y
  `__pycache__/` ignorados por `.gitignore`.
- `common.py` quedó FROZEN: ningún `gen_*.py` lo modificó.
