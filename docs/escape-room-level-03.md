# 📜 NIVEL 3 — DOSSIER COMPLETO: «El mercado nocturno (달빛시장)»

> Dossier del Nivel 3 del escape room coreano. Documento maestro de diseño: historia, puzzles, arte, audio y producción.
> Creado 2026-06-23. Hermano de [escape-room.md](./escape-room.md) (doc maestro: pilares, sistema de pistas §5, fallo §6, los 3 tipos de puzzle §4) y de [escape-room-level-02.md](./escape-room-level-02.md) (cuyo formato y rigor espeja este documento). El remapeo de gramáticas que trae G021 (-지만) y G019 (-고) a este nivel se decidió en el dossier del nivel 2 (§5.2) y ya está aplicado en `escape-room.md` §11 — aquí no hay nada más que editar.

## §1 · Resumen

| Campo | Valor |
|---|---|
| Título | **El mercado nocturno (달빛시장)** — Moonlight Market |
| Nivel TOPIK | 2-3 (principiante alto → intermedio bajo) |
| Tono | **Energético / callejero**: neón, vapor, bullicio. El alivio cálido y a gritos tras la lluvia-duelo del Nivel 2. Profundidad por **calidez y familia encontrada**, NO por tristeza (NO misticismo, NO sobrenatural, NO doble capa) |
| Referencia tonal | La calidez de mercado de *Reply 1988* cruzada con la comedia de wingman de un buen episodio de *Hospital Playlist* |
| Gramáticas-tema | G038 (-아/어 보다), G039 (-아/어 주다), G053 (-보다 comparativo), G021 (-지만), G019 (-고) (+ G013 -았/었어요 como callback del clímax) |
| Cuartos | 4 zonas |
| Slots de puzzle | 6 |
| Puzzles escritos | 30 (6 × 5) |
| Imágenes pixel art | ~22 (presupuesto disciplinado, mismo techo que el nivel 2) |
| Duración por run | 12-15 min (urgencia diegética: el mercado cierra y sale el último bus en ~20 min) |
| Cosméticos | 4 (1 por tier) — set «달빛시장의 불빛» (Las luces del mercado de la luna) |
| Features de motor nuevas | **CERO** — reutiliza selection/completion/creation + `ScriptedBeat` (el giro) + `softReject` (Slot 6), todo embarcado en L2 |

---

## §2 · Historia

### Premisa

Eres un viajero anónimo (sin continuidad con los niveles anteriores — el jugador nuevo no necesita nada, el veterano no espera nada). Es tarde, casi noche, y tienes hambre y un último autobús que coger. Subes los escalones de cemento hacia 달빛시장 — el «mercado de la luz de la luna» — buscando solo un bocado rápido antes de irte: la promesa de un cartel de neón rosa y un olor a aceite caliente que sube por la escalera. Dentro, el mercado es una sola calle techada que zumba: vapor de las ollas, chisporroteo de las planchas, carteles de hangul encendidos uno encima de otro, el suelo brillante de tanto pasar. No vienes a quedarte. Vienes a comer y a bajar.

Te recibe **순자 이모** (Sun-ja, unos 60, dueña del puesto de 호떡 — la plancha dorada, el vapor, la única luz de verdad cálida de toda la calle). Te sirve un 호떡 recién hecho, te ve la cara de prisa, te pregunta por el autobús… y mientras contestas, con una sonrisa que no admite discusión, te «secuestra» la mochila y la mete bajo su mostrador: «Ayúdame a cerrar el puesto y te la devuelvo.» Es una mentira piadosa. No necesita ayuda para cerrar. Necesita un cómplice.

### Conflicto

La cerradura del nivel es **una persona y un reloj**, no un candado. La mochila está detrás de Sun-ja; el último autobús sale en veinte minutos del paradero al final de la calle; y entre tú y la salida hay una lista de «recados para cerrar el puesto» que Sun-ja te va dando, uno a uno, con un cariño autoritario que no deja hueco para decir que no. Cada recado es un favor — **-아/어 주세요** (G039): «도윤 좀 도와주세요», «하나한테 물어봐 주세요». La urgencia es real y mundana (el autobús, el mercado que baja las persianas en veinte minutos), y no hay nada más debajo: ninguna leyenda, ningún espíritu, ninguna segunda lectura. Este nivel no esconde — **desborda**. El ruido, el vapor y la prisa son toda la atmósfera que necesita.

Pero los recados no son lo que parecen. Slot a slot, lo que crees que es «cerrar el puesto» va encajando en otra cosa: averiguar qué le gusta a **하나** (la chica del puesto de al lado · **-아/어 보다**, G038: 물어보세요, 먹어 보세요), regatear y elegir un regalo en el callejón de baratijas (**-보다** + 더, G053: «이게 저것보다 좋아요»), defender al chico cuando alguien lo llama seco (**-지만**, G021: «무뚝뚝하지만 착해요»). Eres, sin haberlo decidido, el celestino de **도윤** (19 años, se va al **군대** mañana al amanecer, en ese mismo último autobús), un chico que quiere confesarse a 하나 antes de irse y que se acobarda cada vez que la tiene delante. Comedia de wingman: 도윤 huye, 하나 es mucho más lista de lo que él cree, y todo el mercado — el de los calcetines, la del 어묵, hasta el gato — está en el ajo.

### El caper

El nivel está armado como un plan con coartada cómica. En la **superficie**, ayudas a un chaval tímido a no irse al ejército sin haberse declarado: cada errand es un eslabón del plan de Sun-ja para empujar a 도윤 hacia 하나 antes del autobús de las seis de la mañana. Es ligero, ruidoso, divertido, lleno de favores que salen redondos a la primera. La gramática del nivel es la gramática de pedir y dar: toda la noche dices *hazme el favor de…*, *prueba a…*, *pregúntale a…* con una soltura que ni notas. Encadenas compras para el paquete del 군대 (**-고**, G019: «이거 사고 저거 사고…») como quien hace la lista de la compra. Todo fluye. Nada cuesta. Esa facilidad es la trampa que el nivel está tendiendo.

### El giro

A mitad de partida, resuelto el Slot 4 — justo después de que hayas defendido a 도윤 con un «무뚝뚝하지만 착해요», «es seco, pero buen chico» — salta el beat fijo (un `ScriptedBeat` idéntico en todos los runs, narrado con el mismo typewriter que la intro). Sun-ja, sin dramatismo, mientras raspa la plancha con la espátula, lo deja caer:

**도윤 no es su hijo de sangre.** Apareció en el mercado hace unos diez años, un crío con hambre, y se quedó porque ella nunca dejó de darle de comer. No hay apellido compartido, no hay papeles; hay diez años de 호떡 calientes empujados sobre un mostrador. Lo cuenta como quien comenta el tiempo, con las manos ocupadas, sin mirarte. Y entonces el plan entero se reordena: lo que de verdad necesita antes de que el chico se vaya — y lo que el orgulloso de 도윤 jamás diría si alguien se lo pidiera de frente — no es que se le declare a 하나. Es que se despida de **ella**. Que le dé las gracias. El romance era el envoltorio. El amor de verdad, el que el nivel ha estado preparando todo el rato a tus espaldas, es de familia encontrada. Cuando el chico por fin hable, las palabras valdrán doble: la confesión a la chica y, debajo, el adiós que nadie le pidió que dijera.

Anti-melodrama: el giro aterriza por lo bajo. No hay lágrimas descritas. Hay una espátula raspando hierro, un 호떡 que se infla, el ruido del mercado que sigue igual de alto alrededor de una mujer que acaba de decir la cosa más grande de la noche sin levantar la voz.

### Cierre

En el paradero, con el autobús ya en la esquina (Slot 6 · creación con fichas), hay que construir la despedida de 도윤. Y la **trampa temática** del nivel se cobra su pieza: las fichas distractoras decisivas deletrean un adiós-para-siempre — **잘 있어요**, **안녕히 계세요**, «quédate bien», «adiós» de los que no vuelven. La frase correcta es la del que sí vuelve: **다녀오겠습니다** — literalmente «voy y vuelvo», lo que dice un recluta, no un desertor — coronando un **그동안 고마웠어요**, «gracias por todo este tiempo». La primera vez que el jugador entrega el adiós-para-siempre, el motor hace `softReject` sin coste de corazón: 이모 (o el propio 도윤) corrige con suavidad — *no es un adiós; vuelve con el pelo corto* — y te deja recolocar las fichas. Reincidir ya es error normal. Es el espejo exacto de la trampa de presente del Nivel 2, jugada aquí en tono de fiesta.

Al acertar, 도윤 lo hace: va a por 하나 (o falla con dulzura, pero crece) y luego se vuelve hacia 이모. «**그동안 고마웠어요. 다녀오겠습니다.**» Sun-ja no se deshace; le aprieta un 호떡 caliente en la mano para el viaje — «vuelve con el pelo corto, que te guardo el sitio» — y, casi de pasada, te devuelve la mochila. El secuestro siempre fue una excusa para tenerte de testigo.

**farewellImage (plano final congelado):** el último autobús arrancando bajo el neón; la silueta recién rapada de 도윤 en la ventanilla; en el andén, 순자 이모 y 하나 una al lado de la otra, despidiéndose con la mano; la plancha de 호떡 todavía echando vapor; los carteles del mercado reflejados del revés en el asfalto mojado. Sin muerte, sin pérdida: todos vivos, el regreso prometido. Luego, ya sobre el negro, una línea de eco que devuelve el calor de la noche.

### Tema

**Te pasaste la noche entera haciendo favores — *-아/어 주세요* — con una facilidad que no te costó nada; y la frase más difícil de todas resultó ser un simple gracias en pasado: 그동안 고마웠어요.** Pedir y dar es fácil; el idioma te lo regala. Agradecer lo vivido, conjugar en pasado el cariño de diez años, eso es lo que no sale solo. El nivel no construye ninguna metáfora: el coreano ya traía el nudo puesto. Es la rima cálida del Nivel 2, cuya llave era **그동안 감사했어요** — misma forma exacta, registro opuesto: allí un duelo sereno bajo la lluvia, aquí una gratitud a gritos bajo el neón.

### Por qué funciona como Nivel 3

- **Contraste deliberado con los dos niveles anteriores, eje por eje:**

  | Eje | Nivel 1 · *El minbak* | Nivel 2 · *El templo de la lluvia* | **Nivel 3 · *El mercado nocturno*** |
  |---|---|---|---|
  | Temperatura emocional | abrazo tranquilo de la mañana | duelo sereno, lluvia que no para | **calor colectivo a gritos, neón y vapor** |
  | Quién te cuida | una halmeoni ausente, por notas | un monje presente, por diálogo | **una ajumma que te secuestra para tenerte de cómplice** |
  | Atmósfera | silencio doméstico, luz dorada | quietud, gris-azul, una sola brasa | **ruido, prisa, veinte carteles encendidos a la vez** |
  | Forma del amor | hospitalidad de quien hospeda | el adiós que no se pudo decir | **familia encontrada: el crío con hambre que se quedó** |
  | El device del nivel | notas que completar | dos capas / deniabilidad mística | **ninguno — el nivel desborda, no esconde** |
  | Qué promete el final | «hasta mañana» (te espera el café) | «비는 또 와요, 그때 또 오세요» (vuelve cuando llueva) | **«다녀오겠습니다» — el autobús que promete regreso** |

- **La alegría es el material, no el descanso entre dramas.** El Nivel 2 pedía entender una pérdida; el 3 pide reconocer un cariño que estaba a plena vista todo el tiempo. La profundidad aquí no se gana con tristeza sino con **calidez** — y por eso necesita su propio nivel: demostrar que el escape room sabe hacer reír y emocionar sin un solo muerto, con el mercado más ruidoso del mundo como escenario.

- **El salto gramatical es el salto dramático.** TOPIK 2-3 es, sobre todo, aprender a *interactuar*: pedir favores, probar, comparar, matizar con peros, encadenar. Toda esa gramática es transaccional, social, de mercado — y el nivel la convierte en su acción literal (cada recado ES una conjugación de favor). Y luego le da la vuelta: la frase que de verdad importa no es ninguna de las transaccionales fáciles, sino el pasado del cariño (G013, ya aprendido en L2), reaparecido como llave del clímax. El nivel enseña a pedir con soltura y a recordar que lo más difícil de decir es lo más sencillo de conjugar.

- **Escala sin tocar el motor — y es un argumento de venta.** Seis slots, los mismos tres tipos de puzzle (selección · completar · creación), cuatro zonas, el `ScriptedBeat` del giro y el `softReject` del Slot 6. **Todo eso ya existe en el motor desde el Nivel 2.** El Nivel 3 no pide **ni una sola** característica nueva de engine: es contenido puro sobre una máquina madura. La trampa de las fichas «adiós-para-siempre» reutiliza exactamente el mismo mecanismo de rechazo suave que la trampa de presente del Nivel 2, sin una línea de código nueva.

- **Rejugabilidad con alma.** El sorteo es diegético (el mercado es plural por naturaleza: cinco recados, cinco gustos de 하나, cinco baratijas, cinco peros, cinco listas, cinco despedidas) y ningún beat aguas abajo depende del candidato que salga. La estructura familiar de las cuatro zonas se aprende rápido; lo que cambia cada noche es qué te pide Sun-ja — y volver al mercado deja de ser un castigo para volverse, como en L2, **una visita**.

---

## §3 · Textos narrativos completos

> Listos para el seed (`munbeop/app/seed/escape-room/level-03.ts`). Párrafos separados con `\n\n`, render con typewriter. El coreano citado es canónico: no se retoca sin pasar por este dossier. **Diferencia de registro con el nivel 2:** aquí el coreano es CALLEJERO y cálido (mucho 해요체 rápido, vocativos 도윤아 / 이모, interjecciones de mercado 자자, 아이고), no la prosa litúrgica del templo. Hay UNA sola capa: lo que se dice es lo que pasa. Nada de `-는 것 같다` defensivo, nada de homofonías sin explicar — el nivel 3 no esconde, **calienta**.

### Tagline (hook de libreta)

> ⚙️ Valor BLOQUEADO en `registry.ts` → `LEVEL_REGISTRY['level-03'].tagline` (líneas 67-69). Render en la libreta. **No se edita sin justificar el cambio del valor bloqueado.** Honra la escena canónica (neón + vapor + mochila secuestrada) y NO filtra el giro (la familia encontrada es sorpresa de medio juego: la portada vende comedia de celestino, no found-family). La entrada de `registry.ts` ya redacta esta idea en su voz («…una ajumma te retiene la mochila…»); la versión narrativa de abajo es la voz de libreta, equivalente y no contradictoria.

> Subiste al mercado a comer algo antes del último autobús. La señora del puesto de 호떡 te quitó la mochila, sonrió y dijo: «ayúdame a cerrar y te la devuelvo».

### Intro (5 párrafos, typewriter)

> El último autobús sale en veinte minutos y tú solo querías una cosa caliente para el camino. Subes los tres escalones de hierro hacia 달빛시장 y el frío de la calle se queda atrás de golpe: dentro es todo vapor, aceite y luz. Los letreros de neón —rojo, verde menta, un rosa que parpadea— se reflejan partidos en el asfalto mojado. Huele a sésamo tostado, a caldo, a azúcar quemándose en una plancha. En alguna parte una radio vieja escupe un trot de los ochenta y nadie la apaga.

> Sigues la nariz hasta una plancha dorada donde una mujer de unos sesenta años —delantal, manos rápidas, una sonrisa que llega antes que las palabras— voltea 호떡 con dos dedos y un palillo. «어서 와요!», te grita por encima del chisporroteo, como si te esperara desde hace rato. Le pides uno. Ella te lo está preparando ya, antes de que termines la frase.

> Y entonces, sin dejar de sonreír, te quita la mochila del hombro con la naturalidad de quien te quita una pelusa de la chaqueta. La cuelga de un gancho detrás de la plancha, junto a los cucharones. «잠깐만 빌릴게요», dice —*te la tomo prestada un momentito*—. «우리 가게 문 닫는 거 좀 도와줘요. 그럼 돌려줄게요.» Ayúdame a cerrar el puesto y te la devuelvo. No es una amenaza: es una invitación con rehén. Te llaman 이모 todos los del mercado, así que tú también, ya, eres de la familia.

> Veinte minutos. El mercado entero baja la persiana en veinte minutos y tu autobús sale a la vez. 이모 te pone un 호떡 calentísimo en la mano «para el camino» y empieza a darte recados como quien reparte cartas: lleva esto, pregunta aquello, regatea aquello otro. Dos puestos más allá, un chico flaco de diecinueve años —도윤— finge estar muy ocupado limpiando una bandeja que ya está limpia, lanzando miraditas hacia el puesto de enfrente. En el puesto de enfrente, 하나 corta cebolleta sin levantar la vista, y sonríe sola.

> Vas a pasar los próximos veinte minutos haciendo favores —trae, prueba, pregunta, regatea— en el coreano más fácil del mundo: *-아/어 주세요*, por favor, hazme el favor. Lo que todavía no sabes es que cada recado es una pieza de un plan, que el plan no es el que parece, y que la frase más difícil de toda la noche no llevará ninguna fórmula de cortesía: será solo un gracias, en pasado, dicho a la persona correcta antes de que el autobús arranque.

### Beat fijo · EL GIRO (ScriptedBeat, después del Slot 4)

> ⚙️ `ScriptedBeat` con `afterSlotId: 'slot-4'`. `voiceLine` = la línea KO de 이모 (se muestra sobre la narrativa y se graba como TTS). `narrative` = los párrafos en ES (`\n\n`). Idéntico en todos los runs — NO es contenido de pool. Render con el typewriter de la intro. **Regla de tono (anti-melodrama):** el giro lo cuenta 이모 sin dramatismo, con las manos ocupadas en la plancha; se describen el aceite, la masa, el vapor — nunca lágrimas. 해요체 cálido, ≤4 frases KO.

**`voiceLine` (KO canónico, ≤4 frases):**

> 도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요. 그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요.

