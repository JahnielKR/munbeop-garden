# 📜 NIVEL 2 — DOSSIER COMPLETO: «El templo de la lluvia (청우사)»

> Dossier del Nivel 2 del escape room coreano. Documento maestro de diseño: historia, puzzles, arte, audio y producción.
> Creado 2026-06-13. Hermano de la Sección 12 de [escape-room.md](./escape-room.md) (Nivel 1). El remapeo de gramáticas de los niveles 2-4 se decide aquí (§5.2).

## §1 · Resumen

| Campo | Valor |
|---|---|
| Título | **El templo de la lluvia (청우사)** |
| Nivel TOPIK | 2 (principiante alto) |
| Tono | Melancolía luminosa; duelo sereno bajo la lluvia constante (NO terror, NO melodrama) |
| Referencia tonal | *El jardín de las palabras* (Shinkai) cruzado con un episodio quieto de *Mushishi* |
| Gramáticas-tema | G013, G016, G034, G035, G036, G050 (ver remapeo del roadmap en §5) |
| Cuartos | 4 |
| Slots de puzzle | 6 |
| Puzzles escritos | 30 (6 × 5) |
| Imágenes pixel art | ~20-22 (presupuesto disciplinado; el nivel 1 shipped 27 → objetivo ≤22) |
| Duración por run | 12-15 min |
| Cosméticos | 4 (1 por tier) — set «청우사의 빗소리» |

---

## §2 · Historia

### Premisa

Eres un viajero anónimo (sin continuidad con el nivel 1 — el jugador nuevo no necesita nada, el veterano no espera nada). Subiste la montaña con un paraguas transparente de tienda de conveniencia que el viento rompió en el sendero: llegas a 청우사 (聽雨寺, «el templo que escucha la lluvia») empapado, con el esqueleto del paraguas todavía en la mano. Es primavera temprana; el ciruelo (매화) del patio floreció tarde.

Te recibe 우담 스님, un monje de unos 28 años, sereno, de sonrisa fácil y manos siempre ocupadas — té, toalla, cuerda. Hoy se cumplen cuarenta y nueve días de la muerte de su maestro, el anciano al que todos llamaban 큰스님, y esta tarde es el **49재**: el rito budista coreano del día 49, cuando el alma parte definitivamente. 우담 lo prepara completamente solo. La campana del templo (범종) no ha sonado desde la muerte del maestro.

### Conflicto

La cerradura del escape room es **real y mundana**: con el aguacero, el arroyo cubre el paso de piedras y el único sendero de bajada queda inundado. Hasta que pare la lluvia, nadie baja. La leyenda del pueblo solo lo poetiza: *la campana de 청우사 solo deja salir a quien entiende lo que perdió*.

Pero la leyenda no habla de ti. El nivel invierte la fórmula del género: el jugador no resuelve puzzles para abrir SU puerta — los resuelve para que 우담 pueda decir el adiós que no pudo decir. Cada slot es un acto de escucha: entender los recuerdos del monje, completar la hoja de rito que el maestro dejó escrita, leer el diario que 우담 no pudo abrir solo, y al final construir, ficha a ficha, la despedida que él no consigue pronunciar. Cuando la campana suene, parará la lluvia. Eso dice la leyenda. El sendero, en todo caso, se drenará.

### Las dos capas (deniabilidad)

Todo el nivel se narra en dos capas. La capa 1 es suficiente para explicar el 100% de los hechos; la capa 2 jamás se confirma — vive en `-는 것 같다`, en la percepción del jugador, o en silencio.

| Señal extraña (capa 2) | Explicación mundana adyacente (capa 1) |
|---|---|
| Llueve «demasiado»: cuarenta y nueve días seguidos | Primavera de montaña; el monje lo comenta como quien comenta el clima |
| La segunda taza ya estaba servida y caliente al llegar | 우담 prepara dos tazas cada día desde la muerte (lo confiesa en el cuarto 3) |
| La linterna 49 de 49 está apagada | Se enciende al cierre del rito; 우담 la reserva |
| El 목탁 a veces suena solo | La madera vieja se contrae con la humedad |
| El gato mira fijo cojines vacíos | Es un gato |
| Un tañido final que nadie tocó; una segunda sombra en la escalinata | El 여음 largo del bronce; la luz rota entre nubes |

Regla dura: ninguna señal aparece sin su explicación mundana a un beat de distancia. Sin VFX que confirme, sin música que subraye, sin narrador omnisciente.

### El giro

En la celda del maestro (cuarto 3), 우담 confiesa que no ha podido abrir el diario solo — «혼자서는 못 열었어요» — y te pide que leas tú. La página que lees (pool de 5, cada una autónoma, ≤4 frases KO) revela el **origen**: hace veinte años, un día de lluvia, llegó al templo un niño huérfano de unos ocho años. No lloraba. El maestro inventó para él la «leyenda» de la campana — para que pudiera llorar. «그래서 종 이야기를 만들었어요.» El niño la creyó, la contó, y el pueblo la adoptó: **la leyenda tiene veinte años y un autor.** 우담 reconoce la letra. Silencio.

Entonces — ya capaz — el monje pasa él mismo a la última entrada del diario (fija en todos los runs, en el coreano llano y cálido del maestro), escrita la víspera de su muerte:

> 사십구일째 되는 날, 비가 오면 손님이 올 거예요. 그 손님하고 차를 마시고… 종을 치세요. 우담아, 혼자 울지 마세요.

Y la firma: **淸雨**. El nombre de dharma del maestro era 청우 — «lluvia clara». Suena exactamente como el templo, con otro hanja. La homofonía se constata y JAMÁS se explica: ¿coincidencia de montaña, o el pueblo acabó llamando al templo como a su monje? Las dos lecturas sobreviven. El monje mira la firma mucho rato y dice solo: «…스승님이 보내신 것 같아요.»

La coartada lingüística del nivel también nace aquí: el maestro escribió el rito y el diario «en coreano fácil, para que cualquier viajero pudiera leerlo». Se dice explícitamente — y alimenta el giro: él siempre supo que vendría un huésped.

### Cierre

En el pabellón de la campana (cuarto 4), la leyenda está pintada a mano en la viga — misma letra-pincel que el diario, firma pequeña 淸雨; el monje lo confirma en voz: «이 글씨… 스승님 글씨예요». Antes del tañido hay que decirle la despedida al que parte. 우담 no puede. El jugador la construye con fichas — y la trampa temática del nivel es que las fichas distractoras decisivas están en **presente**: elegir presente la primera vez produce un rechazo suave sin coste de corazón (la campana calla; 우담: «끝난 일은… 끝난 말로 해야 해요» — lo terminado se dice con palabras terminadas). Al acertar, el monje repite tu frase palabra a palabra con la voz entera, pone tus manos junto a las suyas en la cuerda del 당목 — «같이요.»

Tres tañidos. La lluvia muere por fases. El intercambio en el 일주문 — tu paraguas roto por el paraguas de papel del maestro —, tu firma en el 방명록, y la bajada. El plano final congelado guarda el regalo del roguelike (ver §3): nadie lo señala, y descubrirlo en la segunda run es de quien vuelve.

### Tema

**«Entender lo que perdiste no es dejar de quererlo: es aprender a decirlo en pasado.»** En coreano, la gratitud de despedida ya se conjuga en pasado — 그동안 감사했어요 —: la gramática G013 es literalmente la llave del nivel. No hay metáfora que construir; el idioma ya la traía puesta.

### Por qué funciona como Nivel 2

- **Contraste deliberado con el nivel 1, eje por eje:** mañana cálida → tarde de lluvia; recibir notas (texto estático de alguien ausente) → escuchar a una persona (diálogo vivo con alguien presente); escapar de una casa → **liberar a alguien**. La puerta nunca estuvo cerrada para ti — solo inundada. El prisionero del nivel no eres tú: es 우담.
- **El salto gramatical es el salto dramático.** Pasar de TOPIK 1 a 2 es, ante todo, aprender el pasado (G013). El nivel convierte oír la morfología de tiempo en la habilidad central: el error que el nivel enseña a no cometer es no escuchar si la frase ya terminó.
- **Escala sin cambiar el motor:** 6 slots contra 5, mismos tres tipos de puzzle (selección, completar, creación), un cuarto con dos slots (como la cocina del nivel 1) y una sola extensión pequeña de `rules.ts` (rechazo suave del Slot 6).
- **El registro emocional madura con el jugador.** El nivel 1 era un abrazo; el 2 es un duelo sereno — pero la halmeoni y el monje comparten ADN: un NPC que te cuida mientras tú lo ayudas, y un final que te invita a volver («비는 또 와요. 그때 또 오세요»).
- **Rejugabilidad con alma:** la randomización es diegética (la humedad borra una palabra distinta cada run) y la segunda run regala la segunda sombra. El roguelike deja de ser un castigo y se vuelve una visita.

---

## §3 · Textos narrativos completos

> Listos para el seed (`munbeop/app/seed/escape-room/level-02.ts`). Párrafos separados con `\n\n`, render con typewriter. El coreano citado es canónico: no se retoca sin pasar por este dossier.

### Tagline (hook de libreta)

> ⚙️ Valor BLOQUEADO en `registry.ts` → `LEVEL_REGISTRY['level-02'].tagline` (líneas 55-57). Render en la libreta. **No se edita sin justificar el cambio del valor bloqueado.** Honra la escena canónica (té + sonrisa + campana) y NO filtra señales de capa 2 (regla editorial 1: la segunda taza es señal liminal, no gancho de portada).

> Subiste al templo a esperar que pasara el aguacero. El monje te sirvió té, sonrió, y dijo que la campana solo deja salir a quien entiende lo que perdió.

### Intro (5 párrafos, typewriter)

> El paraguas te lo vendieron esta mañana en una tienda de conveniencia: plástico transparente, tres mil wones. El viento de la montaña lo dobló en el tercer recodo del sendero y lo remató en el cuarto. Llegas al final de la escalinata empapado, con el esqueleto del paraguas todavía en la mano, sin saber muy bien por qué lo sigues cargando. Sobre tu cabeza, en el dintel de la puerta, una placa de madera: 청우사. El templo que escucha la lluvia.
>
> Al otro lado del 일주문, el patio es una sola cortina de agua. Un ciruelo florecido tarde suelta pétalos blancos al barro. De entre los edificios sale un monje joven con una toalla seca en las manos — como si te esperara, o como si siempre tuviera una toalla a mano. Sonríe: «어서 오세요. 비가 그칠 때까지 차 한잔 해요.»
>
> En la sala de té hay un brasero encendido y un gato pardo dormido contra el calor. Sobre la mesa baja ya hay una taza servida. Todavía humea. El monje la mira un momento de más y no dice nada; te sirve otra, con las dos manos. «차는 따뜻할 때 마셔요», dice, como quien comparte una regla importante.
>
> Cuando preguntas cuándo podrás bajar, se ríe bajito. En el pueblo cuentan, dice, que la campana de 청우사 solo deja salir a quien entiende lo que perdió. Luego, más serio, señala ladera abajo: con esta agua el arroyo cubre el paso de piedras, y el único sendero baja por ahí. Hasta que escampe, nadie sube y nadie baja. Lleva lloviendo, añade, cuarenta y nueve días.
>
> Por la puerta abierta del salón principal se ven linternas de papel encendidas contra la tarde oscura. Las cuentas casi sin querer: cuarenta y nueve. La última está apagada. Hoy, dice el monje, se cumplen cuarenta y nueve días desde que su maestro se marchó — esta tarde es el rito del día 49, y lo prepara él solo. Y caes en la cuenta de que, en todo este tiempo, la campana no ha sonado ni una vez.

### Outro (cinemática de salida — 6 beats, en este orden)

> ⚙️ El beat 1 **cita textualmente** la frase de despedida que el jugador construyó con fichas en el Slot 6: el motor interpola el candidato del run en el marcador `{farewell}`. El `outro` del nivel 1 era un string estático — esto requiere soporte de plantilla (nota para §12). El token se escribe `{farewell}` (llave simple) en TODAS las apariciones (§3, §7, §12.3).

> El primer tañido atraviesa la lluvia, y la cortina de agua titubea, como si dudara. El segundo la vuelve hilos. Al tercero solo quedan gotas sueltas — y después nada: el 여음 largo del bronce apagándose sobre el valle, y el goteo de los aleros. En el aire sigue la frase que armaste, palabra por palabra: «{farewell}». 우담 la repitió contigo, con la voz entera, las manos junto a las tuyas en la cuerda.
>
> La luz se rompe entre las nubes y las piedras del patio empiezan a soltar vapor. En el 대웅전, 우담 enciende la linterna cuarenta y nueve. Las cuarenta y nueve, encendidas. No dice nada. Junto a la puerta de la celda del maestro, los 고무신 blancos siguen en su sitio, intactos. Esos, todavía no.
>
> El 방명록 sigue abierto donde lo viste al llegar: la última firma es de hace cuarenta y nueve días. 우담 te ofrece el pincel con las dos manos. Tu nombre, torcido y húmedo, es la primera entrada del después.
>
> En el 일주문 te detiene con un gesto. Toma tu paraguas roto con las dos manos, con el cuidado que se le da a algo valioso — «이건 두고 가세요» — y descuelga del perchero el paraguas de papel aceitado. «스승님 거였어요. 비는 또 와요. 그때 또 오세요.» Después junta las palmas y se inclina: «비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.» Y entiendes, sin que nadie lo diga, que ese gracias en pasado no era solo para ti. El gato baja contigo hasta el primer escalón y ahí se sienta, como en una frontera.
>
> Bajas la escalinata mojada con el paraguas del maestro abierto. A mitad de camino te das la vuelta. Arriba, enmarcado por las columnas del 일주문, 우담 sigue con las palmas juntas y la cabeza inclinada, pequeño contra el cielo roto. Los escalones encendidos de oro devuelven el templo como un espejo. Te quedas mirando un momento más de lo necesario. *(→ aquí congela el plano final / `farewellImage`.)*
>
> Ya entre los árboles, cuando el templo no se ve, suena un tañido más. Uno solo, lejano. Acabas de ver sus dos manos juntas en el aire.

### farewellImage — spec del plano final (congelado)