**`narrative` (ES, párrafos `\n\n`):**

> 이모 ha bajado la voz, pero no ha dejado de trabajar. Echa un cucharón de masa en la plancha, lo aplasta con el dorso del cucharón, y mientras el azúcar de dentro empieza a sisear te cuenta, casi distraída, lo que el chico no sabe que tú vas a oír: 도윤 no es su hijo de sangre. Hace diez años apareció en el mercado un crío hambriento, sin nada. Ella le dio de comer. Al día siguiente volvió, y ella le volvió a dar de comer. Y así, un plato detrás de otro, sin que nadie firmara nada, el crío se quedó y se volvió su hijo.

> Por eso, dice, lo de 하나 está bien —ojalá el chico se atreva, ojalá—. Pero no es lo que de verdad le aprieta el pecho esta noche. A 도윤 lo mandan al ejército al amanecer, y es orgulloso, y de los que se van con la mano levantada y un «ya nos vemos» como si nada. Lo que ella necesita, y lo que él jamás diría si alguien se lo pidiera de frente, es mucho más pequeño y mucho más difícil que una declaración de amor: que el chico se dé la vuelta, antes de subir al autobús, y le diga gracias a ella.

> Voltea el 호떡. Queda perfecto, dorado, redondo. «그러니까», añade, y por primera vez en toda la noche no sonríe del todo, «오늘 밤에는… 네가 좀 도와줘요.» *Por eso, esta noche, ayúdame tú también.* El plan del enamorado era la envoltura. El relleno, lo que de verdad quema, era esto.

### Outro (cinemática de salida — 6 beats, en este orden)

> ⚙️ El beat 1 **cita textualmente** la despedida que el jugador construyó con fichas en el Slot 6: el motor interpola el candidato del run en el marcador `{farewell}` (mismo soporte de plantilla que el nivel 2). El token se escribe `{farewell}` (llave simple) en TODAS las apariciones (§3, §7, §12). La línea canónica que arma el jugador es **«그동안 고마웠어요. 다녀오겠습니다.»** — un gracias en pasado + un «me voy y vuelvo», NO un adiós para siempre.

> El mercado ya baja las persianas, una tras otra, con ese estruendo de metal que es el sonido de cerrar el día. 도윤 está plantado delante de 하나 con las orejas rojas y la bandeja todavía en la mano. Lo suelta de golpe, sin respirar —prueba, falla un poco, se ríe de sí mismo, y lo vuelve a decir mejor—; 하나, que era más lista que él desde el principio, ya lo sabía, y le guarda un sitio en su número de teléfono. Pero el chico no ha terminado. Se gira hacia la plancha, hacia 이모, y dice la frase que tú armaste pieza a pieza: «{farewell}». Y la frase pesa el doble, porque no es para la chica: es para la mujer que llevaba diez años dándole de comer.

> 이모 no llora —tiene las manos demasiado ocupadas para llorar—. Coge un 호떡 recién hecho de la plancha, el más dorado, lo envuelve en una servilleta de papel a toda prisa y se lo aplasta en la mano al chico, todavía quemando. «버스에서 먹어. 식기 전에.» *Cómetelo en el autobús. Antes de que se enfríe.* Es lo único que se le ocurre hacer con las manos para no hacer otra cosa.

> Entonces se acuerda de ti. Descuelga tu mochila del gancho de detrás de la plancha, le sacude una mota imaginaria, y te la devuelve con las dos manos, como si fuera ella la que te debe algo. «고마워요. 진짜 도와줬어요.» *Gracias. De verdad me ayudaste.* Y a 도윤, que ya sube al estribo: «야, 머리 짧게 깎고 와. 자리 빼놓을게.» *Oye —vuelve con el pelo corto. Te guardo el sitio.*

> El último autobús arranca con un suspiro de aire comprimido y se despega del bordillo. Por la ventanilla se ve la silueta del chico recién rapado, una mancha de luz de neón cruzándole la cara. En el andén, 이모 y 하나 de pie, hombro con hombro, levantan la mano. La plancha de 호떡 sigue echando vapor sola detrás de ellas. Los letreros del mercado se quedan flotando, partidos, en el asfalto mojado. Te quedas mirando un momento más de lo necesario. *(→ aquí congela el plano final / `farewellImage`.)*

> El autobús dobla la esquina y el mercado desaparece. Te das cuenta de que sigues con el 호떡 caliente en la mano, el que 이모 te puso «para el camino» hace veinte minutos y nunca te comiste. Todavía quema un poco. Le das el primer mordisco. Sabe a sésamo, a azúcar y a una casa que no es la tuya pero que, durante veinte minutos, te dejaron ayudar a cerrar.

### farewellImage — spec del plano final (congelado)

- **Encuadre:** plano medio-largo desde el andén, a la altura de la calle, mirando el costado del autobús que ya se separa del bordillo. Composición en dos mitades: a la derecha el autobús en movimiento; a la izquierda, en tierra, las dos figuras pequeñas que despiden.
- **En el autobús (derecha, pequeño pero nítido):** en la ventanilla iluminada, la silueta de 도윤 con la cabeza recién rapada (perfil inconfundible, pelo casi a cero); una franja de neón rosa-verde le cruza la cara reflejada en el cristal. Una mano contra el vidrio, a medio levantar.
- **En el andén (izquierda, las dos figuras que despiden):** 이모 (delantal, baja, redonda) y 하나 (más alta, delgada) de pie hombro con hombro, **las dos con un brazo levantado**. Pequeñas contra la mole del autobús: el plano es de ellas quedándose, no del que se va.
- **El puesto, al fondo izquierda:** la plancha de 호떡 **sigue encendida y echando un hilo de vapor de 1px**, sola, sin nadie que la atienda — el calor que sigue ahí para cuando él vuelva. Detalle canónico, no decorativo: es el «te guardo el sitio» hecho imagen.
- **Neón espejado:** todo el primer plano inferior es asfalto mojado que devuelve los letreros del mercado partidos y temblando —rojo, verde menta, el rosa que parpadea—; es el equivalente cálido y ruidoso al «espejo encendido» del nivel 2, pero aquí el espejo es de neón, no de oro de templo.
- **Regla de tono (contraste explícito con el nivel 2):** NINGÚN elemento oculto, NINGUNA segunda sombra, NINGÚN easter egg que premie la segunda run. El nivel 3 no esconde nada en el plano final: lo que ves es una despedida con reunión prometida, a plena luz de neón. Lo que hay que «descubrir» en la segunda run ya lo viste — que el 호떡 que llevas en la mano fue siempre el de ella.

### Voice lines (KO canónico)

| Campo | Línea |
|---|---|
| `voiceIntro` | 어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요. |
| `voiceOutro` | 고마워요. 진짜 도와줬어요. 야 도윤아, 머리 짧게 깎고 와. 자리 빼놓을게! |
| Línea-tesis callejera (Slot 1, al colgar la mochila; **no** se repite al final) | 잠깐만 빌릴게요. 도윤이 좀 도와줘요. |

### Tarjeta final + última narración

- **Tarjeta final (sobre el fade):** «제일 어려운 말은 제일 따뜻한 말이었어요.» — *La frase más difícil resultó ser la más cálida.*
- **Última narración (ya en negro):** «En el mercado dicen que a quien ayuda a cerrar el puesto, 이모 nunca lo deja irse con hambre. La próxima vez que pases por 달빛시장 —ya sabes a quién pedirle un 호떡.»
- ⚙️ Si el motor no tiene campo dedicado para tarjeta/narración final, viven como los dos últimos párrafos del `outro` (mismo recorte que el nivel 2 documentó para §12).

---

## §4 · Reglas editoriales del nivel (checklist auditable)

Quien escriba CUALQUIER texto nuevo del nivel — puzzles, flavor, pistas, beats, tooltips — audita contra estas 7 reglas antes de integrar. Los críticos revisarán contra esta lista, punto por punto. Este nivel es el **alivio cálido** tras la lluvia del Nivel 2: la vara editorial es la misma (giro real, despedida explícita, imagen final, eco), pero el registro se invierte — aquí la profundidad es **alegría y familia encontrada**, no duelo.

1. **☑ Tono = calidez enérgica, anti-melodrama.** El nivel es ruido, vapor, neón y bullicio; la comedia de celestino lo empuja. El giro (도윤 no es hijo de sangre) aterriza por **understatement**: se describen manos, comida y luz — el 호떡 caliente que ella le mete en la mano, el griddle dorado, el neón en el asfalto mojado — NUNCA lágrimas. La emoción la carga 그동안 고마웠어요 dicho bajito, no un primer plano de llanto. *Audit: si un texto nombra llanto, lágrimas o sentimentalismo explícito de 이모/도윤, falla. Si el giro se «explica» en vez de mostrarse en gestos/objetos, falla.*

2. **☑ Esto NO es el Nivel 2.** Prohibido importar el aparato del templo: **sin misticismo, sin sobrenatural, sin sistema de doble capa / deniabilidad** (las señales liminales en `-는 것 같다`, la firma homófona, la segunda sombra — todo eso fue el dispositivo de L2 y aquí no se copia). El mercado es 100% mundano: cada cosa rara tiene una causa callejera obvia y dicha en voz alta (el puesto cierra, el bus es el último, 도윤 se va al 군대). No hay segunda lectura que sobreviva en silencio: lo que pasa, pasa. *Audit: grep de cualquier señal sin explicar, cualquier `같다` usado como «coartada liminal», cualquier eco de profecía/fantasma. Una sola = falla.*

3. **☑ Sin metalenguaje gramatical fuera de la Pista 2.** Ningún personaje, narración ni Pista 1 dice «pasado», «comparativo», «partícula», «-아/어 주다» ni códigos G###. La corrección diegética del Slot 6 es la voz de 이모/도윤 («아니야, 영영 가는 거 아니야 — 다녀오겠습니다라고 해»), no una regla. Los términos gramaticales viven SOLO en la Pista 2 (premium). *Audit: grep de términos gramaticales y G-codes en diálogos, narración, flavor y Pista 1.*

4. **☑ Honoríficos por relación, contenido testeado en 해요체 limpio.** 도윤 (19) y 하나 son jóvenes: entre ellos el 반말/해요 es lo natural en el flavor y en las voces NPC (banter de mercado). Pero **todo lo que el jugador escribe, ordena o elige va en 해요체 limpio y testeable** — sin 반말 ni honorífico alto dentro de respuestas, tiles o huecos. La excepción es de personaje, no de puzzle: 도윤 → 이모 usa formas respetuosas (그동안 고마웠어요, 다녀오겠습니다), y esas formas correctas son contenido fijo del clímax, glosadas si hace falta. *Audit: ninguna forma 반말 ni honorífica dentro de contenido testeado; verificar que el respeto 도윤→이모 vive solo en líneas fijas, no en opciones evaluadas.*

5. **☑ Randomización diegética = el cierre del mercado.** Donde L2 usaba la lluvia/humedad como sorteadora («비가 또 한 글자를 지웠어요»), aquí es **el mercado cerrando contra el último bus**: cada run cambia un ítem (qué recuerda/quiere 하나, qué puesto baja la persiana primero, qué va en el paquete del 군대, qué chollo queda en el 만물상). Los pools son plurales por naturaleza: 5 favores, 5 gustos, 5 regateos, 5 cierres de «무뚝뚝하지만 …», 5 listas, 5 despedidas. Ningún beat fijo aguas abajo (el giro post-Slot-4, el clímax) depende del candidato sorteado. *Audit: tomar cada beat fijo y verificar que funciona con los 5 candidatos de cada slot anterior; el «motor de azar» se nombra como prisa de cierre, nunca como clima ni señal.*

6. **☑ El distractor temático = adiós-para-siempre vs «vuelvo».** El error que el nivel enseña a NO cometer es despedirse como si fuera definitivo. En el Slot 6 (creación), las fichas distractoras decisivas arman un goodbye-forever (잘 있어요 / 안녕히 계세요); la línea correcta es la de reencuentro prometido: 다녀오겠습니다 + 그동안 고마웠어요. La **primera** submission con esas fichas dispara `softReject` (sin coste de corazón): 이모/도윤 corrige con ternura — no es un adiós. Reincidir = error normal. (Espejo en clave alegre de la trampa de presente de L2: misma mecánica de motor ya existente, registro opuesto.) *Audit: el Slot 6 incluye en `softRejectTiles` las fichas de adiós-definitivo, disjuntas de `correctOrder`; el `softRejectMessage` corrige sin metalenguaje (regla 3) y sin melodrama (regla 1).*

7. **☑ Carga lectora acotada.** Intro ≤5 párrafos; notas/beats de ≤4 frases KO; diálogo fijo por zona ≤4 líneas. El giro (familia encontrada) debe sobrevivir a un lector TOPIK 2-3 leyendo rápido entre el ruido. *Audit: contar. Sin excepciones «porque quedaba con ritmo».*

---

## §5 · Gramáticas del nivel

La gramática de TOPIK 2-3 es transaccional y de mercado: pedir favores, probar, comparar, matizar, encadenar. El nivel la convierte en su acción literal (cada recado ES una conjugación) y luego la trasciende: la llave del clímax no es ninguna de las fáciles, sino el pasado del cariño (G013, ya enseñado en L2), reaparecido como la frase más difícil de la noche.

| Código | Gramática | Cómo aparece (slot por slot) |
|---|---|---|
| G039 | -아/어 주다 — hacer un favor (-아/어 주세요 = por favor…) | **CORAZÓN del nivel.** Slot 1 (foco — aceptar el primer recado). Reaparece en el flavor de toda la noche y, vuelto del revés, en el Slot 6 (se AGRADECE el favor ya hecho: 키워 주셔서 / 밥 챙겨 줘서). |
| G038 | -아/어 보다 — probar / preguntar / asomarse a ver | Slot 2 (foco — averiguar qué le gusta a 하나: 물어보세요, 먹어 보세요, 가 보세요). |
| G053 | -보다 — comparativo «más que», a menudo + 더 | Slot 3 (foco — regatear y elegir el regalo: «이게 저것보다 좋아요»). |
| G021 | -지만 — pero / aunque | Slot 4 (foco — defender a 도윤: «무뚝뚝하지만 착해요»). Esa frase con -지만 es la grieta por donde entra el giro. |
| G019 | -고 — y / luego (el tiempo va solo en la última cláusula) | Slot 5 (foco — la lista del paquete del 군대: «이거 사고 저거 사고 챙겼어요»). |
| G013 | -았/었어요 — pasado polite | **CALLBACK del clímax**, ya enseñado en L2. Slot 6: la despedida solo «sale bien» si el gracias va en pasado (그동안 고마웠어요), no en presente (고마워요). No es el foco NUEVO del nivel — es la llave que el jugador ya tiene y que el nivel le hace usar cuando más pesa. |

Las definiciones canónicas de cada código viven en el seed de gramáticas de la plataforma (`grammars-n1.ts` para G013/G019/G021, `grammars-n2.ts` para G038/G039/G053; ids confirmados en `topik-spine.json`); este nivel las referencia por id igual que los niveles 1 y 2 (`grammarCodes` del `Level`).

> **Remapeo del roadmap — nada que editar.** La llegada de G021 (-지만) y G019 (-고) a este nivel se **decidió en el dossier del Nivel 2 (§5.2)** y ya está aplicada en la tabla de §11 de `docs/escape-room.md` (fila 3: «-아/어 보다, -아/어 주다, comparativos, **G021 (-지만), G019 (-고)**»). Este dossier no requiere ninguna edición adicional del doc maestro.

---

## §6 · Cuartos / Escenas

Cuatro zonas, seis slots. El orden de zonas es lineal (1→2→3→4) con dos revisitas obligadas: la zona 1 (호떡) se vuelve a visitar para el Slot 5, y la zona 4 cierra el nivel con el Slot 6. La zona 3 (만물상) aloja DOS slots seguidos (3 y 4), como el 대웅전 del nivel 2. Resolución base: 320×240, paleta de mercado nocturno: **frío neón fuera** (asfalto mojado azul-violeta, carteles de neón rosa/cian/verde como halos, vapor gris-azul de las alcantarillas) contra el **ámbar de plancha dentro** (cada puesto es una isla de luz cálida; el 호떡 de 순자 이모 es la más caliente). Donde el nivel 2 era lluvia y penumbra, el 3 es contraste duro y saturado: neón mojado vs. brasa de aceite. **Regla de arte transversal (heredada del nivel 2):** ningún texto coreano legible dentro de la escena 320×240 — todo lo que se lee vive en close-ups de 128×128 (Neodgm ≥ 16px) o en la UI. Los carteles de neón del mercado son trazos de hangul *sugeridos* (glow sin glifo legible), nunca palabras descifrables.

**Reloj diegético del nivel (estado transversal):** el mercado cierra en ~20 min y sale el último bus. El paso del tiempo se renderiza como **persianas a medio bajar** (셔터) que descienden un palmo en cada zona conforme avanza el run, puestos vecinos que apagan su neón (un halo menos en el fondo por zona resuelta), y el vapor de las planchas afinándose. NO hay temporizador numérico en escena (la urgencia es `epicTimeThresholdSeconds`, no un reloj en pantalla). Arte entrega cada zona con 2 estados de persiana (alta / a medio bajar) reutilizando el mismo fondo.

---

#### Zona 1 · 호떡집 (puesto de 순자 이모 — hub)

**Layout visual (320×240) — estado A «mercado abierto»:** El puesto-isla más cálido del nivel, encuadrado de frente bajo un toldo a rayas descolorido. Centro: la **plancha de hierro** (철판) redonda y reluciente, dos 호떡 dorándose con su burbuja de azúcar derretida, una espátula plana apoyada en el borde; de la plancha sube una columna de vapor ámbar (animable, overlay de 2 frames) que es la única fuente de luz cálida de la escena y tiñe de oro la cara de quien esté delante. 순자 이모 (≈60, delantal manchado, pañuelo en la cabeza, manos siempre ocupadas) de pie tras la plancha, centro-derecha. Colgando del toldo: una **bombilla desnuda** que se balancea apenas y una ristra de bolsas de papel. Primer plano inferior-izquierda: **tu mochila**, ya «secuestrada», metida bajo el mostrador entre cajas de masa y un cubo de azúcar — visible, a tu alcance pero detrás de ella. Fondo: el callejón del mercado en fuga, neones rosa y cian reflejados en el asfalto negro mojado, siluetas de clientes pasando como sombras. Tercio derecho del fondo: se intuye el siguiente puesto. Paleta: ámbar plancha + dorado masa al frente; azul-violeta neón + negro asfalto al fondo.