- **Encuadre:** contrapicado desde el pie de la escalinata, mirando arriba **a través** del marco del 일주문 — columnas y dintel con 단청 como proscenio.
- **Centro, pequeño:** 우담 con las palmas juntas (합장), cabeza inclinada. El gato pardo a sus pies, mirando un punto vacío a su derecha.
- **Cielo:** tormenta rota, rayos rosa-dorados, vapor subiendo de la piedra.
- **Escalones mojados = espejo encendido.** Sobre ese oro bajan hacia cámara **DOS sombras largas** desde donde solo hay un hombre: una de cabeza rapada… y otra más alta con el ala inconfundible de un 삿갓. **Spec de arte:** la segunda sombra, un tono más oscura que la del monje, **sin outline**. **Regla absoluta:** sin hotspot, sin mención en texto, sin glow — descubrirla en la segunda run es el regalo del roguelike.
- **Detalles:** pétalos de 매화 sobre la piedra; a la izquierda, la silueta del 종루 con la campana vibrando un último pixel de brillo; abajo, en primer plano, el borde del paraguas de papel en tu mano.

### Voice lines (KO canónico)

| Campo | Línea |
|---|---|
| `voiceIntro` | 어서 오세요. 비가 그칠 때까지 차 한잔 해요. |
| `voiceOutro` | 비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요. |
| Línea-tesis doméstica (cuarto 1, al servir el té; **no** se repite al final) | 차는 따뜻할 때 마셔요. |

### Beat fijo post-Slot-5 (la segunda taza)

> Honorífico correcto sobre el maestro (regla editorial 4): 떠나다 → 떠나시다 → **떠나신** 후에. Coincide con la otra línea fija ya grabada en honorífico («보내신 것 같아요»).

> 스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요.

### Tarjeta final + última narración

- **Tarjeta final (sobre el fade):** «종소리가 너보다 먼저 산을 내려갔어요.» — *El sonido de la campana bajó la montaña antes que tú.*
- **Última narración (ya en negro):** «En el templo dicen que cuando llueve, es alguien que vuelve de visita. La próxima vez que llueva — ya sabes a quién saludar.»
- ⚙️ Si el motor no tiene campo dedicado para tarjeta/narración final, viven como los dos últimos párrafos del `outro` (nota para §12).

---

## §4 · Reglas editoriales del nivel (checklist auditable)

Quien escriba CUALQUIER texto nuevo del nivel — puzzles, flavor, pistas, tooltips — audita contra estas 8 reglas antes de integrar. Los críticos revisarán contra esta lista, punto por punto.

1. **☑ Deniabilidad.** Nada sobrenatural se afirma. Toda señal extraña va en `-는 것 같다`, percepción del jugador, o silencio — y tiene su explicación mundana plantada a ≤1 beat de distancia (tabla de §2). Prohibido: VFX confirmatorio, música que subraye, narrador omnisciente. La profecía del maestro queda como tinta sobre papel + un «같아요» del monje. *Audit: lista cada señal de capa 2 del texto nuevo y señala dónde está su coartada mundana.*
2. **☑ Anti-melodrama.** El backstory vive en la prosa seca del diario. 우담 nunca narra con la voz quebrada. Las lágrimas no se describen — se describen manos, pausas, tazas. *Audit: si un texto nombra llanto, lágrimas o «corazón roto» de 우담, falla.*
3. **☑ Sin metalenguaje.** Ningún personaje dice «pasado», «verbo», «partícula» ni «과거형». La corrección canónica del presente es «끝난 일은… 끝난 말로 해야 해요». Términos gramaticales SOLO en Pista 2. *Audit: grep de términos gramaticales en diálogos, narración y Pista 1.*
4. **☑ Honoríficos.** Las líneas FIJAS de 우담 sobre su maestro usan honorífico correcto (돌아가셨어요, 드셨어요, 보내신 것 같아요, 떠나신 후에) — flavor no testeado, glosado si hace falta. El texto JUGABLE va en pasado llano TOPIK-2, amparado por la coartada canónica: el maestro escribió el rito y el diario «en coreano fácil, para que cualquier viajero pudiera leerlo» (se dice explícitamente en el cuarto 3). *Audit: ninguna forma honorífica dentro de respuestas, tiles o huecos testeados.*
5. **☑ Randomización diegética.** La lluvia/humedad es la sorteadora canónica (borra una palabra distinta cada run — «비가 또 한 글자를 지웠어요…»). Los pools son plurales por naturaleza: 5 recuerdos, 5 pasos, 5 señales, 5 páginas, 5 confesiones, 5 despedidas. Ningún beat aguas abajo depende del candidato sorteado. *Audit: toma cada beat fijo y verifica que funciona con los 5 candidatos de cada slot anterior.*
6. **☑ Carga lectora.** Páginas del diario ≤4 frases KO; intro ≤5 párrafos; diálogo fijo por cuarto ≤4 líneas. El giro debe sobrevivir a un lector TOPIK-2 lento. *Audit: contar. Sin excepciones «porque quedaba bonito».*
7. **☑ Liturgia.** Nada de números de tañidos en contenido testeado. El dato 새벽/저녁 (28/33) solo puede vivir como curiosidad de Pista 1 o easter egg del 방명록, CON MARCA «verificar antes de producción». *Audit: buscar cifras litúrgicas en respuestas correctas — si decide un puzzle, falla.*
8. **☑ El distractor temático.** El distractor recurrente del nivel es la MISMA frase en presente: no oír el tiempo verbal es EL error que el nivel enseña a no cometer. En el Slot 6, la primera ficha en presente produce rechazo suave sin coste de corazón (extensión de `rules.ts`, ver §12); reincidir = error normal. *Audit: cada slot con foco G013 incluye al menos un distractor en presente.*

---

---

## §5 · Gramáticas del nivel y remapeo del roadmap

### §5.1 Gramáticas del nivel

La llave del nivel es G013: en coreano, la gratitud de despedida ya se conjuga en pasado (그동안 감사했어요). Todo lo demás orbita alrededor de eso.

| Código | Gramática | Cómo aparece |
|---|---|---|
| G013 | -았/었어요 — pasado educado | **CORAZÓN del nivel.** Slot 1 (los recuerdos del monje), Slot 4 (las páginas del diario), Slot 5 (la confesión), Slot 6 (la despedida). Toda memoria del maestro vive en pasado; la despedida final solo abre la campana si está conjugada en pasado. |
| G016 | 안 vs 못 — negación de elección vs incapacidad | Slot 5 (foco). La distinción gramatical ES el contenido emocional: 못 = el duelo impidió; 안 = el amor eligió. Reaparece sin testear en los 고무신 del final (esos todavía no — 안, no 못). |
| G034 | -(으)ㄹ 때 — «cuando» | Slot 1 + Slot 6 (refuerzo). Plantada en la línea-tesis del cuarto 1: «차는 따뜻할 때 마셔요». |
| G035 | -기 전에 — «antes de» | Slot 2 (foco, en sistema con G036). El orden ritual del 49재 — qué va antes, qué va después — es su hogar narrativo. |
| G036 | -(으)ㄴ 후에 — «después de» | Slot 2 (mismo sistema que G035). Eco no testeado en el beat post-Slot-5: «스승님이 떠나신 후에도…». |
| G050 | -(으)ㄴ 것 같아요 — conjetura sobre el pasado | Slot 3, **restringido a -(으)ㄴ 것 같아요** (conjetura sobre hechos pasados). Es además la gramática de la deniabilidad: la regla editorial 1 obliga a que todo lo inexplicable se diga con 같아요 — incluida la línea del giro («…스승님이 보내신 것 같아요»). |

Las definiciones canónicas de cada código viven en el seed de gramáticas de la plataforma; este nivel las referencia por id igual que el nivel 1 (`grammarCodes` del `Level`).

### §5.2 Desviación consciente del roadmap (decisión cerrada)

La tabla de la sección 11 del doc maestro (`docs/escape-room.md`) asignaba al nivel 2 «Pasado G013, -지만 G021, conjunción G019, modales», y reservaba -기 전에/후에 para el nivel 4. **Este dossier se desvía a propósito:**

- **G035/G036 entran en el nivel 2.** El orden ritual del 49재 (qué se hace antes del rito, qué después) es el hogar narrativo perfecto de -기 전에 / -(으)ㄴ 후에: el jugador las aprende ordenando una liturgia real, no una lista de quehaceres. No tenía sentido guardarlas dos niveles más.
- **G021 (-지만) y G019 (-고) pasan al nivel 3** («El mercado nocturno»), donde el regateo las pide a gritos («싸지만 좋아요», «이것도 사고 저것도 사요»).
- **El nivel 4** («El último tren a Seúl») **conserva -면서 y -자마자, y gana -는 동안 y -고 나서** para compensar la salida de -기 전에/후에.
- **G016 (안 vs 못) entra en el nivel 2** como foco del Slot 5: es el único lugar de toda la franquicia donde esa distinción tiene peso dramático real, y desplaza a los «modales» genéricos de la tabla original.

**Instrucción de edición (doc maestro, tabla de §11):** al integrar este dossier, editar las filas 2, 3 y 4 de la tabla «Post-MVP — niveles propuestos» de `docs/escape-room.md` para que queden así:

| # | Tema | TOPIK | Gramáticas objetivo | Tono |
|---|---|---|---|---|
| 2 | **El templo de la lluvia** | 2 | G013, G016, G034, G035, G036, G050 | Místico, contemplativo ✅ DISEÑADO |
| 3 | **El mercado nocturno** | 2-3 | -아/어 보다, -아/어 주다, comparativos, **G021 (-지만), G019 (-고)** | Energético, callejero |
| 4 | **El último tren a Seúl** | 3 | -면서, -자마자, **-는 동안, -고 나서** | Urgente, contemporáneo |

(La fila 4 también renombra el nivel de «La estación de Seúl» a «El último tren a Seúl», nombre canónico de esta biblia.) Añadir bajo la tabla una nota de una línea: *«El remapeo de gramáticas de los niveles 2-4 se decidió en el dossier del nivel 2 (§5.2 de `docs/escape-room-level-02.md`).»*

---

## §6 · Cuartos / Escenas

Cuatro cuartos, seis slots. El orden de cuartos es lineal (1→2→3→4) y dentro de los cuartos 2 y 3 el orden de slots es fijo. Los cuartos ya visitados se pueden revisitar. Resolución base: 320×240, paleta de lluvia (gris-azul frío fuera, ámbar de brasa y linterna dentro). **Regla de arte transversal:** ningún texto coreano legible en la escena 320×240 — todo lo que se lee vive en close-ups de 128×128 (Neodgm ≥ 16px) o en la UI.

#### Cuarto 1 · 다실 (sala de té)

**Layout visual (320×240):** Interior íntimo de madera oscura. Tercio izquierdo: ventana de celosía 창호 con papel hanji translúcido, detrás la cortina de lluvia en diagonales gris-azules (2-3 tonos, animable como overlay de 2 frames). Centro: mesa baja de té con DOS tazas — una frente al cojín del jugador (primer plano inferior), otra frente a un segundo cojín a la derecha del monje; de la segunda sube un hilo de vapor de 1px. 우담 sentado al centro-derecha, manos ocupadas con la tetera. Derecha: brasero 화로 con brasas naranjas (la única fuente de luz cálida de la escena) y el gato pardo enroscado al lado. Fondo derecho, junto a la entrada: atril bajo con el 방명록 abierto (la última firma, de hace 49 días, visible) — el mismo libro que el outro recupera «abierto donde lo viste al llegar». Estante al fondo con cuencos apilados. Luz: penumbra; contraste frío (ventana) / cálido (brasero). Paleta: marrones madera, gris-azul lluvia, naranja brasa, verde apagado del té.

**Interactivos:**
- 🟡 우담 (figura del monje, rect ≈ [120, 95, 55, 75]) → **SLOT 1** (selección · G013+G034). *(El rect del trigger se ciñe a la figura del monje, NO a toda la mesa, para que la segunda taza cosmética quede accesible sin disparar el slot — ver nota de hotspots abajo.)*
- ⚪ El gato (≈ [240, 150, 40, 30]) — al click se despierta y gira la cabeza hacia el cojín vacío (sprite 2 frames). Texto: `고양이가 빈 방석을 봐요.` Sin más comentario.
- ⚪ Segunda taza (≈ [205, 165, 28, 24] — borde inferior-derecho de la mesa en primer plano, junto al cojín del jugador, **fuera del rect del Slot 1**) — close-up `obj-second-cup.png`. Texto: `아직 따뜻해요.` (Plantado para el beat post-Slot-5; aquí no se explica nada.)
- ⚪ 방명록 (≈ [275, 120, 30, 40]) — close-up `obj-guestbook.png`. Texto: `마지막 이름은 49일 전이에요.` (Plantado para el beat 3 del final.)
- ⚪ Ventana (≈ [10, 60, 60, 90]) — el sonido de la lluvia sube un instante al click.

> **Nota de hotspots (Cuarto 1):** el rect del Slot 1 se limita deliberadamente a la figura del monje `[120, 95, 55, 75]` y NO a la mesa entera; la segunda taza cosmética `[205, 165, 28, 24]` queda enteramente fuera de ese rectángulo. El motor del nivel 1 no define prioridad entre hotspots solapados, así que ningún cosmético del cuarto puede caer dentro de un rect con `triggersSlot`. Verificar al integrar que ningún otro hotspot del Cuarto 1 solapa el rect del Slot 1.

**Beat narrativo:** 우담 te seca con una toalla, sirve el té y dice la línea-tesis: «차는 따뜻할 때 마셔요.» Mientras esperas que pare la lluvia, recuerda al maestro en voz alta (honorífico en sus líneas fijas) — entenderle es hacerle compañía. Al acertar el Slot 1: «아… 알아들었어요?» — la primera sonrisa real.

#### Cuarto 2 · 대웅전 (salón principal)

**Layout visual (320×240) — estado A «altar incompleto»:** Salón ritual visto de frente. Fondo centro: altar con un Buda dorado pequeño; delante, el 영정 (retrato del maestro) y la 위패, pero el resto a medias — velas apagadas, fruta sin colocar a un lado, crisantemos blancos aún envueltos, incienso sin encender. Pared derecha: cuadrícula de 49 linternas colgantes (tile repetido 7×7; 48 con halo cálido, la de la esquina superior derecha APAGADA — gris, sin halo). Izquierda: mesa baja con la hoja de instrucciones sujeta con una piedra; al lado, el 목탁 sobre su cojín. Columnas rojas con 단청 enmarcando la escena. Puertas abiertas al fondo dejan ver la lluvia. Luz: gris de tormenta + halos de linterna; el altar en penumbra.

**Estado B «altar completo» (variante de escena, swap EN PANTALLA al resolver el Slot 2):** mismas coordenadas; velas encendidas, fruta en pirámide, crisantemos en sus jarrones, humo de incienso de 1px subiendo recto. El altar pasa a ser el punto más cálido de la escena. **La linterna 49 sigue apagada en ambos estados.** Su ENCENDIDO **se narra, no se renderiza**: ocurre solo en el texto del outro (§3 beat 2), nunca como variante de escena ni asset propio — recorte canónico de presupuesto. Arte NO debe esperar una imagen de «linterna 49 encendida».

**Interactivos:**
- 🟡 Hoja de instrucciones (izquierda, rect ≈ [30, 130, 50, 40]) → **SLOT 2** (completar · G035/G036). Frame del monje antes del puzzle: «비가 또 한 글자를 지웠어요…»
- 🟡 Linterna 49 apagada (≈ [285, 35, 22, 28]; se activa tras resolver el Slot 2) → **SLOT 3** (completar · G050 restringido). Es el disparador FIJO del Slot 3 en el 대웅전. Nombrar las señales extrañas sin afirmarlas; 우담 responde siempre con explicación mundana + una sonrisa que no cierra (texto, sin voz). *(Decisión de pool — ver §8.3: el pool del Slot 3 se ancla a las señales del 대웅전 [linterna apagada · huellas/orden ritual · tinta de la hoja], y el gato del 다실 / la taza fría quedan como flavor de cuarto 1, NO como candidatos del slot. Así el objeto desde el que se dispara el puzzle ES siempre la señal que el jugador lee, sin obligar a revisitar el 다실.)*
- ⚪ 목탁 (≈ [90, 150, 25, 25]) — al click suena un golpe seco. Texto: `스님의 목탁이에요.` *(Capa 2: muy raramente el golpe suena sin click — solo audio, sin animación ni texto; ver §12.2.)*
- ⚪ 영정 (≈ [150, 70, 30, 35]) — texto: `사진 속에서도 웃고 계세요.`

**Beat narrativo:** La hoja que el maestro dejó escrita para su PROPIO 49재 — en coreano fácil, «para que cualquier viajero pudiera leerla» (la coartada se dice aquí, y alimenta el giro). La humedad ha borrado una palabra distinta cada run. Restaurar el orden del rito completa el altar ante tus ojos; después, las señales que no cuadran se nombran en voz baja, con 같아요.

#### Cuarto 3 · 스승의 방 (celda del maestro, en el 요사채)

**Layout visual (320×240):** El cuarto más austero y más oscuro del nivel. Izquierda: puerta corrediza entreabierta; FUERA, en el escalón, los 고무신 blancos del maestro perfectamente alineados (legibles como dos formas claras sobre madera oscura). Centro: escritorio bajo 서안 con el diario cerrado (cinta de tela) y, colgada encima, una caligrafía interrumpida — el trazo muere a media columna («비가 오—», ilegible en escena, legible en close-up). Derecha: estante con pocos libros; uno con lomo estilizado destaca apenas (el cuento de la campana de Emille, sin texto legible). Cojín de meditación con la huella de uso. Ventana mínima al fondo con lluvia. Luz: gris azul, casi monocromo; la única calidez es la madera del diario.

**Interactivos:**
- 🟡 Diario sobre el 서안 (centro, rect ≈ [140, 130, 45, 35]) → **SLOT 4** (selección · G013) — EL GIRO. Antes de abrirse: «혼자서는 못 열었어요.» Al resolverse, beat fijo post-Slot-4 (ver §7).
- 🟡 Umbral / 고무신 (izquierda, rect ≈ [15, 150, 55, 45]; se activa tras el beat post-Slot-4) → **SLOT 5** (completar · G016+G013) — la confesión en el umbral. El fallo se marca como lectura incorrecta (UI neutra), NUNCA como réplica herida del monje.
- ⚪ Caligrafía interrumpida (≈ [150, 60, 35, 50]) — close-up `obj-calligraphy-rain.png`. Texto: `마지막 글씨예요. 끝나지 않았어요.`
- ⚪ Lomo del libro (≈ [255, 90, 12, 40]) — sin close-up; tooltip: `에밀레종 이야기`.

**Beat narrativo:** El cuarto donde vive el backstory en prosa seca. El jugador lee UNA página del diario (pool de 5, ≤4 frases KO cada una): el niño que no lloraba, el cuento inventado, «그래서 종 이야기를 만들었어요». Silencio. Luego el monje, ya capaz, pasa él mismo a la última entrada — la profecía y la firma 淸雨 (beat fijo, contenido NO-slot, ver §12.4). Después, la confesión: cinco frases con hueco donde 안 o 못 deciden qué clase de silencio fueron estos 49 días. Y el beat de la segunda taza, que no se resuelve («스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요.»).

#### Cuarto 4 · 종루 (pabellón de la campana)

**Layout visual (320×240) — estado A «lluvia»:** Pabellón abierto, sin paredes. Centro-derecha: el 범종 de bronce, gran masa oscura colgante con relieve de 비천상 apenas sugerido (2 tonos); a su izquierda, el 당목 (tronco-mazo horizontal) suspendido con cuerda al alcance de la mano. Viga superior cruzando el encuadre: sobre ella, la leyenda pintada a mano — a esta resolución, solo trazos de pincel sugeridos (ilegible a propósito; se lee en close-up). Más allá de los aleros, el valle gris bajo la cortina de agua; suelo de tablones mojados con reflejos mínimos en primer plano. Luz: gris plata; la campana absorbe la luz. Paleta: bronce oscuro, gris lluvia, madera empapada.

**Estado B «claros + vapor» (variante, swap durante la secuencia de salida):** misma composición; la cortina de agua sustituida por goteo de aleros, claros rosa-dorados rompiendo entre nubes al fondo, vapor de 1px subiendo de las piedras, los reflejos del suelo encendidos.

**Interactivos:**
- ⚪ Inscripción de la viga (arriba, rect ≈ [70, 25, 180, 30]) — close-up `obj-beam-inscription.png`: ≤2 líneas cortas + firma pequeña 淸雨, MISMA letra-pincel que el diario. Voz del monje al verla: «이 글씨… 스승님 글씨예요.» (Recomendada antes del slot; no bloquea.)
- 🟡 Cuerda del 당목 / 우담 junto a la campana (centro, rect ≈ [120, 100, 80, 80]) → **SLOT 6** (creación con fichas · G013+G034) — la despedida. **Trampa temática:** las fichas distractoras decisivas están en PRESENTE; la primera ficha en presente produce rechazo suave SIN corazón (ver §7 y §12.1).
- ⚪ Valle bajo la lluvia (fondo, ≈ [10, 70, 90, 60]) — texto: `산 아래가 안 보여요.`

> **Prop de salida (paraguas de papel):** el paraguas de papel aceitado del maestro que 우담 te entrega en el 일주문 (§3 beat 4) es un **prop exclusivo del outro**, renderizado solo en `cinematic-outro.png` / la animación del intercambio. NO se siembra como hotspot ni close-up en ningún cuarto: no es deuda Chekhov porque no se promete antes (a diferencia del paraguas roto del jugador, sembrado en la intro). Documentado aquí para que arte no busque dónde plantarlo en escena.

**Beat narrativo:** Antes del tañido hay que decirle la despedida al que parte. 우담 no puede. El jugador la construye con fichas; si la dice en presente, la campana calla — «끝난 일은… 끝난 말로 해야 해요.» Al acertar, el monje repite tu frase palabra a palabra con la voz entera, pone tus manos junto a las suyas en la cuerda — «같이요.» — y empieza el final.

---

## §7 · Mapa de puzzles

```
[CINEMÁTICA APERTURA — cinematic-intro.png]
  El 일주문 bajo el aguacero. El paraguas transparente, roto en la mano.
  Voz de 우담: «어서 오세요. 비가 그칠 때까지 차 한잔 해요.»
       ↓
CUARTO 1 — 다실
  Línea-tesis al servir el té: «차는 따뜻할 때 마셔요.» (no se repite al final)
  Hablar con 우담 → SLOT 1 (selección) — G013 + G034
    5 recuerdos del maestro en pool; entenderle es hacerle compañía.
  Acierto: «아… 알아들었어요?» — primera sonrisa real
       ↓
CUARTO 2 — 대웅전 (orden fijo: Slot 2 → Slot 3)
  Hoja de instrucciones → SLOT 2 (completar) — G035/G036
    «비가 또 한 글자를 지웠어요…» (la lluvia es la sorteadora: randomización diegética)
    Acierto → SWAP DE ESCENA: altar incompleto → altar completo (en pantalla)
  Linterna 49 apagada → SLOT 3 (completar, restringido a -(으)ㄴ 것 같아요) — G050
    Pool anclado a las señales del 대웅전 (sin obligar a revisitar el 다실; ver §6/§8.3).
    Nombrar las señales sin afirmarlas; réplica mundana + sonrisa que no cierra.
       ↓
CUARTO 3 — 스승의 방 (orden fijo: Slot 4 → beat → Slot 5 → beat)
  «혼자서는 못 열었어요.»
  Diario → SLOT 4 (selección) — G013 · EL GIRO
    1 página del pool de 5: el origen de la leyenda (el niño que no lloraba).
       ↓
  [BEAT FIJO post-Slot-4 — contenido NO-slot, idéntico en todos los runs]
    우담 pasa él mismo a la ÚLTIMA entrada del diario (해요체 cálido):
    la profecía del huésped, «우담아, 혼자 울지 마세요.» — y la firma: 淸雨.
    La mira mucho rato. «…스승님이 보내신 것 같아요.»
    (La homofonía 청우사/청우 se constata, JAMÁS se explica.)
       ↓
  Umbral (고무신) → SLOT 5 (completar) — G016 + G013 · la confesión
    5 frases con hueco; la cláusula de motivo decide 안 vs 못.
    Acierto: «맞아요. 안 한 게 아니에요. 못 했어요. …이제, 하고 싶어요.»
    Fallo = «lectura incorrecta» (UI neutra); NUNCA réplica herida del monje.
       ↓
  [BEAT FIJO post-Slot-5 — pagado al 100% de los runs]
    «스승님이 떠나신 후에도 매일 두 잔을 준비했어요.
     오늘은… 한 잔이 비어 있었어요.» (por qué HOY, sin resolver)
       ↓
CUARTO 4 — 종루
  ⚪ Inscripción de la viga (close-up; misma letra que el diario):
     «이 글씨… 스승님 글씨예요.»
  Cuerda del 당목 → SLOT 6 (creación con fichas) — G013 + G034
    ┌─ 1.ª ficha en PRESENTE → RECHAZO SUAVE, sin coste de corazón:
    │    la campana calla; «끝난 일은… 끝난 말로 해야 해요.»
    │    (reincidir en presente = error normal; ver §12.1)
    └─ Acierto: 우담 repite TU frase palabra a palabra, voz entera.
       Tus manos junto a las suyas en la cuerda. «같이요.»
       ↓
[CINEMÁTICA SALIDA — 6 beats obligatorios, ver §3]
  1. Tres tañidos; la lluvia muere por fases; el 여음 y el goteo.
     Cita TEXTUAL de la despedida que construiste ({farewell}, ver §12.3).
  2. La linterna 49, encendida (se narra, no se renderiza). Los 고무신, intactos (안, no 못).
  3. El 방명록: tu nombre, primera entrada del «después».
  4. El intercambio en el 일주문: tu paraguas roto ↔ el paraguas de papel
     del maestro. 합장. voiceOutro: «비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.»
  5. farewellImage (cinematic-outro.png): el plano congelado con las DOS sombras.
  6. UN tañido más, lejano. Tarjeta final: «종소리가 너보다 먼저 산을 내려갔어요.»
  Pantalla de recompensa: cosmético según tier alcanzado.
```

Reglas de runtime: `maxErrors: 2` · `epicTimeThresholdSeconds: 600` (run objetivo 12-15 min) · `legendaryCleanRunsRequired: 3` · regla especial del Slot 6 documentada en §12.1.

---

---

## §8 · 🧩 Pool de puzzles — Slots 1-3 (15 candidatos)

> **Notación:** igual que el pool del nivel 1 (§12.6 del doc maestro): coreano visible, traducción interna, opciones/respuesta y 2 pistas (Pista 1 gratis = vocabulario; Pista 2 premium = la regla). Los textos ES son V1; para producción multi-locale se rellena el resto del `LocalizedString` antes de integrar.
>
> **Tipos reales contra el motor (resuelto):** el motor solo conoce tres formas de slot (`escape-room.ts`): `selection` (4 `LocalizedString` + `correctIndex`), `completion` (input de texto libre, comparado verbatim tras `trim`) y `creation` (fichas arrastrables). **No existe «completar de opción múltiple».** Por eso:
> - **Slot 1** y **Slot 3** son `selection` (4 opciones clicables + índice correcto).
> - **Slot 2** es `completion` puro: el jugador **escribe** la conexión 전에/후에 en un input; la respuesta se compara verbatim (`answer: '올리기 전에'`). El cuarteto de formas NO es clicable — las morfologías cruzadas y la pareja invertida viven en la Pista 2 como contraste explicado, no como botones. Esto deja la secuencia de tipos del nivel en sel / compl / sel / sel / compl / creación, que alterna sin pedir extensión de motor.
>
> **Sin posición predecible (deuda evitada):** el motor NO baraja las opciones de `selection` — las renderiza en orden de array con etiqueta fija A/B/C/D y compara contra `correctIndex`. Para que el jugador no aprenda «siempre A», los cinco candidatos de cada slot `selection` (1 y 3) **varían `correctIndex`** entre sí (no todos en 0 como hizo el nivel 1). Nota de implementación, no de motor.
>
> **Sorteo diegético (regla editorial 5):** en cada run la lluvia sortea 1 candidato por slot. En el Slot 1 es el recuerdo que el té le trae a 우담; en el Slot 2, la palabra que la humedad borró de la hoja; en el Slot 3, la señal que el jugador nota primero. Ningún candidato planta estado: cualquier combinación 5×5×5 es válida y ningún beat aguas abajo lee qué candidato salió.
>
> **Distractores:** anotados como en el nivel 1 — *D1* negación/inversión, *D2* sustantivo/palabra plausible, *D3* lugar/marco plausible — más el distractor temático del nivel: ***DT*, la misma lectura en presente**. No oír el tiempo verbal es EL error que este nivel enseña a no cometer (regla editorial 8). En el Slot 2 (input verbatim) los distractores no son clicables: se nombran y se explican en la Pista 2.

| Slot | Cuarto | Tipo | Gramática | Lo que sortea la lluvia |
|---|---|---|---|---|
| 1 | 1 · 다실 | Selección (4 opciones) | G013 foco + G034 | El recuerdo que el té le trae a 우담 |
| 2 | 2 · 대웅전 | Completar (input verbatim) | G035/G036 como sistema | La palabra que la humedad borró |
| 3 | 2 · 대웅전 | Selección (4 opciones, una variable) | G050 → -(으)ㄴ 것 같아요 | La señal que el jugador nota primero |

---

### §8.1 · SLOT 1 · Los recuerdos del té