**Estado B «empezando a cerrar» (swap al revisitar para el Slot 5):** mismas coordenadas; la persiana metálica del puesto vecino baja a medias, dos neones del fondo apagados (menos halos), el vapor de la plancha más fino, una caja de cartón ya plegada sobre el mostrador. La plancha sigue encendida — 이모 no apaga lo último.

**Interactivos:**
- 🟡 순자 이모 (figura tras la plancha, rect ≈ [150, 90, 55, 80]) → **SLOT 1** (selección · G039). *(El rect se ciñe a la figura de 이모, NO a toda la plancha ni al mostrador, para que la mochila y la plancha cosméticas queden fuera del trigger — ver nota de hotspots.)*
- 🟡 순자 이모 (MISMA figura, mismo rect, **se reactiva** al revisitar la zona tras el beat del giro) → **SLOT 5** (selección · G019) — montar la lista del paquete para el 군대. El motor dispara el slot pendiente según el progreso del run; el rect no cambia.
- ⚪ La plancha / 호떡 (≈ [120, 130, 50, 35]) — close-up `obj-hotteok.png`: el azúcar derretido burbujeando. Texto: `설탕이 녹아요. 조심하세요.`
- ⚪ Tu mochila bajo el mostrador (≈ [25, 165, 45, 40], **fuera del rect del Slot 1**) — close-up `obj-backpack.png`. Texto: `이모가 내 가방을 안 줘요.` *(Sembrado para el outro, cuando 이모 te la devuelve: «이제 가방 받으세요.»)*
- ⚪ Bombilla del toldo (≈ [195, 35, 22, 28]) — al click se balancea (sprite 2 frames) y el SFX del mercado sube un instante. Texto: `시장이 시끄러워요.`

> **Nota de hotspots (Zona 1):** los Slots 1 y 5 comparten deliberadamente el rect de la figura de 이모 `[150, 90, 55, 80]`; nunca están activos a la vez (el Slot 5 solo se arma tras el giro), así que no hay solape simultáneo. Los cosméticos (mochila, plancha, bombilla) quedan enteramente fuera de ese rectángulo. El motor del nivel 1 no define prioridad entre hotspots solapados → verificar al integrar que ningún cosmético de la zona cae dentro del rect del trigger de 이모.

**Beat narrativo:** Subes al mercado por un 호떡 antes del último bus. 순자 이모 te lo prepara, ríe, y con un gesto rapidísimo mete tu mochila bajo el mostrador: «Ayúdame a cerrar y te la devuelvo.» Es una mentira piadosa — necesita un cómplice. El primer encargo (Slot 1) es ayudar a 도윤, el chico del puesto: «도윤 좀 도와주세요.» Al acertar, la primera complicidad: 이모 te guiña un ojo y baja la voz, como quien mete a alguien en un plan. *(Revisita post-giro → Slot 5: ahora el encargo es el paquete del 군대; el tono ya no es travesura, es ternura disfrazada de lista de la compra.)*

---

#### Zona 2 · 먹자골목 (callejón de la comida — puesto de 하나)

**Layout visual (320×240):** El callejón más ruidoso y abigarrado, visto en ligera diagonal para dar fondo de fuga. Centro-izquierda: el **puesto de 하나** (≈19, coleta, mandil, energía rápida) — una barra de 분식 con sartenes humeantes: 떡볶이 rojo borboteando (el rojo más saturado de la escena), 어묵 en su caldo con palillos clavados, un montón de 김밥 en bandeja. Vapor blanco-cálido subiendo en dos columnas. 하나 tras la barra, centro-izquierda, sirviendo. Sobre la barra, colgada del techo del puesto: una **carta-cartel** de neón con trazos de hangul sugeridos (ilegible a propósito; el menú legible vive en close-up). Derecha y fondo: más puestos en fuga, neones cian y verde, una moto de reparto aparcada, cajas apiladas. Suelo de asfalto con charcos que devuelven el rojo del 떡볶이 y el verde del neón. Primer plano inferior: taburetes de plástico naranja vacíos. Paleta: rojo 떡볶이 + blanco vapor al frente; cian/verde neón + negro charco al fondo.

**Interactivos:**
- 🟡 하나 / la barra de 분식 (centro-izquierda, rect ≈ [70, 100, 60, 70]) → **SLOT 2** (completar · input verbatim · G038) — averiguar qué le gusta a 하나. Frame de 이모/도윤 antes del puzzle: hay que **preguntar** o **probar** (물어보세요 / 먹어 보세요), no adivinar.
- ⚪ Olla de 떡볶이 (≈ [95, 135, 35, 28]) — close-up `obj-tteokbokki.png`. Texto: `매워 보여요.`
- ⚪ 어묵 en el caldo (≈ [135, 140, 28, 25]) — close-up `obj-eomuk.png`. Texto: `국물이 뜨거워요.`
- ⚪ Taburetes naranjas vacíos (≈ [20, 185, 50, 30]) — texto: `여기 앉아서 먹어요.`

> **Nota de hotspots (Zona 2):** el rect del Slot 2 se ciñe a 하나 + su barra `[70, 100, 60, 70]`; los cosméticos de comida `[95, 135, …]` y `[135, 140, …]` quedan justo por debajo, fuera del trigger. Verificar al integrar que ninguno solapa el rect del slot.

**Beat narrativo:** Para que 도윤 le lleve algo a 하나, primero hay que saber qué le gusta — y 도윤, claro, no se atreve a preguntar. Lo haces tú: el slot es **preguntar/probar** (G038), un acto diegético, no un examen. 하나 resulta más rápida y más lista de lo que el chico cree; suelta una pista entre cucharón y cucharón. Al acertar, descubres lo que quiere — y de paso intuyes que ella ya sabe perfectamente para quién es la pregunta. Comedia de complicidad, no de engaño.

---

#### Zona 3 · 만물상 골목 (callejón del bazar — DOS slots: 3 y 4)

**Layout visual (320×240):** El rincón más cargado y más íntimo del nivel — un 만물상 (bazar de mil cosas) bajo una sola bombilla amarilla parpadeante. Pared de fondo cubierta de mercancía colgada de ganchos: paraguas, calcetines en racimo, guantes, llaveros, peines, un reloj barato — siluetas densas, ninguna etiqueta legible. Centro: **mostrador-vitrina** atestado con dos grupos de objetos enfrentados que el regateo comparará (a la izquierda algo más caro y vistoso; a la derecha algo más humilde) — la comparación se *muestra* con tamaño/brillo, no con precios escritos. A la derecha del mostrador, el **vendedor del bazar** (figura secundaria, sin nombre, gorra) sentado en un taburete. Fondo derecho, en penumbra cálida: cajas y un perchero del que cuelga lo que será el regalo. Menos neón que las otras zonas: aquí domina el amarillo sucio de la bombilla; el frío del callejón se cuela solo por el borde izquierdo del encuadre. Paleta: amarillo bombilla + marrones cartón al centro; azul-violeta neón filtrándose por la izquierda.

**Estado B «regalo elegido» (swap EN PANTALLA al resolver el Slot 3):** mismas coordenadas; el objeto escogido pasa al primer plano del mostrador envuelto en una bolsa de papel, los dos grupos comparados se simplifican (el descartado vuelve al gancho). El altar de mercancía sigue igual; cambia solo el foco del mostrador.

**Interactivos:**
- 🟡 Mostrador-vitrina / los dos grupos enfrentados (centro, rect ≈ [110, 110, 70, 55]) → **SLOT 3** (selección · G053) — regatear / elegir el regalo («이게 저것보다 좋아요»).
- 🟡 El regalo ya elegido sobre el mostrador (centro-frente, rect ≈ [125, 150, 45, 35]; **se activa tras resolver el Slot 3**) → **SLOT 4** (completar · input verbatim · G021) — describir a 도윤 mientras lo envuelves: «도윤은 무뚝뚝하지만 …». **El giro (ScriptedBeat) dispara DESPUÉS de resolver este slot** (ver §7). El rect del Slot 4 nace dentro del estado B, sobre el objeto envuelto, sin solapar el del Slot 3 (que apunta a los grupos enfrentados, más arriba).
- ⚪ Mercancía colgada de los ganchos (pared de fondo, ≈ [20, 30, 90, 50]) — texto: `없는 게 없어요.` *(modismo de 만물상: «no falta de nada».)*
- ⚪ El vendedor del bazar (≈ [235, 120, 35, 55]) — texto: `주인이 졸고 있어요.`
- ⚪ Bombilla parpadeante (≈ [150, 25, 20, 24]) — al click parpadea (sprite 2 frames). Texto: `불이 깜빡깜빡해요.`

> **Nota de hotspots (Zona 3):** los Slots 3 y 4 nunca están activos a la vez (el 4 solo se arma tras resolver el 3) y apuntan a regiones distintas del mostrador (grupos enfrentados arriba `[110, 110, …]` vs. objeto envuelto al frente `[125, 150, …]`). Aun así, al integrar verificar que el rect del Slot 4 no herede solape con cosméticos del mostrador. **Decisión de pool (ver §8):** el pool del Slot 4 (describir a 도윤 con -지만) se ancla a esta zona y a este momento — envolver el regalo *es* el acto de hablar de él —, de modo que el objeto desde el que se dispara el puzzle ES siempre lo que justifica la frase, sin obligar a revisitar otra zona.

**Beat narrativo:** Aquí se elige el regalo regateando (Slot 3, G053: comparar es elegir) y, mientras lo envuelves, se habla de 도윤 (Slot 4, G021: «무뚝뚝하지만 착해요» — arisco pero bueno). Esa frase con -지만 es la grieta por donde entra el giro: justo después de resolver el Slot 4, el **ScriptedBeat** revela que 도윤 no es hijo de sangre de 이모 — llegó hambriento al mercado hace ~10 años y no se fue; ella simplemente siguió dándole de comer. Lo que de verdad necesita antes de que el chico se vaya no es la confesión romántica: es **su** adiós y su gracias **a ella** (ver §7). El amarillo de la bombilla, el papel de envolver entre las manos: la ternura se cuenta con objetos, nunca con lágrimas (anti-melodrama).

---

#### Zona 4 · 버스 정류장 / 시장 입구 (parada del bus / entrada del mercado — clímax)

**Layout visual (320×240) — estado A «el bus todavía no»:** El borde del mercado, donde el calor de los puestos cede al frío de la calle. Tercio derecho: el **arco de entrada del mercado** (시장 입구) con su rótulo de neón de trazos sugeridos (ilegible) y guirnaldas de bombillas cruzando el encuadre. Centro-izquierda: la **marquesina de la parada** (버스 정류장), un poste con cartel y un banco de metal; 도윤 de pie junto al banco, mochila militar al hombro, silueta tensa. A su lado, esperando, 순자 이모 y, un paso más allá, 하나 — el mercado entero ha venido a despedirlo, siluetas cálidas contra el negro azulado de la calle. Fondo: el asfalto mojado abriéndose hacia la avenida, faros lejanos, neón del mercado reflejado en charcos. Vapor de la última plancha entrando por el borde derecho. Sin bus aún: el carril vacío, brillante de lluvia reciente. Paleta: ámbar de las bombillas del arco a la derecha; azul-noche y faros al fondo izquierdo.

**Estado B «el último bus» (swap durante la secuencia de salida / outro):** misma composición; entra por la izquierda el **último bus**, sus ventanillas amarillas encendidas, la puerta abierta, los faros barriendo el asfalto. Más neones del mercado apagados (es la hora de cierre), una persiana del fondo ya abajo del todo. Es el fondo sobre el que congela el `farewellImage`.

**Interactivos:**
- 🟡 도윤 junto al banco / la marquesina (centro-izquierda, rect ≈ [95, 95, 70, 85]) → **SLOT 6** (creación con fichas · G013 callback + G019) — construir la despedida de 도윤. **Trampa temática:** las fichas distractoras decisivas deletrean un adiós-para-siempre (잘 있어요 / 안녕히 계세요); la línea correcta es el «vuelvo» 다녀오겠습니다 + el gracias en pasado 그동안 고마웠어요. La primera ficha de adiós-para-siempre produce **rechazo suave SIN coste de corazón** (이모/도윤 corrige con cariño: «no es un adiós»); reincidir = error normal (ver §7 y §8).
- ⚪ El arco de entrada del mercado (derecha, ≈ [215, 25, 95, 45]) — close-up `obj-market-gate.png`: el rótulo de neón. Texto: `또 오세요.` *(eco de bienvenida/despedida del mercado.)*
- ⚪ El banco de la parada (≈ [70, 165, 55, 30]) — texto: `버스가 곧 와요.`
- ⚪ El carril vacío / los faros lejanos (fondo, ≈ [10, 110, 80, 40]) — texto: `마지막 버스예요.`

> **Nota de hotspots (Zona 4):** el rect del Slot 6 se ciñe a 도윤 + la marquesina `[95, 95, 70, 85]`; el arco `[215, 25, …]`, el banco y el carril quedan fuera. El arco de entrada es **cosmético**, nunca un trigger — verificar al integrar que no solapa el rect del Slot 6.

> **Prop de salida (el 호떡 caliente):** el 호떡 que 순자 이모 le aprieta a 도윤 en la mano para el bus, y la mochila que te devuelve, son **props exclusivos del outro**, renderizados solo en `cinematic-outro.png` / la animación de la despedida. NO se siembran como hotspot en esta zona: la mochila ya quedó sembrada en la Zona 1 (deuda Chekhov honrada allí), y el 호떡-para-el-camino es un regalo del cierre, no una promesa previa. Documentado aquí para que arte no busque dónde plantarlos en escena.

**Beat narrativo:** El último encargo no era casar a 도윤 con 하나 — era conseguir que el chico orgulloso dijera en voz alta lo que jamás diría si se lo pidieran. Va a por 하나 (lo logra dulcemente o falla pero crece), y luego se vuelve hacia 이모. El jugador construye la frase con fichas: si elige el adiós-para-siempre, la despedida «no sale bien» —rechazo suave, sin corazón, corrección cariñosa— porque 다녀오겠습니다 es «voy y vuelvo», no un adiós. Al acertar, 도윤 lo dice entero: «그동안 고마웠어요. 다녀오겠습니다.» 이모 le mete el 호떡 caliente en la mano, le devuelve tu mochila, y empieza el final. El tema del nivel cierra aquí: pasaste la noche pidiendo favores con soltura (-아/어 주세요), pero la frase más difícil era un simple gracias en pasado. El idioma ya cargaba el nudo. *(→ aquí, sobre el estado B, congela el `farewellImage`.)*

---

## §7 · Mapa de puzzles

```
[CINEMÁTICA APERTURA — cinematic-intro.png]
  El 일주문 del mercado bajo el neón. La mochila al hombro, el último bus en 20 min.
  Voz de 이모: «어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요.»
       ↓
ZONA 1 — 호떡집 (hub)
  Línea-tesis al colgar la mochila: «잠깐만 빌릴게요. 도윤이 좀 도와줘요.» (no se repite al final)
  Hablar con 이모 → SLOT 1 (selección) — G039
    5 favores en pool; aceptar el primer recado («도윤 좀 도와주세요»).
  Acierto: «옳지! 역시 손이 빠르네. 자, 다음.» — el primer guiño cómplice
       ↓
ZONA 2 — 먹자골목 / 하나
  하나 / la barra → SLOT 2 (completar, input verbatim) — G038
    Averiguar qué le gusta a 하나: preguntar / probar / asomarse (물어보세요 / 먹어 보세요 / 가 보세요).
    El sorteo es diegético: el mercado plural decide qué pista da 하나.
       ↓
ZONA 3 — 만물상 골목 (orden fijo: Slot 3 → Slot 4 → TWIST)
  Mostrador / los dos grupos → SLOT 3 (selección) — G053
    Regatear y elegir el regalo («이게 저것보다 좋아요»).
    Acierto → SWAP DE ESCENA: bazar → «regalo elegido» (en pantalla)
  El regalo envuelto → SLOT 4 (completar, input verbatim) — G021
    «도윤은 무뚝뚝하지만 …» — defender al chico (arisco pero bueno).
       ↓
  [BEAT FIJO post-Slot-4 — ScriptedBeat afterSlotId:'slot-4', idéntico en todos los runs]
    이모, raspando la plancha, sin dramatismo:
    «도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요.
     그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요.»
    El plan se reordena: lo que de verdad necesita es SU adiós a ELLA. (FAMILIA ENCONTRADA)
       ↓
ZONA 1 — 호떡집 (revisita) — el rect de 이모 se reactiva
  이모 con las manos en la masa → SLOT 5 (selección) — G019
    Montar la lista del paquete del 군대 («이거 사고 저거 사고 챙겼어요»).
    Acierto: «그래, 그거 다 챙기고… 이제 마지막이네.»
       ↓
ZONA 4 — 버스 정류장 / 시장 입구
  도윤 junto a la marquesina → SLOT 6 (creación con fichas) — G013 callback + G019
    ┌─ 1.ª ficha de ADIÓS-PARA-SIEMPRE (잘 있어요 / 안녕히 계세요) → RECHAZO SUAVE, sin coste de corazón:
    │    이모/도윤: «야— 그건 영영 가는 인사잖아. 너 돌아올 거잖아.»
    │    (reincidir = error normal; los distractores [presente] y [partícula] son error normal desde el 1.er intento; ver §12.1)
    └─ Acierto: 도윤 repite TU frase palabra por palabra, mira a 이모.
       Va a por 하나 (o falla pero crece). «그동안 고마웠어요. 다녀오겠습니다.»
       ↓
[CINEMÁTICA SALIDA — 6 beats obligatorios, ver §3]
  1. El mercado baja persianas; 도윤 se declara a 하나; se gira hacia 이모.
     Cita TEXTUAL de la despedida que construiste ({farewell}, ver §12.3).
  2. 이모 le mete un 호떡 caliente en la mano: «버스에서 먹어. 식기 전에.»
  3. 이모 te devuelve la mochila: «고마워요. 진짜 도와줬어요.» Y a 도윤: «머리 짧게 깎고 와. 자리 빼놓을게.»
  4. El bus arranca; 도윤 rapado en la ventanilla; 이모 y 하나 en el andén, la mano levantada.
  5. farewellImage (cinematic-outro.png): el plano congelado, la plancha echando vapor sola.
  6. El 호떡 que nunca te comiste, todavía caliente. Tarjeta final: «제일 어려운 말은 제일 따뜻한 말이었어요.»
  Pantalla de recompensa: cosmético según tier alcanzado.
```