**Cuarto:** 1 · 다실 — **Tipo:** Selección (4 opciones) — **Gramática foco:** G013 (-았/었어요) — **Refuerza:** G034 (-(으)ㄹ 때)

**Disparador:** 우담 sirve el té y, mientras la taza humea, recuerda al maestro en voz alta (voz + subtítulo KO; aquí no hay nota escrita — el «texto» es su voz). La pregunta de UI es siempre la misma: **«¿Qué recuerda 우담?»** Entenderle es hacerle compañía.

**Éxito (fijo, todos los runs):** «아… 알아들었어요?» — y la primera sonrisa real.
**Fallo:** UI neutra («Esa no es la memoria que escuchaste.») — nunca una réplica del monje (anti-melodrama, regla editorial 2).

> **Nota de diseño (honoríficos, regla editorial 4):** los cinco recuerdos están en primera persona o en «nosotros» (스승님하고 같이), así el **pasado llano es correcto también en cortesía**: nadie conjuga las acciones del maestro sin -시- porque el sujeto gramatical nunca es el maestro. El respeto vive en el nombre (스승님), no en morfología testeada. El flavor opcional de cada candidato tampoco conjuga al maestro.
>
> **Nota de diseño (G034 habitual, blindaje de auditoría):** los cinco recuerdos usan -(으)ㄹ 때 en **presente** con el verbo final en **pasado** — es la lectura **HABITUAL** de -(으)ㄹ 때 («cuando solía…», «cada vez que…»), no el evento puntual. La definición canónica de G034 (`grammars-n2.ts`) reserva -았/었을 때 para el momento puntual pasado («cuando llegué…»), pero coincide con que -(으)ㄹ 때 presente «suena más habitual o general» y trae como ejemplo de contraste 비가 올 때 우산을 써요. Todos los candidatos del slot están anclados a esa lectura habitual (매일 / 작년 겨울에 / la rutina diaria), así que el uso es correcto y natural; la Pista 2 lo deja explícito para que la auditoría gramatical no lo lea como error.
>
> **Nota de diseño (posición):** los `correctIndex` de los cinco candidatos están repartidos (1.1→A, 1.2→C, 1.3→A, 1.4→D, 1.5→B) para que la letra correcta no sea predecible; el motor no baraja.

**Candidato 1.1 — La campana del amanecer**
- **Recuerdo (KO):** «매일 해가 뜰 때 종소리를 들었어요. 스승님의 종소리였어요.»
- **Pregunta:** ¿Qué recuerda 우담?
- **Opciones (correcta = A):**
  - A) Cada mañana, al salir el sol, oía la campana del maestro. ✅
  - B) Cada mañana, al salir el sol, **oye** la campana del maestro. *(DT — presente; además la campana lleva 49 días en silencio)*
  - C) Cada mañana, al salir el sol, oía el **tambor** del maestro. *(D2 — 북소리 vs 종소리)*
  - D) Cada **tarde, al ponerse el sol**, oía la campana del maestro. *(D3 — marco temporal: 해가 질 때)*
- **Pista 1:** `종소리` = el sonido de la campana · `해가 뜨다` = salir el sol · `듣다 → 들었어요` = oí/oía.
- **Pista 2:** -(으)ㄹ 때 = «cuando» (G034) no marca tiempo: el tiempo lo pone el verbo final. 들었어요 lleva -었- (G013, y 듣다 cambia ㄷ→ㄹ ante vocal) → todo el recuerdo es pasado. Con 매일 («cada día») la lectura es **habitual**: «cuando salía el sol, oía…» (no «cuando salió el sol una vez»).
- **Flavor post-acierto (fijo del candidato, no testeado):** 우담 mira hacia el 종루: «…요즘은 조용해요.»

**Candidato 1.2 — Té cuando llovía**
- **Recuerdo (KO):** «비가 올 때 스승님하고 같이 차를 마셨어요.»
- **Pregunta:** ¿Qué recuerda 우담?
- **Opciones (correcta = C):**
  - A) Cuando **llueve, toma** té con el maestro. *(DT — presente; la trampa duele justo hoy, que llueve)*
  - B) Cuando **nevaba**, tomaba té con el maestro. *(D3 — marco: 눈이 올 때 vs 비가 올 때)*
  - C) Cuando llovía, tomaba té con el maestro. ✅
  - D) Cuando llovía, tomaba **café** con el maestro. *(D2 — 커피 vs 차)*
- **Pista 1:** `비가 오다` = llover · `차` = té · `하고 같이` = junto con.
- **Pista 2:** 비가 올 때 no dice si llueve hoy o llovía entonces — eso lo dice 마셨어요 (pasado, G013). Verbo final en pasado → traduce «cuando llovía» (lectura habitual de -(으)ㄹ 때, G034).

**Candidato 1.3 — Mirar el 매화**
- **Recuerdo (KO):** «매화가 필 때 스승님하고 같이 마당에서 꽃을 봤어요.»
- **Pregunta:** ¿Qué recuerda 우담?
- **Opciones (correcta = A):**
  - A) Cuando florecía el ciruelo, miraba las flores con el maestro en el patio. ✅
  - B) Cuando **florece** el ciruelo, **mira** las flores con el maestro en el patio. *(DT — presente)*
  - C) Cuando florecía el **cerezo**, miraba las flores con el maestro en el patio. *(D2 — 벚꽃 vs 매화)*
  - D) Cuando florecía el ciruelo, miraba las flores con el maestro **en la montaña**. *(D3 — 산에서 vs 마당에서)*
- **Pista 1:** `매화` = flor del ciruelo · `피다` = florecer · `마당` = patio.
- **Pista 2:** 봤어요 = 보다 + -았어요 (G013; armonía vocálica: ㅗ → 았, contraído). 필 때 = «cuando florecía» porque el verbo final está en pasado (G034, lectura habitual).
- **Flavor post-acierto (fijo del candidato, no testeado):** 우담 mira por la puerta abierta hacia el patio: «올해는… 늦게 피었어요.»

**Candidato 1.4 — Kimjang el invierno pasado**
- **Recuerdo (KO):** «작년 겨울에 스승님하고 같이 김장을 했어요. 김치가 아주 맛있었어요.»
- **Pregunta:** ¿Qué recuerda 우담?
- **Opciones (correcta = D):**
  - A) **Este** invierno **hace** kimjang con el maestro, y el kimchi **está** muy rico. *(DT — presente; choca de frente con 작년)*
  - B) El invierno pasado hizo kimjang con el maestro, y el kimchi quedó muy **salado**. *(D2 — palabra plausible: 짰어요 vs 맛있었어요)*
  - C) La **primavera** pasada hizo kimjang con el maestro, y el kimchi quedó muy rico. *(D3 — estación: 봄 vs 겨울)*
  - D) El invierno pasado hizo kimjang con el maestro, y el kimchi quedó muy rico. ✅
- **Pista 1:** `김장` = la preparación anual de kimchi · `작년` = el año pasado · `맛있었어요` = estaba delicioso.
- **Pista 2:** 하다 → 했어요; 맛있다 → 맛있었어요 (G013). 작년 («el año pasado») hace imposible la lectura en presente: si la marca de tiempo y el verbo no concuerdan, desconfía de la opción.

**Candidato 1.5 — Dar de comer al gato**
- **Recuerdo (KO):** «스승님하고 같이 밥을 먹을 때, 고양이한테 먼저 밥을 줬어요.»
- **Pregunta:** ¿Qué recuerda 우담?
- **Opciones (correcta = B):**
  - A) Cuando **comen** juntos, le **dan** de comer al gato primero. *(DT — presente)*
  - B) Cuando comían juntos, le daban de comer al gato primero. ✅
  - C) Cuando comían juntos, le daban **agua** al gato primero. *(D2 — 물 vs 밥)*
  - D) Cuando comían juntos, le daban de comer al gato **al final**. *(D1 — inversión de 먼저)*
- **Pista 1:** `밥을 주다` = dar de comer · `한테` = a (un ser vivo) · `먼저` = primero.
- **Pista 2:** 먹을 때 = «cuando comíamos» (G034 + verbo final en pasado, lectura habitual). 주다 + -었어요 → 줬어요 (G013, contracción ㅜ + 어).

---

### §8.2 · SLOT 2 · La hoja del rito

**Cuarto:** 2 · 대웅전 — **Tipo:** Completar (input verbatim, una respuesta) — **Gramática foco:** G035 (-기 전에) / G036 (-(으)ㄴ 후에) **como sistema** (par mínimo)

**Disparador:** el close-up de la hoja de instrucciones que el maestro dejó escrita para su propio 49재. La humedad ha borrado el **conector** de un paso — el sorteado. El jugador lo **teclea** en el input (el motor compara verbatim tras `trim`). Línea fija de 우담 al abrir la hoja (todos los runs): «비가 또 한 글자를 지웠어요…»

> **Tipo (resuelto contra el motor):** este slot es `completion` puro — input de texto, `answer` única (p. ej. `올리기 전에`). El motor **no** tiene «completar de opción múltiple», así que el cuarteto de formas no se renderiza como botones; las tres formas rivales (la pareja invertida y las dos morfologías cruzadas) se explican como contraste en la Pista 2. Mantener este slot como input verbatim, además de respetar el motor, conserva la alternancia de tipos del nivel (no encadena dos `selection`).

**Orden canónico de la hoja** (tira de pictogramas en el close-up; el paso sorteado se ve en grande y legible, el resto como pictogramas — así cumplimos la regla de presupuesto «texto KO legible solo en close-ups» sin amontonar 10 líneas en 128×128):

`① 마당을 쓸어요 → ② 문을 열어요 → ③ 등을 준비해요 → ④ 초를 켜요 → ⑤ 향을 피워요 → ⑥ 차를 올려요 → ⑦ 절을 해요 → ⑧ 목탁을 쳐요 → ⑨ 이름을 불러요 → ⑩ 종을 쳐요`

> ⚠️ **Verificar antes de producción (regla editorial 7, liturgia):** este orden de 10 pasos del 49재 es **contenido jugable** (las parejas 전에/후에 se testean sobre él), así que afirma una secuencia ritual real. Antes de hornearlo en `obj-ritual-sheet.png` debe **validarse la secuencia con una fuente budista coreana**. Si no se valida, reordenar a un set de tareas genérico (limpiar → abrir → preparar → ofrecer → recogerse) sobre el que el par 전에/후에 siga siendo deducible **sin** afirmar liturgia específica. (Marca espejo en §12.7 junto al flag 새벽/저녁 28/33.)
>
> La tira hace **deducible** la elección 전에/후에 sin saber liturgia: el jugador ve qué pictograma viene antes. El paso ⑩ (종을 쳐요) está en la hoja pero **no** en el pool — es el que 우담 no puede hacer solo. La hoja lo deja a la vista desde el Cuarto 2: siembra del Slot 6 sin decirlo.

**Pago visual:** al escribir el conector correcto y cerrar el close-up, el paso correspondiente del altar se completa EN PANTALLA — la transición del 대웅전 de incompleto a completo es la recompensa del slot.

**Contraste de formas (vive en la Pista 2 de cada candidato, no en botones):** la forma correcta · la pareja contraria **bien formada** (*orden invertido: derrota el rito, no la gramática; la tira de pictogramas lo delata*) · las dos **morfologías cruzadas** (`-(으)ㄴ 전에` y `-기 후에` **no existen**; la trampa constante del par mínimo). Aceptación del input: solo la respuesta canónica; cualquier otra forma cuenta como error normal (la pareja invertida es gramatical pero contradice la hoja, y se explica en la pista, no se acepta).

**Candidato 2.1 — El incienso antes del té** *(pictogramas ⑤→⑥)*
- **Paso (KO):** «차를 ___ 향을 피워요.»
- **Traducción:** Antes de ofrecer el té, se enciende el incienso.
- **Respuesta (verbatim):** `올리기 전에`
- **Pista 1:** `차를 올리다` = ofrecer el té en el altar · `향을 피우다` = encender el incienso. En la hoja, el humo va antes que el té.
- **Pista 2:** «Antes de hacer» = raíz + -기 전에 (G035): aquí 올리기 전에. «Después de hacer» = modificador pasado -(으)ㄴ + 후에 (G036): 올린 후에 — pero eso pondría el incienso **después** del té y la tira muestra el humo antes. Las parejas no se mezclan: -기 후에 y -(으)ㄴ 전에 no existen.

**Candidato 2.2 — La reverencia después del incienso** *(pictogramas ⑤→⑦)*
- **Paso (KO):** «향을 ___ 절을 해요.»
- **Traducción:** Después de encender el incienso, se hace la reverencia.
- **Respuesta (verbatim):** `피운 후에`
- **Pista 1:** `절을 하다` = hacer la reverencia (la postración del rito) · `피우다` = encender (incienso).
- **Pista 2:** 후에 viaja con -(으)ㄴ: 피우다 → 피운 후에 (raíz en vocal + -ㄴ, G036). La pareja 피우기 전에 (G035) pondría la reverencia **antes** del incienso, y la tira dice lo contrario. -기 후에 y -(으)ㄴ 전에 no existen.

**Candidato 2.3 — Las linternas antes de las velas** *(pictogramas ③→④)*
- **Paso (KO):** «초를 ___ 등을 준비해요.»
- **Traducción:** Antes de encender las velas, se preparan las linternas.
- **Respuesta (verbatim):** `켜기 전에`
- **Pista 1:** `초` = vela · `켜다` = encender · `등` = linterna. Hay cuarenta y nueve; una sigue esperando apagada.
- **Pista 2:** «Antes de encender» = 켜기 전에 (G035: la raíz no se conjuga, solo toma -기). 켠 후에 (G036) es la forma para «después de encender» — la tira pide preparar las linternas **primero**, así que la lectura «después» falla el rito. -기 후에 y -(으)ㄴ 전에 no existen.

**Candidato 2.4 — El nombre después del moktak** *(pictogramas ⑧→⑨)*
- **Paso (KO):** «목탁을 ___ 이름을 불러요.»
- **Traducción:** Después de tocar el moktak, se llama el nombre (del que parte).
- **Respuesta (verbatim):** `친 후에`
- **Pista 1:** `목탁` = el pez de madera (se golpea marcando el ritmo) · `치다` = tocar/golpear · `이름을 부르다` = llamar el nombre.
- **Pista 2:** 치다 → 친 후에 = «después de tocar» (G036, raíz en vocal + -ㄴ). La pareja -기 전에 (G035) queda para lo que aún no se ha hecho, y la tira muestra el nombre **después** del moktak. -기 후에 y -(으)ㄴ 전에 no existen.

**Candidato 2.5 — El patio antes de la puerta** *(pictogramas ①→②)*
- **Paso (KO):** «문을 ___ 마당을 쓸어요.»
- **Traducción:** Antes de abrir la puerta, se barre el patio.
- **Respuesta (verbatim):** `열기 전에`
- **Pista 1:** `문을 열다` = abrir la puerta · `마당을 쓸다` = barrer el patio. El patio se recibe limpio.
- **Pista 2:** 전에 exige -기: 열기 전에 (G035). La forma rival 연 후에 es gramática válida (열다 → 연: las raíces en ㄹ la pierden ante -ㄴ, G036) — pero significa «después de abrir» y la hoja barre el patio **antes**, así que el rito manda. -기 후에 y -(으)ㄴ 전에 no existen.

---

### §8.3 · SLOT 3 · Las señales

**Cuarto:** 2 · 대웅전, tras el altar completo — **Tipo:** Selección (4 opciones; **una sola variable**: la conjugación del modificador) — **Gramática foco:** G050 **restringido** a -(으)ㄴ 것 같아요 (conjetura sobre lo ya ocurrido)

**Disparador:** con el altar completo, la señal sorteada gana su hotspot (brillo de 1 px). El jugador la examina y se lo dice a 우담 **en voz baja** — la frase es del jugador, no del monje. Así la conjetura no compromete a nadie (regla editorial 1), y 같아요 hace que ni siquiera el jugador AFIRME: nombrar sin afirmar es exactamente lo que el slot entrena.

> **Tipo (resuelto contra el motor):** `selection` — 4 opciones clicables + `correctIndex`. El blanco se completa eligiendo la conjugación del modificador delante de 것 같아요; el coreano fijo de cada frase rodea ese hueco. El valor pedagógico está en **contrastar las cuatro lecturas temporales/aspectuales**, así que `selection` (no input) es lo correcto: conserva los cuatro contrastes y encaja sin tocar motor.

**Por qué la respuesta correcta es siempre -(으)ㄴ 것 같아요:** todas las señales son **huellas** — algo que ya pasó y dejó rastro. Conjeturar en presente (-는) o en futuro (-(으)ㄹ) rompe la lógica de la huella. La cuarta opción es siempre **otra lectura temporal/aspectual bien formada** (intención -(으)려는, hábito pasado -던, etc.) que también falla la lógica de la huella terminada — descartable por el **sentido**, no por ser una no-palabra. (Se evita a propósito la forma agramatical *-았/었는 것*: un TOPIK-2 la descartaría sin leer, dejando un puzzle de 3 opciones reales; aquí las cuatro son legítimas y solo el sentido de huella decide.)

**Respuesta de 우담 (fija por candidato):** explicación mundana SIEMPRE (capa 1 intacta) + beat sin texto reutilizado en los cinco: **la sonrisa que no cierra** — 우담 sonríe medio segundo tarde y mira la señal un instante más de lo debido (misma animación de 2 frames; sin VFX, sin música).

> **Nota de diseño (deniabilidad, regla editorial 1):** las descripciones de señal son **percepción pura**, sin adverbio de narrador que cierre la lectura sobrenatural; la conjetura -(으)ㄴ 것 같아요 ya hace todo el trabajo y la coartada mundana de 우담 llega a ≤1 beat. (Por eso 3.1 no dice «nadie la ha tocado» ni 3.4 «solo de ida»: la taza vacía y la línea de huellas bastan.)
>
> **Nota de diseño (posición):** los `correctIndex` de los cinco candidatos están repartidos (3.1→A, 3.2→C, 3.3→B, 3.4→D, 3.5→A); el motor no baraja.
>
> **Ubicaciones:** tres señales viven en el propio 대웅전 (huellas, tinta, 목탁) y dos en el 다실 (la taza, el gato) — los cuartos son revisitables y el hotspot se enciende solo tras completar el altar. Si §6 sitúa algún objeto en otro punto, el candidato no cambia (regla 5: intercambiables).

**Candidato 3.1 — La segunda taza**
- **Señal:** la segunda taza del 다실 — la que ya estaba servida y caliente al llegar — está vacía.
- **Frase del jugador (KO):** «누가 이 차를 ___ 것 같아요.»
- **Pregunta:** ¿Qué le dices a 우담 en voz baja?
- **Opciones (correcta = A):** (la palabra del hueco)
  - A) 마신 → «Parece que alguien se **bebió** este té.» ✅ *(huella: la taza está vacía)*
  - B) 마시는 → «Parece que alguien se lo **está bebiendo**.» *(DT — presente; la sala está vacía: la señal es una huella, no una escena)*
  - C) 마실 → «Parece que alguien se lo **va a beber**.» *(futuro; la taza ya está vacía)*
  - D) 마시던 → «Parece el té que alguien **solía beber**.» *(hábito pasado bien formado, pero la huella es un acto puntual y terminado, no una costumbre)*
- **우담 (mundana, fija):** «아… 제가 마셨나 봐요. 오늘은 정신이 없어서요.» — *Ah… lo habré bebido yo. Hoy no estoy en mí.* (y la sonrisa que no cierra)
- **Pista 1:** `누가` = alguien · `마시다` = beber · la taza está vacía **ya**: lo que buscas ya ocurrió y terminó.
- **Pista 2:** Conjetura sobre el pasado puntual = V-(으)ㄴ 것 같아요 (G050 restringido): 마시다 → 마신. -는 것 같아요 habla de ahora; -(으)ㄹ 것 같아요, del futuro; -던 것 marca un hábito pasado, no una huella única.

**Candidato 3.2 — El moktak que sonó solo**
- **Señal:** hace un momento, un golpe seco de madera desde el altar. El 목탁 está en su cojín.
- **Frase del jugador (KO):** «아까 목탁에서 소리가 ___ 것 같아요.»
- **Pregunta:** ¿Qué le dices a 우담 en voz baja?
- **Opciones (correcta = C):** (la palabra del hueco)
  - A) 날 → «Parece que **va a sonar**.» *(futuro)*
  - B) 나는 → «Parece que **está sonando**.» *(DT — presente; ahora mismo hay silencio)*
  - C) 난 → «Parece que hace un rato **sonó** el moktak.» ✅ *(huella: el golpe ya ocurrió)*
  - D) 나려는 → «Parece que **está por sonar**.» *(intención/inminencia bien formada, pero 아까 ancla el hecho en el pasado, no en lo inminente)*
- **우담 (mundana, fija):** «바람이에요. 오래된 나무는 소리가 나요.» — *Es el viento. La madera vieja suena.* (y la sonrisa que no cierra)
- **Pista 1:** `목탁` = pez de madera · `소리가 나다` = sonar, hacerse oír · `아까` = hace un momento.
- **Pista 2:** 아까 ancla la conjetura en el pasado: 나다 → 난 것 같아요 (G050 restringido). Si la palabra de tiempo (아까) y el modificador no concuerdan, la opción miente.

**Candidato 3.3 — El gato y el cojín vacío**
- **Señal:** el gato pardo se despertó de golpe junto al brasero y mira fijo el cojín vacío. No parpadea.
- **Frase del jugador (KO):** «고양이가 방금 뭔가를 ___ 것 같아요.»
- **Pregunta:** ¿Qué le dices a 우담 en voz baja?
- **Opciones (correcta = B):** (la palabra del hueco)
  - A) 보는 → «Parece que **está viendo** algo.» *(DT — presente; pero lo que preguntas es qué lo despertó: eso ya pasó)*
  - B) 본 → «Parece que el gato **acaba de ver** algo.» ✅ *(huella: lo que lo despertó ya ocurrió)*
  - C) 볼 → «Parece que **va a ver** algo.» *(futuro)*
  - D) 보려는 → «Parece que **quiere ver** algo.» *(intención bien formada, pero 방금 marca algo que ya sucedió, no una intención presente)*
- **우담 (mundana, fija):** «고양이는 원래 그래요. 먼지를 봤을 거예요.» — *Los gatos son así. Habrá visto una mota de polvo.* (y la sonrisa que no cierra)
- **Pista 1:** `방금` = justo ahora, hace un instante · `뭔가` = algo · `보다` = ver.
- **Pista 2:** 보다 → 본 것 같아요: conjetura sobre lo que ya ocurrió (G050 restringido). 방금 = «hace un instante» — pasado inmediato, pero pasado.

**Candidato 3.4 — Huellas húmedas hacia el altar**
- **Señal:** sobre la tarima seca del 대웅전, una línea de huellas húmedas hacia el altar.
- **Frase del jugador (KO):** «누가 젖은 발로 ___ 것 같아요.»
- **Pregunta:** ¿Qué le dices a 우담 en voz baja?
- **Opciones (correcta = D):** (la palabra del hueco)
  - A) 들어오는 → «Parece que alguien **está entrando**.» *(DT — presente; la puerta está quieta)*
  - B) 들어올 → «Parece que alguien **va a entrar**.» *(futuro)*
  - C) 들어오려는 → «Parece que alguien **quiere entrar**.» *(intención bien formada, pero las huellas son rastro de algo ya hecho, no de una intención)*
  - D) 들어온 → «Parece que alguien **entró** con los pies mojados.» ✅ *(huella: la línea de huellas es el rastro de un paso ya dado)*
- **우담 (mundana, fija):** «제 발자국이에요. 아침부터 비를 맞았어요.» — *Son mis huellas. Llevo desde la mañana bajo la lluvia.* (y la sonrisa que no cierra)
- **Pista 1:** `젖은` = mojado · `발` = pie · `들어오다` = entrar.
- **Pista 2:** Las huellas son el rastro de algo terminado: 들어오다 → 들어온 것 같아요 (G050 restringido). El presente -는 describiría a alguien entrando ahora. (Y de paso: 젖은 es el mismo modificador -(으)ㄴ trabajando de adjetivo sobre 젖다 — la misma terminación que pones en el hueco.)

**Candidato 3.5 — Olor a tinta fresca**
- **Señal:** junto al altar cuelga la última caligrafía del maestro, interrumpida a media frase («비가 오—»). Tiene 49 días. Huele a tinta recién molida.
- **Frase del jugador (KO):** «누가 방금 글씨를 ___ 것 같아요.»
- **Pregunta:** ¿Qué le dices a 우담 en voz baja?
- **Opciones (correcta = A):** (la palabra del hueco)
  - A) 쓴 → «Parece que alguien **escribió** hace un momento.» ✅ *(huella: el olor es el rastro de un acto terminado)*
  - B) 쓰는 → «Parece que alguien **está escribiendo**.» *(DT — presente; no hay pincel en el aire)*
  - C) 쓸 → «Parece que alguien **va a escribir**.» *(futuro)*
  - D) 쓰던 → «Parece la escritura que alguien **estaba haciendo** (y dejó).» *(aspecto durativo-interrumpido bien formado, tentador por la frase cortada — pero la conjetura es sobre el acto puntual que dejó el olor, no sobre una costumbre)*
- **우담 (mundana, fija):** «먹 냄새는 오래 가요. 비 오는 날에는 더 진해요.» — *El olor a tinta dura mucho. Los días de lluvia es más intenso.* (y la sonrisa que no cierra)
- **Pista 1:** `글씨` = escritura, letra (a mano) · `쓰다` = escribir · `먹` = tinta de barra.
- **Pista 2:** 쓰다 → 쓴 것 같아요 (G050 restringido): el olor es la huella de un acto terminado. -던 것 marcaría un hábito o algo dejado a medias; aquí conjeturas el acto puntual que dejó el rastro, así que va -(으)ㄴ.

---

> Los pools de los Slots 4-6 (el diario, la confesión del umbral y la despedida con fichas) viven en §9.

---

## §9 · Pool de puzzles — Slots 4-6

> **Notación:** Cada candidato muestra el coreano (lo que ve el jugador), la traducción interna, la pregunta/opciones o respuesta o tiles+orden, y las 2 pistas (Pista 1 gratis, Pista 2 premium — los términos gramaticales viven SOLO en la Pista 2, regla editorial 3).
> En cada run, el motor sortea 1 candidato por slot del pool de 5. La sorteadora es diegética (regla editorial 5): aquí, el papel hinchado por la humedad decide qué página ofrece el diario, y la lluvia ya eligió qué recuerdos caben en cada noche.
> Estos tres slots son la columna emocional del nivel: **leer** el giro (Slot 4), **entender** la confesión (Slot 5), **decir** la despedida (Slot 6).

---

### §9.1 · SLOT 4 · La página del diario (EL GIRO)
**Cuarto:** 3 (스승의 방) · **Tipo:** Selección (4 opciones) · **Gramática foco:** G013 · **Refuerza:** lectura extendida en pasado

**Mecánica diegética:** 우담 baja el diario de la repisa y lo deja en tus manos sin abrirlo — «혼자서는 못 열었어요». El papel, hinchado por cuarenta y nueve días de humedad, se abre solo por una página: la del run. Cada página es autónoma (≤4 frases KO, TOPIK-2 — coartada canónica: el maestro escribía «en coreano fácil, para que cualquier viajero pudiera leerlo») y cada una contiene el giro completo desde un día distinto: hace veinte años llegó bajo la lluvia un niño que no lloraba; el maestro inventó para él el cuento de la campana; ese niño era 우담.

> ⚠️ **La última entrada del diario NO es candidato.** La promesa del huésped («사십구일째 되는 날, 비가 오면 손님이 올 거예요…») y la firma 淸雨 son el **beat fijo post-slot**, idéntico en todos los runs: tras el acierto, 우담 — ya capaz — pasa él mismo la página. La mira mucho rato y dice solo: «…스승님이 보내신 것 같아요.» (línea fija de 우담 sobre su maestro → honorífico `-시-`, regla editorial 4). Texto completo en §3; posición en el flujo en §7. Ningún beat aguas abajo depende de la página sorteada.

**Anotación de distractores del slot:** actor cambiado *(D2)* · tiempo cambiado, la página leída como presente/futuro *(distractor temático del nivel)* · detalle cambiado *(D3)*.

> **Posición (resuelto contra el motor):** `SlotSelection.vue` renderiza `options` en orden de array **sin barajar** y compara contra `correctIndex` — igual que los Slots 1 y 3. Abajo la opción ✅ se lista primera por legibilidad, pero **en el seed se reparte la posición correcta** entre los cinco candidatos (p. ej. 4.1→B, 4.2→D, 4.3→A, 4.4→C, 4.5→B) para que la letra correcta no sea predecible entre runs.