Reglas de runtime: `maxErrors: 2` · `epicTimeThresholdSeconds: 600` (run objetivo 12-15 min; la urgencia diegética es el último bus / los 20 min de cierre) · `legendaryCleanRunsRequired: 3` · regla especial del Slot 6 documentada en §12.1.

---

## §8 · 🧩 Pool de puzzles (30 candidatos)

> **Notación:** igual que los pools de los niveles 1 y 2: coreano visible, traducción interna, opciones/respuesta/tiles+orden y 2 pistas (Pista 1 gratis = vocabulario; Pista 2 premium = la regla — los términos gramaticales viven SOLO en la Pista 2, regla editorial 3). Los textos ES son V1; para producción multi-locale se rellena el resto del `LocalizedString` antes de integrar.
>
> **Tipos reales contra el motor (resuelto):** el motor solo conoce tres formas de slot (`escape-room.ts`): `selection` (4 `LocalizedString` + `correctIndex`), `completion` (input de texto libre, comparado verbatim tras `trim`) y `creation` (fichas arrastrables, `correctOrder` + `softRejectTiles`/`softRejectMessage` opcionales). **No existe «completar de opción múltiple».** La secuencia de tipos del nivel es **selección · completar · selección · completar · selección · creación**, que alterna sin pedir ninguna extensión de motor.
>
> **Sin posición predecible (deuda evitada):** el motor NO baraja las opciones de `selection` — las renderiza en orden de array con etiqueta fija A/B/C/D y compara contra `correctIndex`. Para que el jugador no aprenda «siempre A», los candidatos de cada slot `selection` (1, 3, 5) **varían `correctIndex`** entre sí. Nota de implementación, no de motor.
>
> **Sorteo diegético (regla editorial 5):** en cada run el cierre del mercado sortea 1 candidato por slot. En el Slot 1 es el favor que 이모 te canta; en el Slot 2, la pista que 하나 suelta; en el Slot 3, el chollo que queda en el bazar; en el Slot 4, el «pero» con que defiendes a 도윤; en el Slot 5, qué entra en el paquete; en el Slot 6, la forma de la despedida. Ningún candidato planta estado: cualquier combinación 5×5×5×5×5×5 es válida y ningún beat aguas abajo lee qué candidato salió.
>
> **Distractores:** anotados como en los niveles anteriores — *D1* negación/inversión (el favor invertido, la dirección del comparativo, la persona del verbo), *D2* sustantivo/forma plausible, *D3* lugar/marco plausible — más, en el Slot 6, el distractor temático del nivel: **[adiós-para-siempre]** (rechazo suave) frente a la línea de regreso prometido.

| Slot | Zona | Tipo | Gramática | Lo que sortea el cierre del mercado |
|---|---|---|---|---|
| 1 | 1 · 호떡 | Selección (4 opciones) | G039 (-아/어 주다) | El favor que 이모 te canta |
| 2 | 2 · 먹자골목 | Completar (input verbatim) | G038 (-아/어 보다) | La pista que 하나 suelta |
| 3 | 3 · 만물상 | Selección (4 opciones) | G053 (-보다 + 더) | El chollo que queda en el bazar |
| 4 | 3 · 만물상 | Completar (input verbatim) | G021 (-지만) | El «pero» con que defiendes a 도윤 |
| 5 | 1 · 호떡 (revisita) | Selección (4 opciones) | G019 (-고) | Qué entra en el paquete del 군대 |
| 6 | 4 · 버스 정류장 | Creación (fichas) | G013 callback + G019 | La forma de la despedida |

---

### §8.1 · SLOT 1 · El primer favor (호떡) · G039 · -아/어 주다 (favor)

**Zona:** 호떡 (hub) — **Tipo:** Selección (4 opciones) — **Gramática foco:** G039 (-아/어 주다 / -아/어 줘요 = «hazme el favor de…»)

**Disparador:** apenas el jugador trepa al puesto, 순자 이모 le «secuestra» la mochila con una sonrisa y se la cuelga del hombro: «도와주면 돌려줄게요.» Mientras enciende la plancha y el vapor sube, le encarga el primer mandado con voz cálida y callejera (해요체 plano, voz + subtítulo KO). La pregunta de UI es siempre la misma: **«¿Qué te pide 이모?»** — el favor que aceptas aquí es el motor de toda la noche.

**Éxito (fijo, todos los runs):** «옳지! 역시 손이 빠르네. 자, 다음.» — el primer guiño cómplice; la mochila se queda con ella, pero ya sois equipo.
**Fallo:** UI neutra («No es ese el favor que te pidió.») — nunca una réplica herida de 이모 (la calidez no se rompe; el error es del jugador, no un desaire del NPC).

> **Nota de registro (해요체 plano):** los cinco favores van en **`-아/어 줘요`**, no en `-아/어 주세요`. 순자 이모 tutea al jugador con calidez de mercado tras «robarle» la mochila — `주세요` sonaría a una distancia formal impropia de la escena. El `주다` de G039 sigue audible en cada favor; lo que el slot entrena es **a quién** beneficia el favor y **qué verbo** lo lleva, no el nivel honorífico. El respeto hacia 도윤/하나 vive en el nombre, no en morfología testeada.
>
> **Nota de diseño (posición):** los `correctIndex` de los cinco candidatos están repartidos (1.1→A, 1.2→D, 1.3→C, 1.4→B, 1.5→D) para que la letra correcta no sea predecible; el motor no baraja. Letras usadas: A×1, B×1, C×1, D×2.

**Candidato 1.1 — Llevar el plato de 호떡**
- **Línea de 이모 (KO):** «이 호떡 한 접시 도윤이한테 갖다줘요.»
- **Pregunta:** ¿Qué te pide 이모?
- **Opciones (correcta = A):**
  - A) Que le **lleves** este plato de 호떡 a 도윤. ✅
  - B) Que le pidas a **도윤 que te traiga** a ti un plato de 호떡. *(D1 — favor invertido: tú→él pasa a él→tú)*
  - C) Que le lleves este plato de 호떡 a **하나**. *(D3 — destinatario cambiado: 하나 en vez de 도윤이한테)*
  - D) Que le lleves un plato de **떡볶이** a 도윤. *(D2 — comida plausible del mercado: 떡볶이 vs 호떡)*
- **Pista 1:** `호떡` = el panqueque relleno de azúcar y canela del puesto · `한 접시` = un plato · `갖다주다` = llevarle algo a alguien · `도윤이한테` = a 도윤.
- **Pista 2:** `-아/어 주다` (G039) = hacer algo **en beneficio de otro**; en `갖다줘요` el favor (llevar) va de ti hacia 도윤, y `도윤이한테` marca a quién. Cambia el `한테` y cambias a quién ayudas. No es «que él te lo traiga a ti» — ese sería el favor en sentido contrario.

**Candidato 1.2 — Transmitir un recado (llamar a 도윤)**
- **Línea de 이모 (KO):** «도윤이한테 잠깐 오라고 전해 줘요.»
- **Pregunta:** ¿Qué te pide 이모?
- **Opciones (correcta = D):**
  - A) Que **vayas tú** un momento a donde está 도윤. *(D1 — inversión: vas tú, en vez de transmitirle el recado a él)*
  - B) Que le **lleves algo de comer** a 도윤 un momento. *(D2 — verbo plausible: 전하다(recado) leído como 갖다주다(llevar comida))*
  - C) Que le transmitas a **하나** el recado de que venga. *(D3 — destinatario cambiado: 하나 en vez de 도윤이한테)*
  - D) Que le transmitas a 도윤 el recado de que venga un momento. ✅
- **Pista 1:** `잠깐` = un momentito · `오다` = venir · `전하다` = transmitir / hacer llegar un recado · `-아/어 주다` aquí = «transmíteselo, hazme el favor».
- **Pista 2:** `전해 줘요` = `전하다` + `-아/어 주다` (G039): el favor es **llevarle el mensaje a 도윤 de tu parte**. `오라고` = «que venga» (recado de venir hacia aquí); no es que vayas tú — el que se mueve es 도윤, tú solo transmites.

**Candidato 1.3 — Comprar (el gesto para 하나)**
- **Línea de 이모 (KO):** «저 꽃집에서 꽃 한 송이만 사다 줘요.»
- **Pregunta:** ¿Qué te pide 이모?
- **Opciones (correcta = C):**
  - A) Que le **vendas** una flor a la dueña de la floristería. *(D1 — inversión de rol: 팔다 vs 사다)*
  - B) Que compres una flor en la floristería **para ti**. *(D2 — beneficiario cambiado: 사다 주다 es para otro, no para ti)*
  - C) Que compres una flor en aquella floristería **y se la traigas a 이모**. ✅
  - D) Que compres una **manzana** en aquella floristería y se la traigas. *(D2 — objeto plausible, mismo frame comprar-y-traer: 사과 vs 꽃)*
- **Pista 1:** `꽃집` = floristería · `꽃 한 송이` = una sola flor (송이 = clasificador de flores) · `사다 주다` = comprarle algo a alguien y traérselo · `-만` = solo, nada más que una.
- **Pista 2:** `사다 주다` (G039) = «comprar algo **para** otra persona y dárselo» — no «comprar para ti» (eso sería solo `사다`), ni «vender» (`팔다`). El favor de comprar fluye del que compra hacia otro; aquí ese otro es 이모 (y pronto sabrás para quién es de verdad la flor).

**Candidato 1.4 — Ir a buscar (sillas prestadas del puesto vecino)**
- **Línea de 이모 (KO):** «옆 가게에서 의자 두 개만 빌려다 줘요.»
- **Pregunta:** ¿Qué te pide 이모?
- **Opciones (correcta = B):**
  - A) Que le **prestes** dos sillas al puesto de al lado. *(D1 — inversión: tú prestas, en vez de pedir prestado y traer; 빌려주다 vs 빌려다 주다)*
  - B) Que pidas prestadas dos sillas en el puesto de al lado y se las traigas a 이모. ✅
  - C) Que pidas prestadas **dos mesas** en el puesto de al lado. *(D2 — objeto plausible: 탁자 vs 의자)*
  - D) Que pidas prestadas dos sillas en la **tienda de enfrente**. *(D3 — lugar cambiado: 앞 가게 vs 옆 가게)*
- **Pista 1:** `옆 가게` = el puesto de al lado · `의자` = silla · `두 개` = dos (unidades) · `빌리다` = pedir prestado.
- **Pista 2:** Ojo al par: `빌려주다` = «prestar (a alguien)»; `빌려다 줘요` = «ir a pedir prestado y traérmelo» — eso es lo que te pide. Mismo verbo `빌리다`, dirección opuesta del favor: aquí el favor (traer las sillas) va hacia 이모, no hacia el vecino.

**Candidato 1.5 — Ayudar a 도윤 a cerrar** *(siembra el motor de la trama)*
- **Línea de 이모 (KO):** «도윤이를 좀 도와줘요. 오늘 밤만.»
- **Pregunta:** ¿Qué te pide 이모?
- **Opciones (correcta = D):**
  - A) Que **le pidas ayuda a 도윤** esta noche. *(D1 — favor invertido: él te ayuda a ti, en vez de tú a él)*
  - B) Que ayudes a **하나** esta noche. *(D3 — destinatario cambiado: 하나 en vez de 도윤이)*
  - C) Que **trabajes en lugar de** 도윤 esta noche. *(D2 — lectura plausible pero falsa: «sustituirlo» 대신 일하다 vs «ayudarle» 도와주다)*
  - D) Que le eches una mano a 도윤, solo por esta noche. ✅
- **Pista 1:** `돕다` = ayudar · `도와주다` = echarle una mano a alguien · `좀` = un poco / ablanda la petición · `오늘 밤만` = solo esta noche.
- **Pista 2:** `도와주다` (G039) = «ayudar **a** alguien» con matiz de favor: el `주다` dice que la ayuda va de ti **hacia** 도윤 (a quien `도윤이를` marca como objeto). No es «que él te ayude a ti», ni «hacer su trabajo por él» — es estar a su lado. (Y este favor, el más pequeño en apariencia, es el que arranca toda la noche.)

---

### §8.2 · SLOT 2 · 먹자골목 / 하나 — «Averiguar qué le gusta a 하나» · G038 · -아/어 보다 (try / ask around)

**Zona:** 2 · 먹자골목 (callejón de la comida), puesto de 하나 — **Tipo:** Completar (input verbatim, un solo `___`) — **Gramática foco:** G038 (-아/어 보다 · probar / preguntar / asomarse a ver)

**Disparador:** 순자 이모 te empuja hacia el callejón con un guiño: «도윤이가 하나 좋아하는 거 몰라요. 가서 좀 알아봐 줘요.» (No sabe qué le gusta a 하나; ve a averiguarlo.) Cada errata se resuelve **probando, preguntando o asomándose** — el verbo del hueco es siempre una forma -아/어 보다. El jugador **escribe** la forma exacta (no hay botones; `completion` no tiene opciones clicables).

**Éxito (fijo, agnóstico del candidato — funciona con los 5):** 하나 se ríe tapándose la boca: «아, 도윤이가 보냈구나… 그 녀석. …귀엽네.» (Ah, te mandó 도윤… ese chico. …qué mono.) — y el mercado entero finge no haber oído.
**Fallo:** UI neutra («Esa no es la forma. Vuelve a escribir lo que harías.») — nunca una réplica cortante de 하나 (calidez; regla anti-melodrama heredada de L2).

> **Tipo (resuelto contra el motor):** `completion` puro — `korean` con un único `___`, `translation`, y `answer` comparado **verbatim tras `trim`** (`escape-room.ts`, `CompletionCandidate`, líneas 56-67). **No hay `correctIndex` ni `options`** (eso es solo de `selection`): QA no debe buscar esos campos aquí. Los distractores no son clicables: se **nombran y explican** en la Pista 2 como contraste (igual que el Slot 2 de L2).
>
> **Nota de hueco único (auditada):** cada frase está construida para que **un solo verbo + -아/어 보세요** cierre el sentido. Auditoría de colisiones realizada candidato a candidato: ningún hueco admite un segundo verbatim natural. En concreto, 2.3 bloquea 오다 anclando al hablante inmóvil («못 가요»); 2.4 bloquea 먹다 cambiando el marco a *encargar*; 2.5 sustituye cualquier premisa incoherente por una bebida que solo admite 마시다.
>
> **Nota de ortografía (2.2):** `물어보다` («preguntar / informarse») se lexicaliza **cerrado** en coreano estándar — `물어보세요`, sin espacio (la plataforma lo trata como verbo único: ver `register-transform/honor.ts`, par 묻다/물어보다 → 여쭤보다). Es el único candidato con auxiliar pegado; se documenta para que QA no lo «corrija» a `물어 보세요`. Los demás (먹어 보세요, 가 보세요, 시켜 보세요, 마셔 보세요) van **separados**, coincidiendo con el repo (`placement/n2.ts` usa `먹어 보세요`; `cloze/n1.ts` usa `가 보세요`).
>
> ⚙️ **Recomendación al motor (anotada, NO asumida — mejora opcional):** que `completion` **normalice espacios internos** antes de comparar (colapsar/ignorar espacios en torno al auxiliar 보다). Beneficiaría a todo slot verbatim y eliminaría el único falso-negativo plausible aquí (`물어 보세요` separado). Si no se implementa, el contenido sigue siendo correcto con `물어보세요` canónico; es decisión del owner, no un cambio de contenido.
>
> **Familias de distractor del nivel (solo en Pista 2):** *DT* la misma idea en **presente plano** (먹어요 vs 먹어 보세요 — pierde el matiz «pruébalo a ver»); *D2* otra forma cortés que **no** es -아/어 보다 (먹어 주세요 = G039, un favor, no «probar»); *D3* un registro/verbo cruzado tentador (honorífico fuera de tono, u 오다 vs 가다).

**Candidato 2.1 — Probar el 호떡 primero**
- **Frase (KO):** «하나 씨, 이거 호떡인데… 한번 ___. 도윤이가 만들었어요.»
- **Traducción:** Hana, esto es un hotteok… pruébalo (a ver). Lo hizo 도윤.
- **Respuesta (verbatim):** `먹어 보세요`
- **Pista 1:** `호떡` = hotteok (panqueque relleno de la parrilla) · `한번` = una vez, prueba · `먹다` = comer.
- **Pista 2:** -아/어 보다 (G038) = «hacer algo para ver qué tal / probar». 먹다 + -어 보다 → 먹어 보다; imperativo cortés → 먹어 보세요 (separado). NO 먹어요 (*DT* — solo «come», sin el matiz de probar) ni 먹어 주세요 (*D2* — eso pide un favor, G039, otra gramática). 드셔 보세요 (*D3*) es honorífico: tienta por «más cortés», pero rompe el tono callejero parejo de 이모↔하나, iguales; el registro del puesto es 해요체 llano.

**Candidato 2.2 — Preguntarle directamente**
- **Frase (KO):** «뭘 좋아하는지 모르겠으면, 하나 씨한테 직접 ___.»
- **Traducción:** Si no sabes qué le gusta, pregúntale directamente a Hana (a ver qué dice).
- **Respuesta (verbatim):** `물어보세요`  *(una sola palabra, sin espacio — ver nota de ortografía 2.2)*
- **Pista 1:** `직접` = directamente, en persona · `묻다` = preguntar · `-한테` = a (alguien). *(Se escribe en una sola palabra; el motor compara letra a letra.)*
- **Pista 2:** -아/어 보다 (G038) sobre 묻다 da «preguntar para informarse / averiguar». 묻다 es verbo ㄷ irregular (묻 → 물 ante vocal) y con -어 보다 se **lexicaliza cerrado**: 물어보다 → 물어보세요 (sin espacio). NO 물어요 (*DT* — solo «pregunta», sin «averígualo»); NO 물어봐 주세요 (*D2* — eso vuelve a ser un favor, G039, no el acto de informarte tú); NO 말해 보세요 (*D3* — «di a ver», pero aquí tú no dices, tú averiguas: el sujeto del acto eres tú preguntando).

**Candidato 2.3 — Asómate a su puesto**
- **Frase (KO):** «나는 호떡 굽느라 못 가요. 하나 씨 가게에 한번 ___.»
- **Traducción:** Yo no puedo ir, estoy friendo hotteok. Acércate tú al puesto de Hana (a ver).
- **Respuesta (verbatim):** `가 보세요`
- **Pista 1:** `가게` = tienda, puesto · `굽다` = freír/asar a la parrilla · `가다` = ir.
- **Pista 2:** -아/어 보다 (G038) = «hacer algo a ver». 가다 + -아 보다 → 가 보다 (las dos ㅏ se funden en una sílaba) → 가 보세요 (separado). Como 이모 no puede moverse (못 가요) y el puesto de 하나 está allá, el desplazamiento es 가다 (ir), nunca 오다 (venir). NO 가요 (*DT* — «ve», sin «pásate a ver»); NO 가 주세요 (*D2* — «ve por mí», un favor G039; la frase ya dice 못 가요, así que el favor recae en el jugador, no se pide como servicio); NO 와 보세요 (*D3* — «ven a ver», imposible aquí: 이모 está en su parrilla y no puede ir).

**Candidato 2.4 — Encárgale el plato estrella**
- **Frase (KO):** «하나 씨 솜씨를 보려면, 제일 잘 나가는 메뉴로 하나 ___.»
- **Traducción:** Para ver la mano que tiene Hana, encárgale uno del plato más vendido.
- **Respuesta (verbatim):** `시켜 보세요`
- **Pista 1:** `솜씨` = maña, destreza (de cocina) · `시키다` = encargar, pedir (un plato) · `제일 잘 나가는 메뉴` = el plato que más se vende.
- **Pista 2:** -아/어 보다 (G038) sobre 시키다 → 시켜 보다 = «encárgalo y a ver qué tal». Imperativo cortés: 시켜 보세요. NO 시켜요 (*DT* — «pide», sin el «a ver qué tal»); NO 시켜 주세요 (*D2* — «pídemelo a mí / hazme el favor de pedir», G039, no propone probar); NO 만들어 보세요 (*D3* — «haz tú uno a ver», pero aquí lo **encargas** al puesto de 하나, no lo cocinas tú). *(El marco «encargar del menú» bloquea 먹어 보세요: aquí el acto testeado es pedirlo, no comerlo; 하나 funciona como cuantificador «uno», no como la persona.)*

**Candidato 2.5 — Prueba la bebida de la casa**
- **Frase (KO):** «하나 씨가 직접 만든 식혜예요. 차갑고 달아요. 한번 ___.»
- **Traducción:** Es el sikhye que hace Hana. Frío y dulce. Pruébalo (a ver).
- **Respuesta (verbatim):** `마셔 보세요`
- **Pista 1:** `식혜` = sikhye (bebida dulce de arroz, se sirve fría) · `차갑다` = estar frío · `마시다` = beber.
- **Pista 2:** -아/어 보다 (G038) = «probar a ver». 마시다 + -어 보다 → 마셔 보다 → imperativo cortés 마셔 보세요. NO 마셔요 (*DT* — «bebe», sin «a ver qué tal sabe»); NO 마셔 주세요 (*D2* — «bébetelo por mí», un favor G039, no «pruébalo»); NO 먹어 보세요 (*D3* — tienta porque 식혜 es comestible, pero una bebida fría se **bebe**: 마시다, no 먹다; además 먹어 보세요 ya es la respuesta de 2.1 y no se repite).

---

### §8.3 · SLOT 3 · El callejón del 만물상 (elegir el regalo) · G053 · -보다 (comparativo, +더)

**Zona:** 3 · 만물상 골목 — **Tipo:** Selección (línea KO + pregunta + 4 opciones + `correctIndex`) — **Gramática foco:** G053 (-보다 «más que», reforzado por 더)

**Disparador:** el jugador llega al callejón de baratijas con 순자 이모, que ya tiene en la cabeza el paquete para el cuartel. Frente a dos cosas sobre la manta del vendedor, la tía sopesa en voz alta cuál llevar — y te pregunta qué acaba de decir. Cada candidato es **una comparación entre dos objetos regalables**: acertar = entender qué eligió ella y por qué.

**Flavor de acierto (cálido):** 순자 이모 asiente, mete el objeto elegido en la bolsa de tela y sigue tirando de ti hacia el siguiente puesto — el paquete del cuartel crece favor a favor.

**Flavor de fallo (UI neutra, nunca un NPC herido):** la opción se marca en gris y se reabre la elección; el motor descuenta el error según `maxErrors`, sin réplica dolida de la tía. Ella espera, paciente, con la bolsa abierta.

> **Nota de diseño (posición):** los `correctIndex` de los cinco candidatos están repartidos (**3.1→A, 3.2→C, 3.3→D, 3.4→A, 3.5→B**) para que la letra correcta no sea predecible; el motor no baraja las opciones de `selection`. La única letra repetida, A, cae en candidatos no adyacentes (3.1 y 3.4).
>
> **Nota de diseño (la dirección ES la trampa, D1):** en -보다 el ESTÁNDAR de comparación lleva 보다 y el SUJETO (lo que es «más») lleva 은/는/이/가, reforzado por **더**. Cada candidato usa **더 sobre un eje positivo** (따뜻하다·비싸다·크다·달다·좋다) para que invertir quién lleva 보다 produzca un opuesto **inequívoco** (`A가 B보다 더 X` ≠ `B가 A보다 더 X`). **Se evita 덜** como eje discriminante: con «menos» la inversión no es un opuesto limpio. Sujeto y estándar nombran SIEMPRE objetos **distintos y no-deícticos** (nada de «이 펜 vs 저 펜»), así que ninguna opción es paráfrasis igualmente válida de otra.

**Candidato 3.1 — La bufanda más cálida** *(el regalo práctico para el cuartel)*
- **Línea (KO):** «이 목도리가 저 장갑보다 더 따뜻해요. 군대에서는 이게 좋아요.»
- **Pregunta:** ¿Qué está diciendo 순자 이모?
- **Opciones (correcta = A):**
  - A) Esta bufanda abriga más que aquellos guantes; para el cuartel, mejor esta. ✅
  - B) Aquellos guantes abrigan más que esta bufanda; para el cuartel, mejor los guantes. *(D1 — inversión: 보다 cambiado de lado)*
  - C) Esta bufanda es más **bonita** que aquellos guantes; para el cuartel, mejor esta. *(D2 — eje cambiado: 예뻐요 vs 따뜻해요)*
  - D) Esta bufanda abriga más que aquel **gorro**; para el cuartel, mejor esta. *(D3 — objeto cambiado: 모자 vs 장갑)*
- **Pista 1:** `목도리` = bufanda · `장갑` = guantes · `따뜻하다` = abrigar, estar caliente · `군대` = el cuartel, la mili.
- **Pista 2:** En `A가 B보다 더 따뜻해요`, lo que es «más» es A (el que lleva 가/이); B (el que lleva 보다) es el patrón contra el que se compara (G053). Aquí 목도리가 … 장갑보다 → la bufanda es la más cálida. Si das vuelta a quién lleva 보다, das vuelta al sentido.
- **Flavor post-acierto (fijo del candidato, no testeado):** 순자 이모 dobla la bufanda con las dos manos, hablándose a sí misma: «군대 추워… 이거면 돼.»

**Candidato 3.2 — Más cara, pero mejor** *(el regateo: la tía elige calidad sobre precio)*
- **Línea (KO):** «이 만년필이 저 볼펜보다 비싸요. 그런데 이 만년필이 더 좋아요.»
- **Pregunta:** ¿Qué está diciendo 순자 이모?
- **Opciones (correcta = C):**
  - A) Esta estilográfica es más **barata** que aquel bolígrafo, pero aun así es mejor. *(D1 — inversión del eje precio: 싸요 vs 비싸요)*
  - B) Aquel bolígrafo es más caro que esta estilográfica, y además **el bolígrafo** es mejor. *(D1′ — inversión: quién lleva 보다 y quién es «más»)*
  - C) Esta estilográfica es más cara que aquel bolígrafo, pero aun así esta es mejor. ✅
  - D) Esta estilográfica es más cara que aquella **libreta**, pero esta es mejor. *(D3 — objeto comparado cambiado: 공책 vs 볼펜)*
- **Pista 1:** `만년필` = estilográfica · `볼펜` = bolígrafo · `비싸다` = ser caro · `좋다` = ser bueno · `그런데` = pero, sin embargo.
- **Pista 2:** `이 만년필이 저 볼펜보다 비싸요` — lo más caro es la estilográfica (이 만년필, con 이/가); 볼펜 (con 보다) es la referencia (G053). La segunda frase repite el sujeto (이 만년필이 더 좋아요): es la misma la que es más cara Y mejor. 순자 이모 paga de más a propósito.
- **Flavor post-acierto (fijo del candidato, no testeado):** «싼 게 비지떡이야. 좋은 걸로 주세요!» — le grita al vendedor, riendo.

**Candidato 3.3 — La libreta más grande** *(para que escriba cartas desde el cuartel)*
- **Línea (KO):** «이 공책이 저 공책보다 더 커요. 편지 많이 쓸 수 있어요.»
- **Pregunta:** ¿Qué está diciendo 순자 이모?
- **Opciones (correcta = D):**
  - A) Aquella libreta es más grande que esta; en aquella cabrán más cartas. *(D1 — inversión: 보다 cambiado de lado)*
  - B) Esta libreta es más **fina** que aquella; pesará menos en la mochila. *(D2 — eje cambiado: 얇아요 vs 커요)*
  - C) Esta **toalla** es más grande que aquella; cabrán más cartas. *(D3 — objeto cambiado y absurdo para cartas: 수건 vs 공책)*
  - D) Esta libreta es más grande que aquella; en esta cabrán muchas cartas. ✅
- **Pista 1:** `공책` = libreta, cuaderno · `크다` = ser grande · `편지` = carta · `쓰다` = escribir.
- **Pista 2:** `이 공책이 저 공책보다 더 커요` — el sujeto (이 공책, con 이/가) es lo más grande; 저 공책 (con 보다) es el patrón de medida (G053, reforzado por 더). Aquí los dos objetos son del mismo tipo, así que solo la dirección 가/보다 decide cuál es la grande (no la palabra).
- **Flavor post-acierto (fijo del candidato, no testeado):** «편지 자주 써라, 알았지?» — dice mirando hacia el puesto de 호떡, no a ti.

**Candidato 3.4 — Más dulce que el café** *(un capricho para el viaje de 도윤)*
- **Línea (KO):** «이 율무차가 저 커피보다 더 달아요. 도윤이는 단 걸 좋아해요.»
- **Pregunta:** ¿Qué está diciendo 순자 이모?
- **Opciones (correcta = A):**
  - A) Este té de adlay es más dulce que aquel café; a 도윤 le gusta lo dulce. ✅
  - B) Aquel café es más dulce que este té de adlay; a 도윤 le gusta lo dulce. *(D1 — inversión: 보다 cambiado de lado)*
  - C) Este té de adlay es más dulce que aquel café; a 도윤 le gusta lo **picante**. *(D2 — eje del gusto cambiado: 매운 걸 vs 단 걸)*
  - D) Este té de adlay es más dulce que aquel **zumo**; a 도윤 le gusta lo dulce. *(D3 — objeto comparado cambiado: 주스 vs 커피)*
- **Pista 1:** `율무차` = té de adlay («lágrimas de Job») · `커피` = café · `달다` = ser dulce · `단 거` = lo dulce.
- **Pista 2:** `율무차가 커피보다 더 달아요` — el sujeto (율무차, con 가) es lo más dulce; lo que lleva 보다 (커피) es el patrón (G053, reforzado por 더). Invertir quién lleva 보다 invierte cuál es el dulce.
- **Flavor post-acierto (fijo del candidato, no testeado):** «이건 도윤이 거. 하나 건 따로 사자.» — *Este es para 도윤. Lo de 하나 lo compramos aparte.* (la tía cuida a los dos)

**Candidato 3.5 — Más calentito que los calcetines** *(elegir entre dos regalos de abrigo para el cuartel)*
- **Línea (KO):** «이 손난로가 저 양말보다 더 따뜻해요. 손이 제일 시려요.»
- **Pregunta:** ¿Qué está diciendo 순자 이모?
- **Opciones (correcta = B):**
  - A) Aquellos calcetines abrigan más que este calientamanos; las manos son lo que más frío pasa. *(D1 — inversión: 보다 cambiado de lado)*
  - B) Este calientamanos abriga más que aquellos calcetines; las manos son lo que más frío pasa. ✅
  - C) Este calientamanos es más **barato** que aquellos calcetines; las manos son lo que más frío pasa. *(D2 — eje cambiado: 싸요 vs 따뜻해요)*
  - D) Este calientamanos abriga más que aquel **gorro**; las manos son lo que más frío pasa. *(D3 — objeto comparado cambiado: 모자 vs 양말)*
- **Pista 1:** `손난로` = calientamanos (de bolsillo) · `양말` = calcetines · `따뜻하다` = abrigar · `손이 시리다` = tener las manos heladas.
- **Pista 2:** `손난로가 양말보다 더 따뜻해요` — el sujeto (손난로, con 가) es lo más cálido; 양말 (con 보다) es la referencia (G053, 더 lo refuerza). Invertir quién lleva 보다 invierte cuál abriga más.
- **Flavor post-acierto (fijo del candidato, no testeado):** «뛰어, 뛰어! 버스 놓치면 안 돼!» — la tía ya te arrastra de la manga, riéndose hacia el siguiente puesto.

**Resumen de reparto de posición correcta:** 3.1→A · 3.2→C · 3.3→D · 3.4→A · 3.5→B.

---

### §8.4 · SLOT 4 · 만물상 «무뚝뚝하지만…» · G021 · -지만 (but / although)

**Zona:** 3 · 만물상 (la tienda-bazar del callejón) — **Tipo:** Completar (input verbatim, una respuesta) — **Gramática foco:** G021 (-지만)

**Disparador:** mientras envolvéis el regalo en el mostrador del 만물상, 순자 이모 habla de 도윤 sin levantar la vista del papel — una frase a medias por cada cosa que mete en la bolsa. El vapor del 호떡 todavía llega desde el puesto. El jugador **teclea** la palabra que falta en el input (el motor compara verbatim tras `trim`); el hueco siempre cae sobre el verbo/adjetivo + 지만. La frase visible en coreano fuerza el blanco por sí sola — el rival antónimo y el pasado quedan muertos dentro de la oración, no por la glosa ES ni por el conocimiento del mundo.

> El **TWIST** (ScriptedBeat fijo post-Slot-4) salta cuando este slot se resuelve: 도윤 no es su hijo de sangre. Llegó hambriento al mercado hace ~10 años y nunca se fue; ella solo siguió alimentándolo. Contenido NO-slot, idéntico en todos los runs — ningún candidato del pool lo condiciona.

**Éxito (fijo, todos los runs):** 순자 이모 aprieta el lazo del paquete y sonríe de lado — «맞아. 우리 도윤이가 그래.» — un beat cálido, orgullo de madre que no dice «madre».
**Fallo:** UI neutra («Esa no es la palabra que falta.») — nunca una réplica herida de 이모 ni de 도윤.

> **Nota de diseño (sin trampa de tiempo).** G021 no tiene trampa temporal: admite cualquier tiempo en cualquier cláusula. Por eso aquí **no** se importa el distractor temático «presente» de otros slots — sería un concepto inexistente para esta gramática. El foil real de -지만 es **-아/어서 (causa)** frente a **-고 (mera enumeración)**, y vive solo en la Pista 2. Como es `completion`, no hay `options` ni `correctIndex`: cada candidato tiene exactamente un `___` y una `answer` de token único sin espacio interno.

> **Nota de diseño (cero segundas respuestas).** El blanco se fuerza DESDE la frase visible: 4.2 (옆집보다 + 맛은 똑같아요) mata 비싸지만; 4.4 (멀리 + 항상 … 있어요, presente estativo gnómico) mata 갔지만; 4.5 (사람도 많고) mata 조용하지만. La glosa ES y el conocimiento del mundo nunca son los que deciden — lo decide el texto coreano.

**Candidato 4.1 — 무뚝뚝하지만 착해요 (la línea-tesis del nivel)**
- **Frase (KO):** «도윤이는 무뚝뚝___ 착해요.»
- **Traducción:** «Do-yun es seco/arisco, pero tiene buen corazón.»
- **Respuesta (verbatim):** `무뚝뚝하지만`
- **Por qué solo cabe 무뚝뚝하지만:** 무뚝뚝하다 («ser seco») y 착하다 («tener buen corazón») son una concesión antónima genuina, sin adjetivo rival que la dispute; no hay segunda lectura válida. La raíz va desnuda (el tiempo lo lleva 착해요). 무뚝뚝하고 enumera («arisco Y bueno», pierde el «pero»); 무뚝뚝해서 daría causa falsa («por arisco, es bueno»).
- **Pista 1:** `무뚝뚝하다` = ser seco, parco · `착하다` = ser de buen corazón. 이모 lo dice con cariño, no como queja.
- **Pista 2:** «X pero Y» dentro de una misma frase = raíz + 지만, pegado directo: 무뚝뚝하다 → 무뚝뚝하지만. No es -아/어서 (causa) ni -고 (solo enumera). Para «pero» al inicio de OTRA frase: 하지만 suelto.