**Candidato 4.1 — el día que llegó el niño**
- **Página (KO):** `오늘 비가 많이 왔어요. 작은 아이가 혼자 절에 왔어요. 아이는 울지 않았어요. 그래서 우담에게 종 이야기를 만들어 줬어요.`
- **Traducción:** «Hoy llovió mucho. Un niño pequeño llegó solo al templo. El niño no lloraba. Por eso, para 우담, inventé el cuento de la campana.»
- **Pregunta:** ¿Qué cuenta esta página?
- **Opciones:**
  - A) Un día de lluvia llegó al templo un niño que no lloraba, y el maestro inventó para él el cuento de la campana. Ese niño era 우담. ✅
  - B) Un día de lluvia llegó un niño al templo, y el niño inventó el cuento de la campana para el maestro. *(D2 — actor cambiado)*
  - C) El maestro escribe que un día de lluvia llegará un niño, y que entonces le inventará un cuento. *(temático — leído como futuro)*
  - D) Un día de lluvia llegó al templo un niño llorando sin parar, y el maestro inventó el cuento para consolarlo. *(D3 — el detalle clave invertido: el niño NO lloraba)*
- **Pista 1:** `만들어 줬어요` = "lo hice PARA alguien". Mira a quién: `우담에게`.
- **Pista 2:** Todos los verbos llevan `-았/었어요` — ya ocurrió. `왔어요` no es `올 거예요` (vendrá).

**Candidato 4.2 — el día que oyó a los niños del pueblo contar «su» leyenda**
- **Página (KO):** `오늘 마을 아이들이 종 이야기를 했어요. 그 이야기는 사실 제가 만들었어요. 오래전 비 오는 날, 어린 우담이 절에 왔어요. 그 아이는 울지 않았어요.`
- **Traducción:** «Hoy los niños del pueblo contaban el cuento de la campana. Ese cuento, en realidad, lo inventé yo. Hace mucho, un día de lluvia, el pequeño 우담 llegó al templo. Ese niño no lloraba.»
- **Pregunta:** ¿Qué cuenta esta página?
- **Opciones:**
  - A) El maestro oyó a los niños del pueblo contar la leyenda de la campana — la que él mismo inventó para 우담, el niño que llegó bajo la lluvia sin llorar. ✅
  - B) El maestro oyó la leyenda que los niños del pueblo habían inventado, y se la contó al pequeño 우담. *(D2 — actor cambiado)*
  - C) El maestro piensa inventar un cuento que algún día los niños del pueblo contarán. *(temático — leído como plan futuro)*
  - D) El maestro oyó la leyenda en el pueblo — la que inventó para 우담, el niño que llegó un día de nieve. *(D3 — clima cambiado)*
- **Pista 1:** `사실` = "en realidad". ¿Quién es `제가`? El que escribe este diario.
- **Pista 2:** `만들었어요` lleva `-았/었-`: el cuento ya fue inventado. No es un plan — es una confesión por escrito.

**Candidato 4.3 — el día que pintó las palabras en la viga**
- **Página (KO):** `오늘 종루에 종 이야기를 붓으로 썼어요. 이 이야기는 제가 우담을 위해서 만들었어요. 그 아이는 오래전, 비 오는 날 절에 왔어요. 그리고 울지 않았어요.`
- **Traducción:** «Hoy escribí con pincel el cuento de la campana en el 종루. Este cuento lo inventé yo para 우담. Ese niño llegó al templo hace mucho, un día de lluvia. Y no lloraba.»
- **Pregunta:** ¿Qué cuenta esta página?
- **Opciones:**
  - A) El maestro pintó en la madera del campanario el cuento que él inventó para 우담 — el niño que llegó bajo la lluvia y no lloraba. ✅
  - B) 우담 pintó en la madera del campanario el cuento que él mismo había inventado al llegar al templo. *(D2 — actor cambiado)*
  - C) El maestro escribe que pintará el cuento en el campanario cuando llegue un niño que no llore. *(temático — leído como futuro)*
  - D) El maestro pintó el cuento en el 일주문, la puerta del templo, para que lo leyeran los viajeros. *(D3 — lugar cambiado)*
- **Pista 1:** `붓` = pincel. `종루` = el pabellón de la campana. La letra de la viga y la del diario… compáralas.
- **Pista 2:** `썼어요` es el pasado de `쓰다` (escribir): la acción de pintar las palabras ya ocurrió, ese mismo día.

**Candidato 4.4 — la primera vez que el pequeño 우담 tocó la campana**
- **Página (KO):** `오늘 어린 우담이 처음 종을 쳤어요. 우담이 처음 절에 온 날처럼 비가 왔어요. 그날 아이는 울지 않았어요. 그래서 종 이야기를 만들었어요.`
- **Traducción:** «Hoy el pequeño 우담 tocó la campana por primera vez. Llovía, como el día en que llegó al templo. Aquel día el niño no lloraba. Por eso inventé el cuento de la campana.»
- **Nota de canon:** esta página contiene VERBATIM la frase-ancla del giro citada en la biblia: «그래서 종 이야기를 만들었어요».
- **Pregunta:** ¿Qué cuenta esta página?
- **Opciones:**
  - A) El día en que el pequeño 우담 tocó la campana por primera vez también llovía — como el día en que llegó sin llorar, cuando el maestro inventó para él el cuento. ✅
  - B) El día en que el maestro tocó la campana por primera vez, el pequeño 우담 le inventó un cuento. *(D2 — actores invertidos)*
  - C) Hoy 우담 toca la campana por primera vez; si no llora, el maestro le inventará un cuento. *(temático — leído como presente/condición futura)*
  - D) El pequeño 우담 tocó la campana por primera vez un día sin lluvia, mucho después de llegar al templo. *(D3 — el eco de la lluvia, borrado)*
- **Pista 1:** `처음` = por primera vez. `종을 치다` = tocar la campana. Hay dos días de lluvia en esta página: el de llegar y el de tocar.
- **Pista 2:** `왔어요`, `쳤어요`, `만들었어요` — todo en `-았/었어요`: la página recuerda, no anuncia.

**Candidato 4.5 — un día de lluvia cualquiera, años después**
- **Página (KO):** `오늘도 비가 왔어요. 마당을 쓰는 우담을 봤어요. 행복했어요. 이십 년 전 비 오는 날, 울지 않는 아이에게 종 이야기를 만들어 줬어요.`
- **Traducción:** «Hoy también llovió. Vi a 우담 barriendo el patio. Fui feliz. Hace veinte años, un día de lluvia, al niño que no lloraba le inventé el cuento de la campana.»
- **Pregunta:** ¿Qué cuenta esta página?
- **Opciones:**
  - A) Años después, un día de lluvia, el maestro miró a 우담 barrer el patio y fue feliz — veinte años atrás había inventado el cuento para aquel niño que no lloraba. ✅
  - B) Años después, 우담 miró al maestro barrer el patio y recordó el cuento que él mismo había inventado. *(D2 — actores invertidos)*
  - C) El maestro escribe que será feliz cuando, dentro de veinte años, vea a un niño barrer el patio bajo la lluvia. *(temático — leído como futuro)*
  - D) El maestro vio a 우담 preparar el té un día de sol y recordó que el niño había llegado hace diez años. *(D3 — acción, clima y cifra cambiados)*
- **Pista 1:** `마당을 쓸다` = barrer el patio. `이십 년 전` = hace veinte años.
- **Pista 2:** `행복했어요` lleva `-았/었-`: una felicidad ya vivida. Es la página de un hombre que mira atrás, no adelante.

---

### §9.2 · SLOT 5 · La confesión en el umbral (안 vs 못)
**Cuarto:** 3 (스승의 방, en el umbral) · **Tipo:** Completar (botones `안` / `못`) · **Gramática foco:** G016 · **Refuerza:** G013

**Mecánica:** tras el beat fijo del diario, 우담 habla por fin de estos 49 días. La frase sorteada aparece con hueco; la **cláusula de motivo decide**: `안` = la voluntad eligió no hacerlo (el amor eligió); `못` = algo se interpuso — la voz, la mano, el miedo (el duelo impidió). El fallo se señala como **lectura incorrecta** (UI neutra), NUNCA como réplica herida del monje (regla editorial del nivel). Al acertar suena la línea de absolución fija (texto en §3). Las cinco confesiones son canon verbatim de la biblia.

> **Nota de diseño (heurística limpia, regla editorial 6):** en los cinco candidatos la cláusula de motivo señala SIN ambigüedad la lectura correcta y JAMÁS contiene un `안` o un `못` sueltos que el jugador TOPIK-2 pueda copiar al hueco. Motivo que expresa voluntad (`-고 싶지 않았어요`) → `안`; motivo que expresa un impedimento físico o emocional → `못`. La regla que el slot enseña debe poder aplicarse a ciegas.

**Candidato 5.1**
- **Confesión (KO):** `마지막 인사를 ___ 했어요. 목이 메었어요.`
- **Traducción:** «No pude decir el último adiós. Se me hizo un nudo en la garganta.»
- **Respuesta:** `못` → `마지막 인사를 못 했어요.`
- **Por qué decide el motivo:** `목이 메었어요` — la garganta se cerró sola. El cuerpo desobedeció a la intención: no hubo elección, hubo impedimento. (La cláusula de motivo no contiene ningún `안` que pueda confundir al jugador — señala impedimento físico puro.)
- **Pista 1:** `안` = elegiste no hacerlo. `못` = querías, pero no pudiste.
- **Pista 2:** Mira la segunda frase: `목이 메었어요` = "se me hizo un nudo en la garganta". Una garganta que se cierra sola no es una decisión — es un impedimento.

**Candidato 5.2**
- **Confesión (KO):** `스승님 방 문을 ___ 닫았어요. 아직 닫고 싶지 않았어요.`
- **Traducción:** «No cerré la puerta del cuarto del maestro. Todavía no quería cerrarla.»
- **Respuesta:** `안` → `문을 안 닫았어요.`
- **Por qué decide el motivo:** `닫고 싶지 않았어요` — "no quería": la voluntad está intacta y decidió. Nada se lo impedía; el amor eligió dejarla abierta. (Eco del final: los 고무신 del maestro siguen en su sitio — esos todavía no. `안`, no `못`.)
- **Pista 1:** `안` = elegiste no hacerlo. `못` = querías, pero no pudiste.
- **Pista 2:** Mira la segunda frase: `-고 싶지 않았어요` = "no quería". Donde hay querer (o no querer), hay elección.

**Candidato 5.3**
- **Confesión (KO):** `그날 아침 종을 ___ 쳤어요. 손이 멈췄어요.`
- **Traducción:** «Aquella mañana no pude tocar la campana. La mano se me detuvo.»
- **Respuesta:** `못` → `종을 못 쳤어요.`
- **Por qué decide el motivo:** la mano se detuvo SOLA — el cuerpo desobedeció a la intención. Él subió al 종루 a tocarla: quiso, y no pudo. Por eso la campana lleva 49 días en silencio.
- **Pista 1:** `안` = elegiste no hacerlo. `못` = querías, pero no pudiste.
- **Pista 2:** Mira la segunda frase: una mano que se detiene sola no es una decisión — es un impedimento.

**Candidato 5.4**
- **Confesión (KO):** `일기장을 ___ 읽었어요. 무서웠어요.`
- **Traducción:** «No pude leer el diario. Tenía miedo.»
- **Respuesta:** `못` → `일기장을 못 읽었어요.`
- **Por qué decide el motivo:** el miedo no es una elección serena: paraliza. Coincide letra a letra con la línea fija del slot anterior — «혼자서는 못 열었어요» — y la confirma: no fue que no quisiera abrirlo; es que solo no podía.
- **Pista 1:** `안` = elegiste no hacerlo. `못` = querías, pero no pudiste.
- **Pista 2:** Mira la segunda frase: `무서웠어요` = "tenía miedo". El miedo se interpone — no elige.

**Candidato 5.5**
- **Confesión (KO):** `혼자 차를 ___ 마셨어요. 혼자 마시고 싶지 않았어요. 그래서 매일 두 잔을 준비했어요.`
- **Traducción:** «No tomé el té solo. No quería tomarlo solo. Por eso cada día preparaba dos tazas.»
- **Respuesta:** `안` → `혼자 차를 안 마셨어요.`
- **Por qué decide el motivo:** `마시고 싶지 않았어요` — voluntad explícita: pudo haber bebido solo, y eligió no hacerlo. La tercera frase es la consecuencia de esa elección — las dos tazas de cada día.
- **Nota de diseño:** este candidato roza el beat fijo de la segunda taza («스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요.»), pero el beat se paga en el **100 % de los runs**, salga o no este candidato (regla editorial 5: nada aguas abajo depende del sorteo). La línea fija del beat lleva honorífico sobre el maestro — `떠나신` (떠나다 → 떠나시다), regla editorial 4.
- **Pista 1:** `안` = elegiste no hacerlo. `못` = querías, pero no pudiste.
- **Pista 2:** Mira la segunda frase: "no quería" es una elección. Y la tercera frase te enseña qué hizo con ella.

---

### §9.3 · SLOT 6 · La despedida en la cuerda de la campana (FINAL)
**Cuarto:** 4 (종루) · **Tipo:** Creación con tiles (drag-and-drop) · **Gramática foco:** G013 + G034

**Mecánica:** 우담 no puede decir la despedida. El jugador la construye con fichas y se la da. Cada candidato trae sus 4 fichas correctas + 3 distractoras sistemáticas: **[presente]** — la MISMA frase sin terminar de despedir, la trampa temática del nivel; **[partícula]** — `한테/하고/은/이/을` equivocada; **[conector falso]** — una pieza de gramática del propio nivel que rompe la frase. Al acertar, 우담 repite la frase del jugador palabra a palabra y pone tus manos junto a las suyas en la cuerda del 당목 — «같이요.» La cinemática de salida **cita textualmente** la despedida construida (se interpola el candidato del run; las cinco sobreviven la interpolación en primera persona).

> ⚠️ **REGLA ESPECIAL — rechazo suave (extensión del motor, ver §12):** la PRIMERA validación que contenga la ficha en presente no cuesta corazón. La campana calla; 우담, sin reproche: «끝난 일은… 끝난 말로 해야 해요.» — lo terminado se dice con palabras terminadas. Reincidir = error normal (consume corazón). **Solo el distractor `[presente]` dispara esta línea-tesis;** los distractores `[partícula]` y `[conector falso]` son error normal desde el primer intento y caen en la **UI neutra de "lectura incorrecta"** estándar (NUNCA la línea «끝난 일은…», que es exclusiva del presente). SIN METALENGUAJE en pantalla: la palabra «pasado» solo existe en la Pista 2.

> **Nota de implementación para §12.1 (mapeo de `softRejectTiles`):** la ficha `[presente]` es siempre una pieza extra (nunca en `correctOrder`). Su índice por candidato — asumiendo orden de array `[correctas (0-3), presente (4), partícula (5), conector (6)]` — es `softRejectTiles = [4]` en los cinco candidatos, con `correctOrder = [0,1,2,3]`. Por construcción `softRejectTiles ∩ correctOrder = ∅`; añadir en §12 un test que lo verifique para cada candidato del Slot 6. La detección de pertenencia a `softRejectTiles` debe evaluarse ANTES de los checks de longitud/orden (ver §12.1, orden de evaluación).