**Candidato 4.2 — 싸지만 맛은 똑같아요 (el regateo del 호떡)**
- **Frase (KO):** «이 호떡은 옆집보다 ___ 맛은 똑같아요.»
- **Traducción:** «Este 호떡 es más barato que el de al lado, pero sabe igual.»
- **Respuesta (verbatim):** `싸지만`
- **Por qué solo cabe 싸지만:** «옆집보다» («más que el de al lado») + «맛은 똑같아요» («el sabor es igual») fuerzan la lectura «más barato, pero igual de bueno». 비싸지만 («más caro, pero sabe igual») contradice el regateo de 이모, que presume de ganga, y rompe el sentido de la frase entera (nadie presume de pagar más por lo mismo). 싸고 solo enumera; 싸서 daría causa falsa.
- **Pista 1:** `싸다` = ser barato · `옆집` = el puesto de al lado · `맛은 똑같아요` = el sabor es idéntico. 이모 está regateando: misma calidad, menos won.
- **Pista 2:** El contraste «más barato, pero igual de bueno» = raíz + 지만: 싸다 → 싸지만. 싸고 enumera; 싸서 sería causa. (Vocabulario: 싸다 «barato» ≠ 비싸다 «caro» — aquí «옆집보다» ya marca la dirección.)

**Candidato 4.3 — 작지만 따뜻해요 (el guante para el cuartel)**
- **Frase (KO):** «이 장갑은 가방에 들어갈 만큼 ___ 아주 따뜻해요.»
- **Traducción:** «Estos guantes son lo bastante pequeños para caber en la mochila, pero abrigan mucho.»
- **Respuesta (verbatim):** `작지만`
- **Por qué solo cabe 작지만:** «가방에 들어갈 만큼» («tan pequeños que caben en la mochila») fija el reparo «pequeños»; 크지만 («grandes pero…») choca de frente con «caber en la mochila». 작고 enumera; 작아서 («por pequeños abrigan») es causa falsa.
- **Pista 1:** `작다` = ser pequeño · `가방에 들어가다` = caber en la mochila · `따뜻하다` = abrigar. Van en el paquete que 도윤 se lleva al 군대.
- **Pista 2:** «Pequeños, PERO abrigan» = raíz + 지만: 작다 → 작지만. La raíz va desnuda (el tiempo lo lleva 따뜻해요). 작아서 expresaría causa, no contraste.

**Candidato 4.4 — 멀리 가지만 마음은 여기 있어요 (el corazón del nivel; anticipa 다녀오겠습니다)**
- **Frase (KO):** «도윤이는 멀리 ___ 마음은 항상 여기 있어요.»
- **Traducción:** «Do-yun se va lejos, pero su corazón siempre está aquí.»
- **Respuesta (verbatim):** `가지만`
- **Por qué solo cabe 가지만 (no 갔지만):** la 2.ª cláusula es estativa y gnómica — «마음은 항상 여기 있어요» («su corazón SIEMPRE está aquí»). Con «항상» + presente estativo, la 1.ª cláusula describe un hecho general/repetido, no un viaje ya consumado: 가지만 («se va, pero…») concuerda; 갔지만 («se fue una vez, pero su corazón siempre está aquí») suena marcado y descoordina el aspecto, así que el pasado deja de ser una segunda respuesta válida. 가고 encadena sin matiz; 가서 («por irse, su corazón está aquí») es sinsentido causal.
- **Pista 1:** `멀리 가다` = irse lejos · `마음` = el corazón, el ánimo · `항상` = siempre. (Eco de lo que él dirá: 다녀오겠습니다, «voy y vuelvo».)
- **Pista 2:** «Se va, PERO su corazón sigue aquí» = raíz + 지만: 가다 → 가지만. El conector admite cualquier tiempo, pero «항상 … 있어요» pinta un presente general, así que la raíz va desnuda: 가지만.

**Candidato 4.5 — 시끄럽지만 좋아요 (la despedida al propio mercado)**
- **Frase (KO):** «달빛시장은 사람도 많고 ___ 난 정말 좋아요.»
- **Traducción:** «El 달빛시장 tiene mucha gente y es ruidoso, pero a mí me encanta de verdad.»
- **Respuesta (verbatim):** `시끄럽지만`
- **Por qué solo cabe 시끄럽지만:** «사람도 많고» («tiene mucha gente, y…») prepara el reparo bullicioso; tras «mucha gente y ___», solo 시끄럽다 («ruidoso») continúa con coherencia. 조용하지만 («tranquilo pero…») contradice «사람도 많고» en la misma frase — ya no depende del conocimiento del mundo, lo bloquea el propio texto. 시끄럽고 enumera; 시끄러워서 daría causa.
- **Pista 1:** `사람이 많다` = haber mucha gente · `시끄럽다` = ser ruidoso · `정말` = de verdad. El neón, el vapor y las voces: ese es su encanto.
- **Pista 2:** «Ruidoso, PERO me encanta» = raíz + 지만: 시끄럽다 → 시끄럽지만 (지만 empieza por consonante, así que la raíz no sufre el cambio ㅂ-irregular). 시끄럽고 solo enumera; 시끄러워서 daría causa.

> **Verbatim/espaciado (post-fix):** las cinco respuestas son token único sin espacio interno — `무뚝뚝하지만` · `싸지만` · `작지만` · `가지만` · `시끄럽지만` — y cada `korean` produce la frase exacta al sustituir `___`. Comparación limpia tras `trim`. Cero segundas respuestas válidas.

---

### §8.5 · SLOT 5 · La lista para el cuartel · G019 · -고 (and / listing)

**Zona:** 1 · 호떡 (revisita) — **Tipo:** Selección (4 opciones) — **Gramática foco:** G019 (-고). El slot es de **comprensión** de una cadena `-고`: el jugador escucha a 순자 이모 encadenar los recados del cierre y elige lo que ella canta de verdad.

**Disparador:** ya con el regalo elegido y envuelto, vuelves al puesto de 호떡. 이모, con las manos en la masa y la plancha echando vapor, va recitando en voz alta lo que falta para cerrar y armar el paquete del cuartel — una cadena de `-고` que termina en pasado. La pregunta de UI es siempre la misma: **«¿Qué encadenó 이모 en su lista?»**

**Éxito (fijo, todos los runs):** «그래, 그거 다 챙기고… 이제 마지막이네.» — y la sonrisa que ya sabe lo que viene.
**Fallo:** UI neutra («Esa no es la lista que 이모 cantó.») — nunca un reproche de 이모 (calidez, nunca NPC herido).

> **Nota de diseño (foco G019):** `-고` encadena cláusulas y **el tiempo va SOLO en la última**: en `이거 사고 저거 사고 챙겼어요`, solo `챙겼어요` lleva pasado; las cláusulas intermedias quedan «desnudas» (`사고`), nunca `샀고`. Como este es un slot `selection`, esa morfología se **enseña** en la Pista 2 (no hay segunda línea KO que el jugador produzca, así que no se testea la forma `샀고` — eso pertenece a un `completion`/`creation`). `-고` es además **neutro respecto al orden** (canon G019, `grammars-n1.ts`: «secuencia temporal floja»), por lo que ningún distractor se apoya en «reordenar es agramatical»: cada distractor cambia **un solo hecho** (objeto, destinatario, destino, colocación) o invierte un orden **físicamente imposible** (atar la caja antes de llenarla, enfriar después de cargar). Registro: 해요체 en pasado, narración de 이모 sobre acciones ya hechas; sin `-시-` (el sujeto es ella misma).
>
> **Nota de diseño (posición):** los `correctIndex` de los cinco candidatos están repartidos (5.1→A, 5.2→C, 5.3→D, 5.4→B, 5.5→A) para que la letra correcta no sea predecible; el motor no baraja. Las opciones se escriben ya en orden final de render.

**Candidato 5.1 — El paquete del cuartel**
- **Línea (KO):** «호떡 싸고, 양말 사고, 편지 넣었어요.»
- **Traducción interna:** «Envolví los hotteok, compré calcetines y metí la carta.»
- **Pregunta:** ¿Qué encadenó 이모 en su lista?
- **Opciones (correcta = A):**
  - A) Envolvió los hotteok, compró calcetines y metió la carta. ✅
  - B) Envolvió los hotteok, compró **guantes** y metió la carta. *(D2 — objeto: 장갑 vs 양말)*
  - C) Envolvió los hotteok, compró calcetines y metió **el dinero**. *(D2 — objeto: 돈 vs 편지)*
  - D) Envolvió los hotteok, compró calcetines y **escribió** la carta. *(D2 — colocación: 편지를 쓰다 vs 편지를 넣다; ella la metió, no la escribió)*
- **Pista 1:** `호떡 싸다` = envolver los hotteok · `양말` = calcetines · `편지(를) 넣다 → 넣었어요` = meter la carta.
- **Pista 2:** `-고` (G019) encadena «y luego»: `싸고 → 사고 → 넣었어요`. El pasado va SOLO en la última cláusula (`넣었어요`); las intermedias quedan desnudas (`싸고`, `사고`), nunca `쌌고`/`샀고`.

**Candidato 5.2 — Cerrar el puesto**
- **Línea (KO):** «호떡 굽고, 봉지에 담고, 정류장으로 갔어요.»
- **Traducción interna:** «Hizo los hotteok a la plancha, los metió en la bolsa y fue a la parada.»
- **Pregunta:** ¿Qué encadenó 이모 en su lista?
- **Opciones (correcta = C):**
  - A) Hizo los hotteok, los metió en la bolsa y fue **al mercado**. *(D3 — destino: 시장으로 vs 정류장으로)*
  - B) Hizo los hotteok, los metió en **una caja** y fue a la parada. *(D2 — objeto: 상자 vs 봉지)*
  - C) Hizo los hotteok, los metió en la bolsa y fue a la parada. ✅
  - D) Metió los hotteok en la bolsa, fue a la parada y **allí los hizo a la plancha**. *(D1-lógico — orden imposible: la plancha está en el puesto, no en la parada)*
- **Pista 1:** `굽다 → 굽고` = hacer a la plancha / dorar · `봉지` = bolsa de papel · `정류장` = la parada del autobús.
- **Pista 2:** `-고` (G019) marca «y luego»: `굽고 → 담고 → 갔어요`. Solo la última cláusula lleva tiempo (`갔어요`, pasado); las intermedias nunca se conjugan (`굽고`, no `구웠고`). `-고` no fija el orden por gramática — aquí lo fija la lógica del puesto.

**Candidato 5.3 — Para 도윤 y para 하나**
- **Línea (KO):** «도윤 거 사고, 하나 거 사고, 같이 포장했어요.»
- **Traducción interna:** «Compró lo de 도윤, compró lo de 하나 y lo envolvió todo junto.»
- **Pregunta:** ¿Qué encadenó 이모 en su lista?
- **Opciones (correcta = D):**
  - A) Compró lo de 도윤, compró lo de **이모** y lo envolvió todo junto. *(D2 — destinatario: 이모 거 vs 하나 거)*
  - B) Compró lo de 도윤, compró lo de 하나 y lo **repartió** por separado. *(D2 — colocación: 따로 나누다 vs 같이 포장하다; lo envolvió junto, no lo repartió)*
  - C) Compró lo de 도윤, compró lo de 하나 y lo envolvió **por separado**. *(D2 — colocación: 따로 vs 같이)*
  - D) Compró lo de 도윤, compró lo de 하나 y lo envolvió todo junto. ✅
- **Pista 1:** `거` = «lo de» (도윤 거 = lo de 도윤) · `같이` = juntos / a la vez · `포장하다 → 포장했어요` = envolver.
- **Pista 2:** `-고` (G019) enumera «y… y…»: `사고 → 사고 → 포장했어요`. El tiempo se marca UNA sola vez, en la cláusula final (`포장했어요`). Las dos compras van en `-고` sin tiempo propio (`사고`, no `샀고`).

**Candidato 5.4 — La caja para el cuartel**
- **Línea (KO):** «김치 담고, 라면 넣고, 박스 묶었어요.»
- **Traducción interna:** «Metió el kimchi, metió el ramyeon y ató la caja.»
- **Pregunta:** ¿Qué encadenó 이모 en su lista?
- **Opciones (correcta = B):**
  - A) Metió el kimchi, metió **galletas** y ató la caja. *(D2 — objeto: 과자 vs 라면)*
  - B) Metió el kimchi, metió el ramyeon y ató la caja. ✅
  - C) Metió el kimchi, metió el ramyeon y **abrió** la caja. *(D2 — colocación opuesta: 박스 풀다 vs 묶다; la cerró, no la abrió)*
  - D) Ató la caja, metió el ramyeon y **después** metió el kimchi. *(D1-lógico — orden imposible: no se mete comida en una caja ya atada)*
- **Pista 1:** `김치(를) 담다` = meter/empaquetar el kimchi · `라면` = ramyeon · `박스(를) 묶다 → 묶었어요` = atar la caja.
- **Pista 2:** `-고` (G019) encadena: `담고 → 넣고 → 묶었어요`. El pasado va SOLO en la última (`묶었어요`); las intermedias se quedan en `-고` (`담고`, no `담았고`). El orden lo decide la lógica (atar va al final), no la gramática.

**Candidato 5.5 — Los hotteok para el viaje en bus**
- **Línea (KO):** «호떡 식히고, 상자에 넣고, 버스에 실었어요.»
- **Traducción interna:** «Dejó enfriar los hotteok, los puso en la caja y los subió al autobús.»
- **Pregunta:** ¿Qué encadenó 이모 en su lista?
- **Opciones (correcta = A):**
  - A) Dejó enfriar los hotteok, los puso en la caja y los subió al autobús. ✅
  - B) Dejó enfriar los hotteok, los puso en la caja y los subió al **tren**. *(D3 — destino: 기차 vs 버스)*
  - C) Dejó enfriar los hotteok, los puso en **la bolsa** y los subió al autobús. *(D2 — objeto: 봉지 vs 상자)*
  - D) Puso los hotteok en la caja, los subió al autobús y **después** los dejó enfriar. *(D1-lógico — orden imposible: enfriar después de encajar y cargar)*
- **Pista 1:** `식히다 → 식히고` = dejar enfriar · `상자` = la caja · `(버스에) 싣다 → 실었어요` = cargar / subir (싣다 es ㄷ-irregular: ㄷ→ㄹ ante vocal).
- **Pista 2:** `-고` (G019) une «y luego»: `식히고 → 넣고 → 실었어요`. El tiempo vive UNA vez, en la cláusula final (`실었어요`, pasado de 싣다, ㄷ-irregular). Las intermedias se quedan en `-고` sin tiempo propio (`식히고`, no `식혔고`).

---

### §8.6 · SLOT 6 · La despedida en la puerta del mercado (FINAL) · creation (G039/G013 callback) + softReject trap

**Zona:** 4 (버스 정류장 / 시장 입구) · **Tipo:** Creación con fichas (drag-and-drop) · **Gramática foco:** G039 + callback G013

**Disparador:** el último bus asoma sus faros al final del callejón; 순자 이모 le da un empujoncito a 도윤 hacia ti y a ti hacia las fichas — «얼른, 버스 와. 도윤이 인사 좀 만들어 줘.» El jugador construye, con fichas, la despedida que el chico orgulloso no sabe decir, y se la pone en la boca.

**Mecánica:** toda la noche pediste favores con `-아/어 주세요` (G039) sin esfuerzo; la frase más difícil es un simple gracias en pasado (`그동안 고마웠어요`, G013). El jugador ensambla la línea con fichas; cada candidato trae sus **4 (o 3) fichas correctas + 3 distractoras sistemáticas**, interleaved en el array para que `correctOrder` quede genuinamente disperso: **[adiós-para-siempre]** — la trampa temática del nivel, un cierre sin regreso (`안녕히 계세요.` / `잘 있어요.`); **[presente]** — el mismo gracias sin terminar de agradecer (`고마워요`), del mismo largo que la ficha correcta (swap limpio, sin telegrafía de forma); **[partícula/inversión]** — partícula equivocada sobre el vocativo `이모` o la persona invertida del verbo. Al acertar, **도윤 repite la línea palabra por palabra**, mira a 이모, y ella le mete un 호떡 caliente en la mano para el bus: «가서, 머리 짧게 깎고 와. 자리 맡아 놓을게.» La cinemática de salida **cita textualmente** la despedida construida (se interpola el candidato del run; las cinco sobreviven en primera persona).

> ⚠️ **REGLA ESPECIAL — rechazo suave (motor de L2, ver §12):** la PRIMERA validación que contenga la ficha **[adiós-para-siempre]** no cuesta corazón. Los faros esperan; 순자 이모, sin reproche, en 반말 cálido. Reincidir = error normal (consume corazón). **Solo el distractor `[adiós-para-siempre]` dispara la línea-tesis;** los distractores `[presente]` y `[partícula/inversión]` son error normal desde el primer intento y caen en la **UI neutra de "lectura incorrecta"** estándar (nunca una réplica herida de NPC, nunca la línea del rechazo suave). SIN METALENGUAJE en pantalla: la palabra «pasado» solo existe en la Pista 2.

> **softRejectMessage (compartida, 순자 이모, 반말 cálido):** «야— 그건 영영 가는 인사잖아. 너 돌아올 거잖아.» — *Oye, ese es un adiós para siempre. Tú vas a volver.* La dispara solo la ficha **[adiós-para-siempre]**, y solo la 1.ª vez.