> **Nota de registro (regla editorial 4):** las cinco despedidas van en pasado llano TOPIK-2 (`이었어요`, no `이셨어요`), amparadas por la coartada canónica — el nivel enseña la lengua del diario, «en coreano fácil». La reverencia vive en las líneas fijas de 우담, no en el texto jugable.

**Candidato 6.1**
- **Despedida (KO):** `스승님, 그동안 정말 감사했어요.`
- **Traducción:** «Maestro, gracias de verdad por todo este tiempo.»
- **Tiles:** [스승님,] [그동안] [정말] [감사했어요] + distractores: [감사해요] *(presente — rechazo suave la 1.ª vez)*, [스승님이] *(partícula — convierte al maestro en el que agradece)*, [그래서] *(conector falso)*
- **correctOrder:** `스승님, → 그동안 → 정말 → 감사했어요`
- **Nota de diseño:** es la hermana formal del voiceOutro de 우담 («그동안 정말 고마웠어요») — el jugador la dice primero; el monje, al final, la hereda.
- **Pista 1:** `그동안` = "durante todo este tiempo" — y ese tiempo ya se cumplió hoy, día 49.
- **Pista 2:** G013: lo terminado lleva `-았/었-`. `감사해요` agradece hoy; `감사했어요` agradece lo vivido.

**Candidato 6.2**
- **Despedida (KO):** `스승님하고 차를 마실 때 행복했어요.`
- **Traducción:** «Cuando tomaba té con usted, maestro, era feliz.»
- **Tiles:** [스승님하고] [차를] [마실 때] [행복했어요] + distractores: [행복해요] *(presente — rechazo suave la 1.ª vez)*, [스승님한테] *(partícula — "a usted" en vez de "con usted")*, [마시기 전에] *(conector falso — G035: «antes de beber» produce una frase gramatical pero de sentido roto; error normal, no rechazo suave)*
- **correctOrder:** `스승님하고 → 차를 → 마실 때 → 행복했어요`
- **Pista 1:** La felicidad NO vivía *antes* del té — vivía DURANTE el té, en el momento exacto de compartirlo. La pieza que buscas dice «cuando», no «antes de».
- **Pista 2:** G034 `-(으)ㄹ 때` = "cuando". La frase entera mira atrás: el verbo final lleva `-았/었-` → `행복했어요`.

**Candidato 6.3**
- **Despedida (KO):** `스승님, 차가 정말 맛있었어요.`
- **Traducción:** «Maestro, el té estaba de verdad delicioso.»
- **Tiles:** [스승님,] [차가] [정말] [맛있었어요] + distractores: [맛있어요] *(presente — rechazo suave la 1.ª vez)*, [차를] *(partícula — `맛있다` describe, no actúa: su sujeto lleva `가`)*, [그리고] *(conector falso)*
- **correctOrder:** `스승님, → 차가 → 정말 → 맛있었어요`
- **Pista 1:** Habla del té de todas aquellas tardes — un sabor que ya es recuerdo.
- **Pista 2:** G013: `맛있어요` = sabe rico ahora; `맛있었어요` = estaba rico — la taza ya está vacía.

**Candidato 6.4**
- **Despedida (KO):** `스승님한테 정말 많이 배웠어요.`
- **Traducción:** «De usted, maestro, aprendí muchísimo.»
- **Tiles:** [스승님한테] [정말] [많이] [배웠어요] + distractores: [배워요] *(presente — rechazo suave la 1.ª vez)*, [스승님하고] *(partícula — "con" en vez de "de": la fuente de lo aprendido se marca con `한테`)*, [배운 후에] *(conector falso — G036: deja la frase sin verbo final)*
- **correctOrder:** `스승님한테 → 정말 → 많이 → 배웠어요`
- **Pista 1:** Lo aprendido ya vive dentro de ti — la frase lo dice desde el después.
- **Pista 2:** `배우다` + `-었어요` → `배웠어요` (우 + 어 = 워). `배워요` sería seguir en clase — y la clase terminó.

**Candidato 6.5**
- **Despedida (KO):** `스승님은 정말 좋은 스승님이었어요.`
- **Traducción:** «Usted fue, de verdad, un buen maestro.»
- **Tiles:** [스승님은] [정말] [좋은] [스승님이었어요] + distractores: [스승님이에요] *(presente — «ES un buen maestro»: la trampa más dolorosa del pool; rechazo suave la 1.ª vez)*, [스승님을] *(partícula — objeto donde va el tema)*, [그런데] *(conector falso)*
- **correctOrder:** `스승님은 → 정말 → 좋은 → 스승님이었어요`
- **Pista 1:** La frase entera dice quién FUE alguien — es lo más difícil de decir de quien quisimos.
- **Pista 2:** Cópula en pasado tras consonante (받침 ㅁ de `스승님`): `이었어요`, nunca `였어요`. `이에요` lo dejaría en presente.

---

> **Tabla de verificación de conjugaciones del pool (G013, armonía vocálica y irregulares):**
>
> | Diccionario | Pasado usado | Regla |
> |---|---|---|
> | 오다 | 왔어요 | ㅗ + 았 → 왔 |
> | 보다 | 봤어요 | ㅗ + 았 → 봤 |
> | 주다 | 줬어요 | ㅜ + 었 → 줬 |
> | 배우다 | 배웠어요 | ㅜ + 었 → 웠 |
> | 멈추다 | 멈췄어요 | ㅜ + 었 → 췄 |
> | 마시다 | 마셨어요 | ㅣ + 었 → 셨 |
> | 치다 | 쳤어요 | ㅣ + 었 → 쳤 |
> | 메다 | 메었어요 | ㅔ + 었 → 메었 |
> | 쓰다 (escribir) | 썼어요 | ㅡ se elide + 었 |
> | 쓸다 (barrer) | 쓸었어요 / 쓰는 (modificador: cae ㄹ) | regular ㄹ |
> | 닫다 | 닫았어요 | vocal ㅏ → 았 |
> | 읽다 | 읽었어요 | vocal ㅣ (no ㅏ/ㅗ) → 었 |
> | 울다 | 울었어요 / 울지 않았어요 | regular ㄹ; negación larga |
> | 무섭다 | 무서웠어요 | ㅂ irregular → 무서워 + ㅆ |
> | 맛있다 | 맛있었어요 | 받침 → 었 |
> | 떠나다 | 떠나신 (honorífico, modificador 후에) | 떠나 + 시 + ㄴ; línea fija sobre el maestro |
> | 하다 / 감사하다 / 행복하다 / 준비하다 | 했어요 / 감사했어요 / 행복했어요 / 준비했어요 | 하 → 했 |
> | 이다 (tras 받침) | 이었어요 | `스승님이었어요`; tras vocal sería 였어요 |

---

## §10 · Cosméticos del nivel 2

Tema del set: **«청우사의 빗소리»** (El sonido de la lluvia de Cheonwusa)

| Tier | Cómo se desbloquea | Cosmético | Descripción visual |
|---|---|---|---|
| 🟢 Común | Completar el nivel (incluso usando Pista 2) | **Fondo «빗소리»** | Tejado del 대웅전 bajo la lluvia al atardecer; las 49 linternas como halos cálidos difuminados tras la cortina de agua. Paleta azul-pizarra + ámbar; la lluvia en dos capas de trazos de 1px para profundidad |
| 🔵 Raro | Completar **sin usar Pista 2 en ningún puzzle** | **Marco «단청»** | Marco de vigas policromadas (verde 뇌록, rojo óxido, azul) con medallones de los 사물 en las esquinas: campana (범종), tambor (법고), pez de madera (목어) y placa-nube (운판), cada uno legible a 16×16 |
| 🟣 Épico | Sin Pista 2 + run < 10 min (600 s) | **Avatar animado «절고양이»** | El gato pardo en el alero, a resguardo de la lluvia. 3 frames: parpadeo lento, golpe de cola — y cada pocos ciclos, mira algo fuera de cuadro. Gotas cayendo del alero delante de él, nunca encima |
| 🟡 Legendario | 3 runs consecutivos sin game over (sin Pista 2 en ningún run de la racha) | **Set completo + título «마흔아홉 번째 손님»** | El huésped del día 49: avatar bajo el paraguas de papel aceitado del maestro; marco de bronce con relieve de 비천상 (las apsaras del bronce coreano, como en la campana de Emille); fondo = el plano final con las dos sombras sobre el oro de los escalones. Único lugar, fuera del `farewellImage`, donde las dos sombras existen — el secreto, para quien se lo ganó |

**Notas de producción del set:**
- El fondo común y el fondo legendario comparten paleta (azul-pizarra / ámbar / rosa-dorado) para que el set se lea como familia.
- El título «마흔아홉 번째 손님» no se traduce en la UI (consistente con «민박 손님» del nivel 1); el tooltip glosa: *El huésped del día cuarenta y nueve*.
- El avatar épico reutiliza el sprite del gato del nivel (2 frames en escena + 1 frame extra exclusivo del cosmético: la mirada fuera de cuadro) — coherente con el presupuesto de §11.

---

## §11 · Lista de assets

Presupuesto: el nivel 1 embarcó 27 archivos; objetivo aquí **≤22 imágenes embarcadas**. La cuenta de abajo cierra en 22 (con el opcional incluido) y respeta el techo aunque se recorte el opcional (quedarían 21). Todos los assets viven bajo `munbeop/public/escape-room/level-02/` con la misma estructura de carpetas del nivel 1 (`rooms/`, `objects/`, `cosmetics/`).

#### Imágenes pixel art (22)

**Escenas principales (4) — 320×240:**
- [ ] `rooms/room-01-dasil.png` — sala de té (brasero, dos tazas, gato, 방명록)
- [ ] `rooms/room-02-daeungjeon.png` — salón principal, **estado altar incompleto** (48 linternas encendidas + 1 apagada)
- [ ] `rooms/room-03-seungbang.png` — celda del maestro (고무신 fuera, diario, caligrafía)
- [ ] `rooms/room-04-jongnu.png` — pabellón de la campana, **estado lluvia**

**Variantes de escena (2) — 320×240:**
- [ ] `rooms/room-02-daeungjeon-complete.png` — altar completo (swap en pantalla tras el Slot 2; la linterna 49 SIGUE apagada — su encendido se narra en el outro, no se renderiza)
- [ ] `rooms/room-04-jongnu-clear.png` — post-lluvia: claros rosa-dorados + vapor + goteo

**Cinemáticas (2) — 320×240:**
- [ ] `rooms/cinematic-intro.png` — el 일주문 bajo el aguacero, placa 청우사, paraguas roto en primer plano
- [ ] `rooms/cinematic-outro.png` — **farewellImage**: contrapicado a través del 일주문, 우담 en 합장, el gato, las DOS sombras sobre los escalones-espejo, el paraguas de papel del maestro en primer plano (spec completa en §3; flags de verificación en §12.7)

**Close-ups (8) — 128×128:**
- [ ] `objects/obj-ritual-sheet.png` — hoja de instrucciones del 49재, manuscrita; SIN palabra borrada horneada (el hueco lo pinta la UI, ver §12.2)
- [ ] `objects/obj-diary-page.png` — página de diario genérica manuscrita (sirve a los 5 candidatos del Slot 4)
- [ ] `objects/obj-diary-last.png` — última entrada + firma 淸雨 (hanja horneado como arte, no como fuente)
- [ ] `objects/obj-beam-inscription.png` — la leyenda en la viga, ≤2 líneas + firma pequeña 淸雨, MISMA letra-pincel que el diario
- [ ] `objects/obj-second-cup.png` — la segunda taza humeante
- [ ] `objects/obj-calligraphy-rain.png` — caligrafía interrumpida «비가 오—»
- [ ] `objects/obj-guestbook.png` — el 방명록 abierto, última firma desvaída
- [ ] `objects/obj-guestbook-signed.png` — variante «tu firma añadida» *(opcional «si cabe»; primer recorte si el presupuesto aprieta — al recortarlo la cuenta queda en 21, sigue ≤22)*

**Sprites en escena (1):**
- [ ] `objects/sprite-cat-strip.png` — el gato pardo, 2 frames (dormido / cabeza girada al cojín vacío), ~32×24 por frame

**Cosméticos (5):**
- [ ] `cosmetics/cosmetic-bg-rainsound.png` — 🟢 fondo «빗소리»
- [ ] `cosmetics/cosmetic-frame-dancheong.png` — 🔵 marco «단청» con los 사물 en las esquinas
- [ ] `cosmetics/cosmetic-avatar-templecat.png` — 🟣 avatar «절고양이» (frame de preview estático)
- [ ] `cosmetics/cosmetic-avatar-templecat-strip.png` — strip 3 frames (parpadeo, cola, mirada fuera de cuadro). **Derivado en pipeline del gato del cuarto 1 + 1 frame extra (la mirada fuera de cuadro), NO un sprite de gato dibujado de cero**; se embarca como asset cosmético propio porque el contexto (alero, resguardo de lluvia) y los 3 frames difieren del `sprite-cat-strip.png` de escena (2 frames, interior). Confirmar en producción que se genera por pipeline a partir del sprite de escena para no abrir un tercer set de arte de gato.

**Assets de pipeline (NO se embarcan — se hornean en las escenas):**
- [ ] `tile-lantern.png` — strip 2 estados (encendida / apagada), ~16×24; el muro de 49 linternas se compone repitiendo el tile en generación (recorte canónico)
- Overlay de lluvia 2 frames y vapor 1px: capas del pipeline de escena, no archivos runtime

> **Conteo (≤22):** 4 escenas + 2 variantes + 2 cinemáticas + 8 close-ups (incl. el opcional `obj-guestbook-signed`) + 1 `sprite-cat-strip` + 5 cosméticos = **22**. Si el opcional se recorta, quedan **21**. Los assets de pipeline (`tile-lantern`, overlays) NO cuentan: se hornean. El strip cosmético del gato cuenta como cosmético (1 de los 5), no como un sprite de gato extra, porque se deriva del de escena en el pipeline.

#### Audio del nivel 2