> **Nota de implementación para §12.1 (mapeo de `softRejectTiles`):** el array `tiles` es **interleaved** por candidato (las correctas NO van primero), de modo que `correctOrder` no es `[0,1,2,3]` en ninguno. La ficha **[adiós-para-siempre]** es siempre pieza extra (nunca en `correctOrder`); su índice es la única entrada de `softRejectTiles`, **disjunta de `correctOrder`** (invariante del motor `validateLevel`, escape-room.ts L88-89). Las otras dos distractoras ([presente], [partícula/inversión]) NO disparan el rechazo suave → error neutro. La detección de pertenencia a `softRejectTiles` se evalúa ANTES de los checks de orden. Cada distractora es un swap de una sola ficha del **mismo largo de superficie** que la correcta a la que sustituye (sin telegrafía de forma). Añadir en §12 el test `softRejectTiles ∩ correctOrder = ∅` para los cinco.

> **Nota de registro (locked):** `다녀오겠습니다` va en 합쇼체 fijo — la fórmula del recluta, «voy y vuelvo», NO un adiós final — mezclado con el `고마웠어요` en 해요체 cálido. El contraste de registro es intencional y bloqueado por el owner; la Pista 2 lo explicita para que el jugador no lo "corrija" a `다녀올게요`. El campo `korean`/`question` de cada candidato es la **pregunta del NPC** que precede a la construcción, no la frase-respuesta (que se reconstruye desde `correctOrder`).

**Candidato 6.1 — El gracias y la promesa de volver (la línea-tesis)**
- **NPC (`korean`):** `도윤아, 이모한테 할 말 없어?` · **`question` (ES):** «Doyun, ¿no tienes nada que decirle a la tía?»
- **Despedida correcta (KO):** `이모, 그동안 고마웠어요. 다녀오겠습니다.`
- **Traducción:** «Tía, gracias por todo este tiempo. Me voy… y vuelvo.»
- **`tiles` (array canónico, índices reales):** `[0]그동안` · `[1]고마웠어요.` · `[2]이모,` · `[3]안녕히 계세요.` · `[4]다녀오겠습니다.` · `[5]고마워요.` · `[6]이모를`
- **`correctOrder`:** `[2, 0, 1, 4]` → `이모, 그동안 고마웠어요. 다녀오겠습니다.`
- **`softRejectTiles`:** `[3]` (`안녕히 계세요.` — adiós-para-siempre)
- **Distractores normales:** `[5] 고마워요.` *(presente — la noche de favores ya cumplida pide pasado)* · `[6] 이모를` *(partícula — un vocativo de llamada no lleva `을/를`: «이모를» es agramatical como apelación)*
- **Pista 1:** `그동안` = todo este tiempo (la noche entera, ya cerrada) · `다녀오다` = ir y volver (lo que dice quien se marcha pero regresa).
- **Pista 2:** Lo ya terminado lleva `-았/었-` → `고마웠어요`, no `고마워요`. `다녀오겠습니다` («iré y volveré», fórmula fija del recluta) promete la vuelta; no se cambia por `다녀올게요`.

**Candidato 6.2 — El gracias por la comida (los diez años de 호떡)**
- **NPC (`korean`):** `버스 오기 전에, 이모한테 한마디 해.` · **`question` (ES):** «Antes de que llegue el autobús, dile algo a la tía.»
- **Despedida correcta (KO):** `이모, 그동안 밥 챙겨 줘서 고마웠어요.`
- **Traducción:** «Tía, gracias por haberme dado de comer todo este tiempo.»
- **`tiles`:** `[0]밥 챙겨 줘서` · `[1]이모,` · `[2]잘 있어요.` · `[3]그동안` · `[4]고마웠어요.` · `[5]고마워요.` · `[6]밥 챙겨 주는`
- **`correctOrder`:** `[1, 3, 0, 4]` → `이모, 그동안 밥 챙겨 줘서 고마웠어요.`
- **`softRejectTiles`:** `[2]` (`잘 있어요.` — adiós-para-siempre: «quédate bien», cierre sin regreso)
- **Distractores normales:** `[5] 고마워요.` *(presente — la década ya cumplida pide pasado)* · `[6] 밥 챙겨 주는` *(forma equivocada: el modificador `-는` deja la frase colgada sin enlazar la causa; se agradece POR algo → `-아/어 줘서`, no `-는`)*
- **Nota de diseño:** activa el TWIST sin nombrarlo — `밥 챙겨 주다` es literalmente cómo 이모 lo recogió hambriento hace diez años. El favor G039 de toda la noche, vuelto del revés.
- **Pista 1:** `밥(을) 챙기다` = encargarse de que alguien coma · `-아/어 줘서` = «por haberlo hecho (favor), y por eso…».
- **Pista 2:** Para dar las gracias POR un favor: `-아/어 줘서 고마웠어요` (G039 + causa). El favor ya cumplido → pasado `고마웠어요` (G013), no `고마워요`.

**Candidato 6.3 — El «volveré» como núcleo (la fórmula del recluta)**
- **NPC (`korean`):** `이모 얼굴 보고 가야지.` · **`question` (ES):** «Tienes que mirarle la cara a la tía antes de irte.»
- **Despedida correcta (KO):** `이모, 잘 다녀오겠습니다. 그동안 고마웠어요.`
- **Traducción:** «Tía, me voy y vuelvo sano y salvo. Gracias por todo este tiempo.»
- **`tiles`:** `[0]잘 다녀오겠습니다.` · `[1]그동안 고마웠어요.` · `[2]안녕히 계세요.` · `[3]이모,` · `[4]그동안 고마워요.` · `[5]이모가` · `[6]잘 다녀오세요.`
- **`correctOrder`:** `[3, 0, 1]` → `이모, 잘 다녀오겠습니다. 그동안 고마웠어요.` *(3 fichas correctas — `잘 다녀오겠습니다.` y `그동안 고마웠어요.` son unidades fijas agrupadas; `잘` queda blindado dentro de su colocación, sin flotar suelto)*
- **`softRejectTiles`:** `[2]` (`안녕히 계세요.` — su opuesto exacto, cara a cara con `다녀오겠습니다`)
- **Distractores normales:** `[4] 그동안 고마워요.` *(presente — mismo largo que la ficha correcta `그동안 고마웠어요.`, swap limpio)* · `[6] 잘 다녀오세요.` *(inversión de persona: `-(으)세요` se lo dices a OTRO que se va; aquí el que se va es él → `다녀오겠습니다`; «잘 다녀오세요» se lo diría 이모 a él, no al revés)*
- **Nota de diseño:** `다녀오겠습니다` PRIMERO para que el contraste con `안녕히 계세요` sea frontal — misma situación (alguien parte), sentidos opuestos: vuelvo / no vuelvo.
- **Pista 1:** `잘 다녀오다` = ir y volver bien (lo que dice quien se va de viaje y regresa) · `그동안` = todo este tiempo, ya cumplido.
- **Pista 2:** `다녀오겠습니다` lo dice EL QUE SE VA (1.ª persona, fórmula fija); `다녀오세요` lo dice quien SE QUEDA, al que parte. Y el gracias va en pasado: `고마웠어요` (G013), no `고마워요`.

**Candidato 6.4 — El gracias por haberlo criado (el corazón del twist)**
- **NPC (`korean`):** `도윤아. 마지막인데… 진짜 할 말 없어?` · **`question` (ES):** «Doyun. Es lo último… ¿de verdad no tienes nada que decir?»
- **Despedida correcta (KO):** `이모, 키워 주셔서 고마웠어요. 다녀오겠습니다.`
- **Traducción:** «Tía, gracias por haberme criado. Me voy y vuelvo.»
- **`tiles`:** `[0]키워 주셔서` · `[1]이모,` · `[2]다녀오겠습니다.` · `[3]잘 있어요.` · `[4]고마웠어요.` · `[5]키워 주세요.` · `[6]고마워요.`
- **`correctOrder`:** `[1, 0, 4, 2]` → `이모, 키워 주셔서 고마웠어요. 다녀오겠습니다.`
- **`softRejectTiles`:** `[3]` (`잘 있어요.` — adiós-para-siempre)
- **Distractores normales:** `[5] 키워 주세요.` *(¡G039 imperativo! «críame, por favor» — la trampa más rica: la misma estructura de favor que pidió toda la noche, pero la crianza YA ocurrió → se agradece, no se pide)* · `[6] 고마워요.` *(presente — la crianza es pasado cumplido)*
- **Nota de diseño:** el twist dicho en voz alta. `키우다` («criar») afirma la familia hallada SIN decir «madre»/«hijo» — understatement. El honorífico `주셔서` (주다→주시다) es correcto: el sujeto del favor es 이모, la mayor. ÚNICO candidato con `-시-`.
- **Pista 1:** `키우다` = criar, hacer crecer · `-아/어 주셔서` = «por haber tenido el detalle de…» (con respeto al mayor).
- **Pista 2:** `키워 주세요` PIDE el favor (G039 imperativo: «críame»); `키워 주셔서 고마웠어요` AGRADECE el favor ya hecho → pasado (G013). El `-시-` (`주셔서`) marca respeto a 이모, no es tiempo verbal.

**Candidato 6.5 — La promesa de volver con el pelo corto (eco del outro)**
- **NPC (`korean`):** `호떡 식기 전에 빨리 말해!` · **`question` (ES):** «¡Díselo rápido, antes de que se enfríe el 호떡!»
- **Despedida correcta (KO):** `이모, 다녀오겠습니다. 그동안 정말 고마웠어요.`
- **Traducción:** «Tía, me voy y vuelvo. Gracias de verdad por todo este tiempo.»
- **`tiles`:** `[0]다녀오겠습니다.` · `[1]정말 고마웠어요.` · `[2]이모,` · `[3]그동안` · `[4]안녕히 계세요.` · `[5]정말 고마워요.` · `[6]이모한테`
- **`correctOrder`:** `[2, 0, 3, 1]` → `이모, 다녀오겠습니다. 그동안 정말 고마웠어요.`
- **`softRejectTiles`:** `[4]` (`안녕히 계세요.` — el adiós sin vuelta; pero 이모 le guarda el sitio, la puerta NO se cierra)
- **Distractores normales:** `[5] 정말 고마워요.` *(presente — mismo largo que la correcta `정말 고마웠어요.`, swap limpio; la noche ya pasó)* · `[6] 이모한테` *(partícula — un vocativo de llamada no lleva `한테`: «이모한테» abriría un complemento «a la tía [le hice X]», deshace la apelación directa `이모,`)*
- **Nota de diseño:** cierra el pool con `정말` intensificando — la versión más completa, gemela del 호떡 que 이모 le mete en la mano. Engancha con la promesa del outro («vuelve con el pelo corto, te guardo el sitio»): `다녀오겠습니다` ya contiene el «volveré» que ella le devuelve.
- **Pista 1:** `정말` = de verdad, de corazón · `다녀오겠습니다` = me voy y regreso (fórmula del que vuelve).
- **Pista 2:** `정말` (intensificador) no cambia el tiempo: «gracias DE VERDAD» por lo ya vivido sigue siendo `고마웠어요` (G013), no `고마워요`. `이모,` es apelación directa (sin partícula); `이모한테` la convertiría en complemento.

---

> **Tabla de verificación del pool del Slot 6 (invariante del motor + trampas):**
>
> | # | correctOrder | answer (join) | softRejectTiles (forever) | distractor presente | distractor partícula/inversión | ∩=∅ |
> |---|---|---|---|---|---|---|
> | 6.1 | [2,0,1,4] | 이모, 그동안 고마웠어요. 다녀오겠습니다. | [3] 안녕히 계세요. | [5] 고마워요. | [6] 이모를 | ✅ |
> | 6.2 | [1,3,0,4] | 이모, 그동안 밥 챙겨 줘서 고마웠어요. | [2] 잘 있어요. | [5] 고마워요. | [6] 밥 챙겨 주는 | ✅ |
> | 6.3 | [3,0,1] | 이모, 잘 다녀오겠습니다. 그동안 고마웠어요. | [2] 안녕히 계세요. | [4] 그동안 고마워요. | [6] 잘 다녀오세요. | ✅ |
> | 6.4 | [1,0,4,2] | 이모, 키워 주셔서 고마웠어요. 다녀오겠습니다. | [3] 잘 있어요. | [6] 고마워요. | [5] 키워 주세요. | ✅ |
> | 6.5 | [2,0,3,1] | 이모, 다녀오겠습니다. 그동안 정말 고마웠어요. | [4] 안녕히 계세요. | [5] 정말 고마워요. | [6] 이모한테 | ✅ |
>
> Confirmado: cada índice de `softRejectTiles` ∉ `correctOrder` (invariante `validateLevel`, escape-room.ts L88-89); `correctOrder` disperso en los cinco (nunca `[0,1,2,3]`); cada distractora es un swap de una sola ficha del mismo largo de superficie (sin telegrafía de forma); cada candidato lleva exactamente una trampa-presente (error neutro), una trampa-adiós-para-siempre (rechazo suave) y un error de partícula/inversión — las tres inequívocamente erróneas, sin «2 respuestas válidas». Cero features nuevas de motor: reutiliza `softRejectTiles`/`softRejectMessage` de L2.

---

## §9 · Cosméticos del nivel 3

Tema del set: **«달빛시장의 불빛»** (Las luces del mercado de la luna)

| Tier | Cómo se desbloquea | Cosmético | Descripción visual |
|---|---|---|---|
| 🟢 Común | Completar el nivel (incluso usando Pista 2) | **Fondo «네온 골목»** | El callejón del mercado de frente bajo el neón nocturno: planchas humeantes a ambos lados como islas de ámbar, carteles rosa/cian/verde como halos difuminados, el asfalto mojado devolviéndolos partidos. Paleta azul-violeta + ámbar; vapor en dos capas de 1px para profundidad |
| 🔵 Raro | Completar **sin usar Pista 2 en ningún puzzle** | **Marco «호떡 봉지»** | Marco de bolsa de papel de estraza (el papel manchado de aceite del 호떡), arrugado en los bordes, con sellos de tinta del mercado en las esquinas: una plancha (철판), un cucharón, un 호떡 y un palillo, cada uno legible a 16×16 |
| 🟣 Épico | Sin Pista 2 + run < 10 min (600 s) | **Avatar animado «시장 고양이»** | El gato del mercado sentado sobre una caja de cartón junto a la plancha, a resguardo del frío de la calle. 3 frames: parpadeo lento, golpe de cola — y cada pocos ciclos, lame la pata y mira el vapor que sube. Una mancha de neón rosa cruzándole el lomo, nunca encima de los ojos |
| 🟡 Legendario | 3 runs consecutivos sin game over (sin Pista 2 en ningún run de la racha) | **Set completo + título «막차 손님»** | El huésped del último bus: avatar con el 호떡 caliente en la mano (el que 이모 le puso «para el camino») envuelto en su servilleta de papel; marco de neón rosa-verde con guirnalda de bombillas del arco del mercado; fondo = el plano final, el bus arrancando bajo el neón con 이모 y 하나 despidiéndose en el andén y la plancha echando vapor sola. La calidez del regreso prometido, para quien se lo ganó |

**Notas de producción del set:**
- El fondo común y el fondo legendario comparten paleta (azul-violeta / ámbar / rosa-verde neón) para que el set se lea como familia.
- El título «막차 손님» no se traduce en la UI (consistente con «민박 손님» del nivel 1 y «마흔아홉 번째 손님» del nivel 2); el tooltip glosa: *El huésped del último autobús*.
- El avatar épico reutiliza el sprite del gato del nivel (2 frames en escena + 1 frame extra exclusivo del cosmético: la lamida de pata + mirada al vapor) — coherente con el presupuesto de §11.
- **id Legendario distinto para evitar colisión con L1/L2:** `cosmetic-set-complete-03` (los niveles previos usan `-01`/`-02`). Detalle de ids en §12.6.

---

## §10 · Lista de assets

Presupuesto: el nivel 1 embarcó 27 archivos; objetivo aquí **≤22 imágenes embarcadas** (mismo techo que el nivel 2). La cuenta de abajo cierra en 22 (con el opcional incluido) y respeta el techo aunque se recorte el opcional (quedarían 21). Todos los assets viven bajo `munbeop/public/escape-room/level-03/` con la misma estructura de carpetas de los niveles 1-2 (`rooms/`, `objects/`, `cosmetics/`).

#### Imágenes pixel art (22)

**Escenas principales (4) — 320×240:**
- [ ] `rooms/room-01-hotteok.png` — puesto de 순자 이모 (plancha, vapor, mochila secuestrada, **estado mercado abierto**)
- [ ] `rooms/room-02-meokja.png` — callejón de la comida, puesto de 하나 (떡볶이, 어묵, taburetes)
- [ ] `rooms/room-03-manmulsang.png` — callejón del bazar (mercancía colgada, mostrador de dos grupos, **estado pre-regalo**)
- [ ] `rooms/room-04-busstop.png` — parada del bus / entrada del mercado, **estado «el bus todavía no»**

**Variantes de escena (3) — 320×240:**
- [ ] `rooms/room-01-hotteok-closing.png` — estado B «empezando a cerrar» (persiana vecina a medias, dos neones apagados) — el fondo de la revisita del Slot 5
- [ ] `rooms/room-03-manmulsang-wrapped.png` — estado B «regalo elegido» (objeto envuelto al frente del mostrador) — swap en pantalla tras el Slot 3
- [ ] `rooms/room-04-busstop-bus.png` — estado B «el último bus» (bus entrando por la izquierda, ventanillas amarillas) — fondo del `farewellImage`

**Cinemáticas (2) — 320×240:**
- [ ] `rooms/cinematic-intro.png` — los escalones al mercado bajo el neón, el cartel 달빛시장, la mochila al hombro en primer plano
- [ ] `rooms/cinematic-outro.png` — **farewellImage**: el bus arrancando bajo el neón, 도윤 rapado en la ventanilla, 이모 y 하나 en el andén con la mano levantada, la plancha echando vapor sola, el neón espejado en el asfalto (spec completa en §3)