**Voz de 우담 (TTS coreano, UNA sola voz consistente — 29 líneas):**
- [ ] 1 · voiceIntro: `어서 오세요. 비가 그칠 때까지 차 한잔 해요.`
- [ ] 2 · Línea-tesis (cuarto 1, al servir el té): `차는 따뜻할 때 마셔요.`
- [ ] 3-7 · Slot 1: los 5 recuerdos del maestro (uno por candidato del pool)
- [ ] 8 · Reacción de acierto Slot 1: `아… 알아들었어요?`
- [ ] 9 · Frame del Slot 2: `비가 또 한 글자를 지웠어요…`
- [ ] 10 · Pre-Slot-4: `혼자서는 못 열었어요.`
- [ ] 11 · Beat post-Slot-4: `…스승님이 보내신 것 같아요.` *(forma honorífica por regla editorial 4 — decisión cerrada; ver §12.7)*
- [ ] 12-16 · Slot 5: las 5 confesiones (la frase resuelta, leída por el monje tras el acierto)
- [ ] 17 · Absolución post-Slot-5: `맞아요. 안 한 게 아니에요. 못 했어요. …이제, 하고 싶어요.`
- [ ] 18 · Beat de la segunda taza: `스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요.` *(honorífico -시- en la acción del maestro por regla editorial 4 — decisión cerrada; ver §12.7)*
- [ ] 19 · Cuarto 4, la viga: `이 글씨… 스승님 글씨예요.`
- [ ] 20 · Rechazo suave Slot 6: `끝난 일은… 끝난 말로 해야 해요.`
- [ ] 21-25 · Slot 6: las 5 despedidas del pool, repetidas por el monje «con la voz entera» (una por candidato; es la línea que la cinemática cita)
- [ ] 26 · Acierto Slot 6: `같이요.`
- [ ] 27 · Outro, intercambio: `이건 두고 가세요.`
- [ ] 28 · Outro, intercambio: `스승님 거였어요. 비는 또 와요. 그때 또 오세요.`
- [ ] 29 · voiceOutro: `비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.`

**Sin voz, a propósito:** las 5 réplicas mundanas del Slot 3 (texto en pantalla — la explicación mundana no merece énfasis: deniabilidad); las páginas del diario y la última entrada (**la letra del maestro no tiene voz** — anti-melodrama); la tarjeta final.

**Ambient (5 loops):**
- [ ] `ambient-dasil.ogg` — lluvia en tejado + crepitar de brasero + hervidor lejano
- [ ] `ambient-daeungjeon.ogg` — lluvia amortiguada por puertas abiertas + madera que cruje
- [ ] `ambient-seungbang.ogg` — la lluvia más íntima del nivel + goteo de alero cercano
- [ ] `ambient-jongnu.ogg` — lluvia abierta + viento de valle
- [ ] `ambient-jongnu-clear.ogg` — post-lluvia: goteo espaciado, pájaros tímidos, silencio con aire

**SFX (8 nuevos):**
- [ ] `sfx-bell-toll.ogg` — **EL asset del nivel**: tañido de 범종 con 여음 largo (resonancia ≥ 8 s, cola limpia para encadenar los 3 golpes del final; el tañido lejano del beat 6 es este mismo archivo con filtro low-pass + reverb en runtime)
- [ ] `sfx-moktak.ogg` — golpe seco de 목탁 (click cosmético + disparo raro sin click, §12.2)
- [ ] `sfx-tea-pour.ogg` — té sirviéndose (cuarto 1)
- [ ] `sfx-paper-page.ogg` — pasar página del diario / desplegar la hoja
- [ ] `sfx-brush-sign.ogg` — pincel sobre el 방명록 (beat 3 del final)
- [ ] `sfx-door-wood.ogg` — puerta corrediza de madera (cambios de cuarto)
- [ ] `sfx-rain-stop.ogg` — stinger de transición: la lluvia muriendo por fases (3 stems: cortina→hilos→gotas; se cruza con los loops, §12.5)
- [ ] `sfx-cat-purr.ogg` — ronroneo corto (⚪ gato)

**Reusados del nivel 1 (no se producen):** `sfx-correct.ogg`, `sfx-wrong.ogg`, `sfx-select.ogg`, `sfx-paper-rustle.ogg`.

#### UI nueva

- [ ] Feedback de **rechazo suave** (Slot 6): panel neutro sin pérdida de corazón — la cuerda se detiene, la campana no suena; visualmente distinto del feedback de error (que sí cuesta corazón)
- [ ] Overlay de **mancha de humedad** para el hueco del Slot 2 (sprite de borrón posicionable sobre `obj-ritual-sheet.png`, §12.2)
- [ ] Interacción de **firma del 방명록** (beat 3 del outro): overlay simple con animación de pincel; sin input de texto libre
- [ ] Render de la **cita interpolada** `{farewell}` en la cinemática de salida (texto KO en Neodgm ≥ 16 px, §12.3)
- Todo lo demás (panel de puzzle, pistas, tiers, game over) se hereda del motor del nivel 1.

---

## §12 · Notas de implementación y producción

### §12.1 Regla especial del Slot 6 — rechazo suave (`softFirstError`)

Extensión pequeña y acotada, en los módulos que ya existen (sin god files):

> ⚠️ **Ubicación contra el motor real (resuelto):** la validación por-respuesta NO vive en `scoring.ts`. Ese módulo solo expone `scoreRun(outcome, rules)`, que calcula el tier (common/rare/epic/legendary) **al terminar** el run y no ve submissions individuales. La evaluación de cada respuesta de creación está en el **store Pinia** (`app/stores/escape-room.ts → answerCreation(slotId, order)`), que hoy compara `order` contra `correctOrder` y devuelve `AnswerResult = 'correct' | 'wrong' | 'game-over' | 'level-complete'`. Ahí va el tercer estado.

- **Dominio** (`app/lib/domain/escape-room.ts`): `CreationCandidate` gana un campo opcional `softRejectTiles?: readonly number[]` — índices de `tiles` que son fichas en presente (el distractor temático). Solo el Slot 6 de este nivel lo usa; los candidatos del nivel 1 no cambian.
- **Store** (`app/stores/escape-room.ts → answerCreation`): se añade el cuarto valor `'soft-reject'` a `AnswerResult`. **Orden de evaluación** (antes de los checks de longitud/orden): si `order` contiene algún índice de `softRejectTiles` **y** el flag `softRejectConsumed[slotId]` está libre → marcar el flag, NO llamar a `recordError`, devolver `'soft-reject'`. Si la ficha en presente reaparece con el flag ya consumido, o el fallo es de otro tipo (partícula, conector, orden), cae al `recordError()` normal. El acierto sigue resolviendo por `correctOrder` exacto.
- **Estado** (store Pinia del run): un booleano por slot `softRejectConsumed`, reseteado en cada `start()`/run.
- **Validación** (`app/lib/escape-room/rules.ts` — `validateLevel`): si `softRejectTiles` está presente, cada índice debe estar en rango y ser **disjunto de `correctOrder`** (una ficha no puede ser correcta y suave a la vez). Tests unitarios en `tests/unit/escape-room/` junto a los existentes.
- **UI**: el estado `'soft-reject'` dispara el feedback nuevo (§11 UI) + la línea 20 de voz. NUNCA el `sfx-wrong`.
- **`scoring.ts` no cambia:** el rechazo suave, por definición, no incrementa errores ni rompe la racha — así que el `RunOutcome` que llega a `scoreRun` al final ni se entera de que ocurrió.

### §12.2 Randomización diegética

No hay motor nuevo: el sorteo es el `shuffle` estándar de 1 candidato por slot. Lo diegético es pura presentación:

- **Slot 2:** el close-up `obj-ritual-sheet.png` es genérico (la hoja entera, sin hueco horneado). El candidato sorteado define qué palabra «borró la lluvia»; la UI pinta el borrón (overlay de mancha) sobre la posición del hueco y el puzzle pide reponerla. Así 1 imagen sirve a los 5 candidatos.
- **Slot 4:** `obj-diary-page.png` genérica + el texto KO de la página sorteada renderizado en la UI del close-up (Neodgm ≥ 16 px). La última entrada (`obj-diary-last.png`) sí es arte fijo con texto horneado, porque es idéntica en todos los runs.
- **목탁 que suena solo (capa 2):** disparo de `sfx-moktak.ogg` sin interacción con probabilidad baja (~1 de cada 4 runs, máximo 1 vez por run, solo en el cuarto 2). Sin animación, sin texto, sin log. Si el jugador no estaba mirando, no pasó nada — exactamente la deniabilidad que pide la regla editorial 1.
- Invariante de diseño (ya garantizado por la biblia): **ningún beat aguas abajo depende del candidato sorteado** — los beats fijos solo citan contenido fijo o interpolan el candidato del propio run (§12.3).

### §12.3 Cita textual de la despedida en la cinemática final

El texto del beat 1 del outro contiene el token literal `{farewell}`. En render, se sustituye por la frase correcta del candidato sorteado del Slot 6: `correctOrder.map(i => tiles[i]).join(' ')` — la misma frase que el jugador construyó y que el monje repitió. Implementación en el componente de cinemática (presentación pura; el shape `Level.outro: LocalizedString` no cambia). Test unitario: el outro de cada locale contiene `{farewell}` exactamente una vez; test del join para los 5 candidatos del Slot 6.

### §12.4 Beats fijos como contenido NO-slot

Los beats post-Slot-4 (última entrada del diario) y post-Slot-5 (la segunda taza) no son puzzles: son escenas guionadas idénticas en todos los runs. Extensión mínima sugerida: `Level` gana `scriptedBeats?: ScriptedBeat[]` con `{ afterSlotId: string; image?: string; lines: { speaker: 'monk' | 'text'; korean?: string; text: LocalizedString }[] }`, en un módulo propio si crece. El beat post-Slot-4 usa `obj-diary-last.png`; sus líneas de texto (la entrada del maestro, en **해요체 cálido** — no 반말: el texto canónico usa 올 거예요 / 치세요 / 마세요, registro afectuoso-solemne) NO se vocalizan — solo la línea 11 del monje lleva voz. El runner de beats se reúsa para ambos y para futuros niveles.

### §12.5 Audio: el tañido y la lluvia por fases

- `sfx-bell-toll.ogg` se graba/edita con el 여음 completo (≥ 8 s); los tres golpes del final se encadenan dejando respirar la resonancia (~4 s entre golpes). El tañido lejano del beat 6 es el mismo asset con low-pass + reverb en runtime (Howler), no un archivo aparte.
- La muerte de la lluvia se sincroniza con los golpes: golpe 1 → crossfade `ambient-jongnu` → stem «hilos»; golpe 2 → stem «gotas»; golpe 3 → solo 여음 + `ambient-jongnu-clear`. Los 3 stems viven en `sfx-rain-stop.ogg` (o tres archivos cortos si pesa menos).

### §12.6 TTS sugerido

OpenAI TTS HD (proveedor por defecto del doc maestro, §10): una sola voz masculina, joven y serena para 우담, velocidad ligeramente lenta (~0.9×), las 29 líneas de §11 en una sesión para mantener consistencia. La letra del maestro y la tarjeta final no se graban. Coste estimado ≤ $0.50.

### §12.7 Flags de verificación (bloquean producción, no diseño)

- [ ] **Liturgia 28/33**: el dato de tañidos de 새벽/저녁 (28/33) NO entra en contenido testeado; antes de usarlo siquiera como curiosidad de Pista 1 o easter egg del 방명록, verificar con fuente budista. Marca canónica: «verificar antes de producción».
- [ ] **Orden de los 10 pasos del 49재 (hoja del Slot 2)**: el orden litúrgico horneado en `obj-ritual-sheet.png` («① 마당을 쓸어요 → … → ⑩ 종을 쳐요», ver §8.2) ES contenido jugable — las parejas 전에/후에 se testean sobre él — y afirma una secuencia ritual real de 49재 que ningún experto budista ha verificado. Aunque no son «números de tañidos», es liturgia afirmada en puzzle testeado: exactamente lo que vigila la regla editorial 7. Verificar la secuencia con fuente budista antes de producción; **si no se valida, reordenar a un set de tareas genérico (limpiar / abrir / preparar / ofrecer) que el par 전에/후에 siga haciendo deducible sin afirmar liturgia real.**
- [ ] **Legibilidad de la inscripción de la viga**: en `room-04-jongnu.png` (320×240) debe ser trazos sugeridos ILEGIBLES; el texto real solo en `obj-beam-inscription.png` con Neodgm ≥ 16 px. Revisar a zoom 1×.
- [ ] **La segunda sombra del farewellImage a 320×240**: un tono más oscuro que la sombra del monje, SIN outline, sin hotspot, sin mención. Verificar dos cosas a zoom 1×: que se distingue si la buscas (el ala del 삿갓 debe leerse) y que NO salta a la vista en la primera run. Es el regalo del roguelike: si grita, está mal.
- [ ] **Hanja 淸雨**: Neodgm no garantiza cobertura de hanja — la firma va horneada como arte en `obj-diary-last.png` y `obj-beam-inscription.png`, nunca como texto de fuente. Verificar que es la MISMA forma dibujada en ambos close-ups (el monje lo confirma en voz; el arte tiene que sostenerlo).
- [ ] **Honoríficos en líneas fijas (regla editorial 4) — DECISIÓN CERRADA, solo revisión de grabación**: las dos líneas fijas de 우담 sobre su maestro usan honorífico -시-, ya asentado (no queda nada «por decidir»):
  - Línea 11 (beat post-Slot-4): «…스승님이 보내신 것 같아요.» (NO «보낸») — la biblia escribe «보낸» en el cuerpo y «보내신» en la sección Voz; **este dossier resuelve la contradicción a favor de la honorífica «보내신», que es la grabada y la escrita en TODO el dossier.**
  - Línea 18 (beat post-Slot-5, la segunda taza): «스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요.» (NO «떠난 후에도») — la acción es del maestro (스승님이 떠나시다), así que la regla 4 obliga -시-: 떠나다 → 떠나시다 → 떠나신 후에.
  - Antes de grabar TTS, pasar una última revisión de honoríficos a las líneas 10, 11 y 18 para confirmar que las grabaciones coinciden con estas formas. Marcar como cerrado en el doc maestro.
- [ ] **El gato no cruza el 일주문**: coherencia en `cinematic-outro.png` — el gato se queda en el primer escalón, dentro del marco, mirando el punto vacío a la derecha del monje.

### §12.8 Estimación de producción del nivel 2

| Fase | Horas |
|---|---|
| Escritura de puzzles + revisión gramática | cubierto en este dossier |
| Arte (22 assets; pipeline del nivel 1 reusable: `tools/escape-room-level01` como base) | 20-30 h |
| Audio: TTS 29 líneas + 5 loops + 8 SFX + edición del 여음 | 6-9 h |
| Código: `softRejectTiles` (dominio) + `'soft-reject'` en el store + `scriptedBeats` + interpolación `{farewell}` + swaps de escena | 8-12 h |
| Integración + testing (validateLevel, soft-reject, beats, outro token) | 10-15 h |
| **Total nivel 2** | **~45-65 h** (dentro del rango 50-80 h previsto para niveles 2+ en el doc maestro) |