**Close-ups (6) — 128×128:**
- [ ] `objects/obj-hotteok.png` — el 호떡 en la plancha, azúcar derretido burbujeando
- [ ] `objects/obj-backpack.png` — tu mochila bajo el mostrador (sembrada para el outro)
- [ ] `objects/obj-tteokbokki.png` — la olla de 떡볶이 borboteando (Zona 2)
- [ ] `objects/obj-eomuk.png` — el 어묵 en el caldo (Zona 2)
- [ ] `objects/obj-gift-wrapped.png` — el regalo envuelto en papel sobre el mostrador (Zona 3, estado B)
- [ ] `objects/obj-market-gate.png` — el arco de entrada del mercado, rótulo de neón (Zona 4)

> **Decisión de presupuesto (texto KO sorteado en la UI, no horneado):** los Slots 2, 4 (completion) y 1, 3, 5 (selection) renderizan su coreano sorteado en la UI del panel de puzzle (Neodgm ≥ 16px), NO en arte horneado — igual que L2 hizo con `obj-diary-page.png`. Por eso NO hay un close-up por candidato; los close-ups de arriba son solo objetos de flavor/disparo. Esto mantiene 1 imagen por objeto sirviendo a los 5 candidatos.

**Sprites en escena (1):**
- [ ] `objects/sprite-cat-strip.png` — el gato del mercado, 2 frames (sentado / cola en movimiento), ~32×24 por frame

**Cosméticos (5):**
- [ ] `cosmetics/cosmetic-bg-neonalley.png` — 🟢 fondo «네온 골목»
- [ ] `cosmetics/cosmetic-frame-hotteokbag.png` — 🔵 marco «호떡 봉지» con los sellos del mercado en las esquinas
- [ ] `cosmetics/cosmetic-avatar-marketcat.png` — 🟣 avatar «시장 고양이» (frame de preview estático)
- [ ] `cosmetics/cosmetic-avatar-marketcat-strip.png` — strip 3 frames (parpadeo, cola, lamida + mirada al vapor). **Derivado en pipeline del gato de la Zona 1 + 1 frame extra**, no un sprite de gato dibujado de cero; se embarca como asset cosmético propio porque el contexto (caja de cartón, neón en el lomo) y los 3 frames difieren del `sprite-cat-strip.png` de escena. Confirmar en producción que se genera por pipeline para no abrir un tercer set de arte de gato.
- [ ] `cosmetics/cosmetic-set-complete-03.png` — 🟡 set completo «막차 손님» (avatar + marco + fondo del plano final). **id distinto de L1/L2** (`-03`).

**Assets de pipeline (NO se embarcan — se hornean en las escenas):**
- [ ] `tile-neon-sign.png` — strip 2 estados (encendido / apagado), ~16×24; el muro de carteles de neón del fondo se compone repitiendo el tile en generación (recorte canónico). Trazos de hangul sugeridos, glow sin glifo legible (regla de arte transversal).
- [ ] `tile-shutter.png` — strip 2 estados (persiana alta / a medio bajar), ~32×40; el reloj diegético del nivel (§6) se renderiza bajando persianas vecinas en cada zona reutilizando el tile.
- Overlays de vapor (1px) y de neón espejado en el asfalto: capas del pipeline de escena, no archivos runtime.

> **Conteo (≤22):** 4 escenas + 3 variantes + 2 cinemáticas + 6 close-ups + 1 `sprite-cat-strip` + 5 cosméticos = **21**. Hay margen de 1 para un close-up opcional (p. ej. `obj-bus-ticket.png`, el billete del último bus, si se quiere reforzar la urgencia) sin pasar de 22. Los assets de pipeline (`tile-neon-sign`, `tile-shutter`, overlays) NO cuentan: se hornean. El strip cosmético del gato cuenta como cosmético (1 de los 5), no como un sprite de gato extra, porque se deriva del de escena en el pipeline.

#### Audio del nivel 3

**Voces NPC (TTS coreano — TRES voces consistentes, una por personaje):** a diferencia de L1/L2 (una sola voz), este nivel tiene tres NPC con líneas habladas. Recomendación: **여성 60대 cálida** para 순자 이모 (el grueso), **남성 joven tímida** para 도윤 (sobre todo el Slot 6 y el outro), **여성 joven rápida** para 하나 (Slot 2). Líneas:

- [ ] 1 · `voiceIntro` (이모): `어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요.`
- [ ] 2 · Línea-tesis (이모, Slot 1, al colgar la mochila): `잠깐만 빌릴게요. 도윤이 좀 도와줘요.`
- [ ] 3-7 · Slot 1 (이모): los 5 favores del pool (uno por candidato)
- [ ] 8 · Reacción de acierto Slot 1 (이모): `옳지! 역시 손이 빠르네. 자, 다음.`
- [ ] 9 · Frame del Slot 2 (이모): `도윤이가 하나 좋아하는 거 몰라요. 가서 좀 알아봐 줘요.`
- [ ] 10 · Acierto Slot 2 (하나): `아, 도윤이가 보냈구나… 그 녀석. …귀엽네.`
- [ ] 11-15 · Slot 3 (이모): los 5 regateos del pool (la línea KO de cada candidato)
- [ ] 16 · Acierto Slot 4 (이모): `맞아. 우리 도윤이가 그래.`
- [ ] 17 · **Beat fijo post-Slot-4 — EL GIRO** (이모, `ScriptedBeat.voiceLine`): `도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요. 그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요.`
- [ ] 18-22 · Slot 5 (이모): las 5 listas del pool (la línea KO de cada candidato)
- [ ] 23 · Acierto Slot 5 (이모): `그래, 그거 다 챙기고… 이제 마지막이네.`
- [ ] 24 · Disparador Slot 6 (이모): `얼른, 버스 와. 도윤이 인사 좀 만들어 줘.`
- [ ] 25 · **Rechazo suave Slot 6** (이모, `softRejectMessage`): `야— 그건 영영 가는 인사잖아. 너 돌아올 거잖아.`
- [ ] 26-30 · Slot 6 (도윤): las 5 despedidas del pool, repetidas «con la voz entera» (una por candidato; es la línea que la cinemática cita)
- [ ] 31 · Outro, el 호떡 (이모): `버스에서 먹어. 식기 전에.`
- [ ] 32 · `voiceOutro` (이모): `고마워요. 진짜 도와줬어요. 야 도윤아, 머리 짧게 깎고 와. 자리 빼놓을게!`

> **Sin voz, a propósito:** las réplicas de flavor en pantalla de los hotspots cosméticos; la tarjeta final («제일 어려운 말은 제일 따뜻한 말이었어요.»); la última narración en negro. La `narrative` del ScriptedBeat (los párrafos ES) NO se vocaliza — solo la `voiceLine` (línea 17) lleva voz, como en L2.

**Ambient (4 loops, 1 por zona + 1 variante de cierre):**
- [ ] `ambient-hotteok.ogg` — chisporroteo de plancha + bullicio de mercado cercano + radio de trot lejana
- [ ] `ambient-meokja.ogg` — el callejón más ruidoso: caldo borboteando, voces, una moto de reparto
- [ ] `ambient-manmulsang.ogg` — el rincón más íntimo: zumbido de bombilla, mercado amortiguado al fondo
- [ ] `ambient-busstop.ogg` — el borde del mercado: bullicio que se aleja, frío de calle, motor de bus en ralentí (estado B)

**SFX (8 nuevos):**
- [ ] `sfx-griddle-sizzle.ogg` — **EL asset del nivel**: el chisporroteo del 호떡 en la plancha (loopeable corto, también stinger al voltear)
- [ ] `sfx-shutter.ogg` — persiana metálica bajando (el reloj diegético + el cierre del mercado en el outro)
- [ ] `sfx-bus-air.ogg` — el suspiro de aire comprimido del bus al arrancar (clímax del outro)
- [ ] `sfx-coin-haggle.ogg` — monedas / regateo (Zona 3, acierto del Slot 3)
- [ ] `sfx-paper-wrap.ogg` — papel de estraza envolviendo el regalo / el 호떡
- [ ] `sfx-neon-buzz.ogg` — zumbido de neón parpadeante (⚪ carteles, bombilla del bazar)
- [ ] `sfx-market-bell.ogg` — la campanilla de un puesto / timbre de cierre
- [ ] `sfx-cat-meow.ogg` — maullido corto (⚪ gato)

**Reusados de niveles previos (no se producen):** `sfx-correct.ogg`, `sfx-wrong.ogg`, `sfx-select.ogg`, `sfx-paper-rustle.ogg`.

#### UI nueva

- Ninguna pieza de UI nueva de motor. El **rechazo suave** del Slot 6 reutiliza el panel neutro sin pérdida de corazón ya construido para L2 (§11/§12.1 de L2), igual que la **cita interpolada `{farewell}`** en la cinemática de salida y el render de texto KO sorteado en el panel de puzzle. Todo lo demás (panel de puzzle, pistas, tiers, game over, swaps de escena) se hereda del motor de los niveles 1-2.

---

## §11 · Estimación de producción del nivel 3

| Fase | Horas |
|---|---|
| Escritura de puzzles + revisión gramática | cubierto en este dossier |
| Arte (≤22 assets; pipeline de los niveles 1-2 reusable como base) | 20-30 h |
| Audio: TTS ~32 líneas en 3 voces + 4 loops + 8 SFX | 6-9 h |
| Código: seed `level-03.ts` + 1 `ScriptedBeat` (el giro) + `softRejectTiles`/`softRejectMessage` del Slot 6 + interpolación `{farewell}` + swaps de escena + flip de `registry.ts` a `playable` | **2-5 h** (mucho menor que L2: cero features nuevas de motor; ver §12) |
| Integración + testing (validateLevel, soft-reject, beat, outro token, registry playable) | 8-12 h |
| **Total nivel 3** | **~36-56 h** (por debajo de L2 gracias a la reutilización total del motor) |

> El renglón de código es deliberadamente bajo: a diferencia de L2 (que tuvo que **añadir** `softRejectTiles`, el estado `'soft-reject'` en el store, `ScriptedBeat` y la interpolación `{farewell}`), el Nivel 3 solo **rellena datos** sobre esas piezas ya embarcadas. Ver §12.

---

## §12 · Notas de motor

### §12.1 El Nivel 3 necesita CERO features de motor nuevas

Este es el argumento de venta del nivel, y es literal. Contraste explícito con el Nivel 2 (que sí añadió mecánica):

| Pieza | Nivel 2 (la introdujo) | Nivel 3 (la reutiliza, sin tocar código) |
|---|---|---|
| `selection` / `completion` / `creation` | ya existían (nivel 1) | Slots 1/3/5, 2/4, 6 — solo datos |
| `ScriptedBeat` (`afterSlotId`, `voiceLine`, `narrative`) | **añadido en L2** (última entrada del diario, segunda taza) | el GIRO post-Slot-4 (`afterSlotId: 'slot-4'`) — solo un objeto en `scriptedBeats[]` |
| `softRejectTiles` / `softRejectMessage` + estado `'soft-reject'` en el store | **añadido en L2** (Slot 6, trampa de presente) | Slot 6, trampa de adiós-para-siempre — solo datos en el candidato |
| Interpolación `{farewell}` en el `outro` | **añadida en L2** | la cita textual del beat 1 del outro — mismo token, mismo render |
| Swaps de escena en pantalla | ya en L1/L2 | 호떡 (cerrando), 만물상 (regalo envuelto), 버스 정류장 (bus) — solo variantes de arte |

No hay **ni una sola** extensión de dominio, store, `rules.ts` ni UI. Donde L2 documentó en su §12.1 una extensión acotada de `answerCreation` para el tercer estado `'soft-reject'`, aquí ese estado **ya existe** y solo se alimenta con datos. El único trabajo de código es escribir el seed y registrarlo como jugable.

### §12.2 Seed y registro

- **Archivo del seed:** `munbeop/app/seed/escape-room/level-03.ts`, exportando un `Level` con `id: 'level-03'`, `topikLevel: 2`, `grammarCodes: ['G039','G038','G053','G021','G019','G013']`, 4 `rooms`, 6 `slots` (`candidates.length === 5` en cada uno), 1 entrada en `scriptedBeats` (`afterSlotId: 'slot-4'`) y `rewards` con los 4 tiers.
- **`rules`:** `{ maxErrors: 2, epicTimeThresholdSeconds: 600, legendaryCleanRunsRequired: 3 }`.
- **Registro:** `munbeop/app/seed/escape-room/registry.ts` ya tiene la entrada `level-03` con `status: 'coming-soon'` (líneas 63-74) y su `tagline` bloqueada. Al integrar: **importar `LEVEL_03` y cambiar el bloque a la forma jugable** — `status: 'playable'`, `level: LEVEL_03` (espejo exacto del bloque `level-02`, líneas 53-62). La `tagline`/`title`/`mood`/`cover` del stub ya son canónicas; no se reescriben.

### §12.3 Cita textual de la despedida en la cinemática final

El texto del beat 1 del outro contiene el token literal `{farewell}` (llave simple, una sola vez por locale). En render se sustituye por la frase correcta del candidato sorteado del Slot 6: `correctOrder.map(i => tiles[i]).join(' ')` — la misma frase que el jugador construyó y que 도윤 repitió. Implementación idéntica a la de L2 (presentación pura; el shape `Level.outro: LocalizedString` no cambia). Tests heredados: el outro de cada locale contiene `{farewell}` exactamente una vez; el join produce frase natural para los 5 candidatos del Slot 6.

### §12.4 El ScriptedBeat del giro como contenido NO-slot

El beat post-Slot-4 (도윤 no es hijo de sangre) NO es un puzzle: es una escena guionada idéntica en todos los runs, con la misma estructura `{ afterSlotId, voiceLine, narrative }` que los beats de L2. `voiceLine` = la línea KO de 이모 (TTS, línea 17 de §10); `narrative` = los párrafos ES (no se vocalizan). Ningún beat aguas abajo (el clímax, el outro) depende del candidato sorteado de ningún slot anterior (regla editorial 5).

### §12.5 Randomización diegética

No hay motor nuevo: el sorteo es el `shuffle` estándar de 1 candidato por slot. Lo diegético es pura presentación — el cierre del mercado contra el último bus (el reloj de persianas bajando, §6) es la coartada narrativa del sorteo, igual que la lluvia lo era en L2. El texto KO sorteado de cada slot se renderiza en la UI del panel de puzzle (Neodgm ≥ 16px), no en arte horneado, así 1 close-up sirve a los 5 candidatos.

### §12.6 TTS sugerido + ids de cosmético

- **TTS:** proveedor por defecto del doc maestro. A diferencia de L1/L2 (una voz), aquí **tres voces** consistentes (이모 / 도윤 / 하나, ver §10). Grabar cada voz en su propia sesión para consistencia; velocidad natural de mercado (~1.0×, no el ~0.9× contemplativo de L2). Coste estimado ≤ $0.60.
- **ids de cosmético (sin colisión con L1/L2):** `cosmetic-bg-neonalley`, `cosmetic-frame-hotteokbag`, `cosmetic-avatar-marketcat`, `cosmetic-avatar-marketcat-strip`, **`cosmetic-set-complete-03`** (el Legendario, sufijo `-03` distinto de los niveles previos). Los `Reward.id` de persistencia deben llevar el prefijo de nivel (`l3-` o similar) para no chocar con desbloqueos de L1/L2.

### §12.7 Flags de verificación (bloquean producción, no diseño)

- [ ] **Revisión nativa del coreano (wife review):** las 30 líneas testeadas (5 por slot) + las líneas fijas de NPC + el `voiceLine` del giro. Foco en (a) naturalidad callejera del 해요체 de mercado, (b) que el Slot 4 no tenga «2 respuestas válidas» (el aviso de L2/Step 15), (c) ortografía de `물어보세요` cerrado vs. los `보세요` separados (§8.2 nota 2.2), (d) que `다녀오겠습니다` / `안녕히 계세요` / `잘 있어요` se sientan como el contraste vuelvo/no-vuelvo que el diseño asume.
- [ ] **`completion` y espacios internos (Slots 2 y 4):** decidir si el motor normaliza espacios antes de comparar (§8.2 ⚙️). Si NO se implementa, confirmar que las `answer` canónicas (`물어보세요` cerrado; `먹어 보세요`/`가 보세요`/`시켜 보세요`/`마셔 보세요` separados; los cinco `-지만` sin espacio) coinciden letra a letra con lo que un jugador nativo teclearía. Es la única fuente de falso-negativo plausible del nivel.
- [ ] **`softRejectTiles ∩ correctOrder = ∅` en los 5 candidatos del Slot 6:** test unitario en `tests/unit/escape-room/` (heredado de L2). La tabla de §8.6 ya lo verifica a mano; el test lo blinda.
- [ ] **`{farewell}` exactamente una vez por locale** en el `outro`; join natural para los 5 candidatos del Slot 6 (test heredado de L2).
- [ ] **Legibilidad de carteles de neón a 320×240:** trazos de hangul SUGERIDOS, ilegibles; el texto real solo en close-ups/UI (Neodgm ≥ 16px). Revisar a zoom 1× (regla de arte transversal).
- [ ] **El plano final NO esconde nada:** a diferencia del farewellImage de L2 (la segunda sombra secreta), aquí NO debe haber easter egg oculto ni segunda sombra. Verificar que el `cinematic-outro.png` es una despedida a plena luz de neón, sin elemento que premie una segunda run buscando un secreto (regla editorial 2; el «descubrimiento» de la segunda run es temático, no visual: el 호떡 siempre fue el de ella).
- [ ] **`registry.ts` flip a `playable`:** confirmar que tras importar `LEVEL_03` y cambiar `status`, el nivel aparece jugable y que `tagline`/`cover`/`mood` del stub no se han alterado.

### §12.8 Resumen de motor (una línea para el changelog)

> Nivel 3 = **100% contenido sobre motor maduro.** Cero features nuevas: reutiliza `selection`/`completion`/`creation` + `ScriptedBeat` + `softReject` + interpolación `{farewell}`, todo embarcado en el Nivel 2. El único código es el seed `level-03.ts` y el flip de `registry.ts` a `playable`.
