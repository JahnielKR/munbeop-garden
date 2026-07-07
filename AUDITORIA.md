# Auditoría de Munbeop Garden — tercera pasada (2026-07-06)
_Stack: Nuxt 4 SPA (`ssr:false`), Vue 3, Pinia, Supabase (anon + RLS, cuentas obligatorias), i18n 8 locales, Vitest ~7.300 tests, pnpm · Auditorías previas: 2026-06-18, 2026-06-19, 2026-06-28 (pass 1 y 2)._

> Auditoría multi-agente (48 agentes: 3 verificando la auditoría previa, 11 lentes de búsqueda, verificación adversarial de cada hallazgo importante). Todos los hallazgos 🟡 de este informe **sobrevivieron un intento activo de refutación** con traza de código independiente. Anclado al código actual (post-PRs #128–#152).

## Veredicto general

El proyecto está en su **mejor estado histórico**: los 9 puntos "Ahora/Próximo" de la auditoría de junio están **resueltos y verificados en código** (loop de práctica resiliente, seeds lazy por nivel, import atómico, a11y estructural, captura de errores first-party), el coreano sigue impecable, RLS está completo en las 12 tablas, y la paridad i18n es **perfecta** (0 claves faltantes en 8 locales, 2.890 llamadas `L()` correctas). **No hay ningún hallazgo crítico nuevo.** Lo que queda es de segunda generación: las **features más nuevas (Sentence Garden, escape room) se saltaron disciplinas que el resto del código ya sigue** (resiliencia de writes, anuncios a11y, lazy-loading), el mecanismo delete-then-upsert del adapter sigue siendo la raíz de varios riesgos de pérdida de datos bajo red inestable, y el build de producción de Vercel **no usa el lockfile que CI validó**. Para "acabar la plataforma" el gap grande no es técnico sino de contenido y decisiones: niveles 4–10 del escape room, reviews nativas pendientes, PWA y monetización diferidas.

## Lo que está bien hecho (verificado, para calibrar)

- **Los 9 fixes de la auditoría de junio están bien hechos** — verificados uno a uno contra el código (ver "Modo comparación" abajo). El patrón de `usePractice.persistEntry` (bail sin avanzar + retry + toast) es ejemplar.
- **Seguridad de base sólida:** RLS habilitado y con políticas por operación (USING + WITH CHECK, DELETE incluido) en las 12 tablas; cero `.from()` fuera del adapter; cero `v-html` con contenido externo; sin open redirects; tipos de DB al día con las 9 migraciones.
- **i18n de primera:** paridad estructural perfecta en los 8 JSON (incluidos los grupos nuevos: sentence-garden, practice-help, game-over, auth); las 603 claves estáticas `t()` existen todas; las 2.890 llamadas `L()` del seed tienen los 8 idiomas en el orden correcto; cero strings hardcodeadas en templates.
- **Audio bien gestionado:** los 6 composables de audio manejan rechazos de `play()`, pool de SFX acotado, canales de voz single-instance, fades cancelables. (El único leak es el ambient del escape room, abajo.)
- **No-god-files se cumple:** los archivos grandes (AccountMenu 553, EscapeRoom 548, supabase.ts 532) son cohesivos — mayormente CSS scoped u orquestación fina, no lógica enredada.
- **Los assets pesados no se precargan:** los 1.034 clips .ogg se piden bajo demanda; la música de welcome está detrás de un gesto; los locales UI son lazy.
- **El legacy de la raíz del repo NO es basura:** `index.html`/`service-worker.js` de la raíz son el deploy **vivo** de GitHub Pages (v2.22) en otro origen — no puede interferir con Vercel y **no hay que borrarlo** sin decidir antes qué hacer con esa URL.

## Hallazgos priorizados

### 🔴 Críticos

**Ninguno.** La verificación adversarial no confirmó ningún fallo de seguridad explotable de forma directa, pérdida de datos incondicional ni rotura del flujo central.

### 🟡 Importantes

**Resiliencia de datos (el cluster más urgente — casi todo es barato):**

- **`log.setReviewState` sin rollback ni catch, y reescribe el diario completo con delete-then-upsert** — `app/stores/log.ts:81-83` muta y hace `storage.write(log, entries)` sin try/catch (el caller `log.vue:49` tampoco captura). Si el write falla, la UI marca la entrada como revisada (la lluvia del jardín se despeja) sin haberse guardado; peor, si el DELETE llega y el upsert se corta, **el diario completo queda vacío en la nube**. Sus hermanos `add()`/`deleteEntry()` sí siguen la disciplina snapshot+rollback. _Cómo:_ mismo patrón que `add()`, + idealmente un `updateOne()` en el adapter para no reescribir todo el log por un toggle. _(rápido)_
- **Tras una hidratación fallida nada bloquea las escrituras: practicar pisa el SRS real con estados en cero** — `app/stores/srs.ts:37-48`: si la hidratación post-login falla (banner no bloqueante), `markSeen`/`recalculate` upsertean desde un mapa vacío y **sobrescriben easy/hard/mastery reales** (regresión de árboles del jardín). Mitigante verificado: el log es append-only y se auto-repara parcialmente al recargar, pero la ventana existe. _Cómo:_ flag `hydrated` por store; si la hidratación falló, `usePractice.start()` muestra el error de datos y no crea sesión hasta que `retry()` funcione. _(medio)_
- **La ventana delete-then-upsert sigue abierta en la nube para TODAS las colecciones** — `app/lib/storage/supabase.ts:296-425`: cada `write()` de colección son dos HTTP (delete + upsert). Los rollbacks añadidos en junio restauran **la memoria local**, pero si la conexión se corta entre ambos requests la tabla queda **vacía en la nube** hasta que el usuario reintente — y una recarga o cambio de dispositivo en ese estado pierde el set. Es el mecanismo raíz de varios hallazgos. _Cómo:_ invertir el orden (upsert primero, delete de huérfanos después) o, para atomicidad real, una función RPC de Postgres que haga replace-set en una transacción. _(medio-grande, pero cierra la clase entera)_
- **El progreso de los labs vive en localStorage global: se filtra entre cuentas del mismo dispositivo y contamina la nube del siguiente usuario** — `useConjugationMaster.ts:6` (+ counter/register/number-market/particle/speed-best): claves sin scope de usuario, nunca limpiadas en sign-out. Vía `useAvatars.syncUnlocks()` (`useAvatars.ts:82-87`) los desbloqueos heredados **se persisten en la nube de la cuenta activa**. Escenario real en este hogar: la esposa abre Ajustes y hereda (permanentemente) las insignias de labs del owner. El escape room sí es per-user — estos composables se saltaron la disciplina. _Cómo:_ mover los sets al blob prefs jsonb sincronizado (patrón sin migración ya establecido) o namespacing `clave:<userId>` + limpieza en SIGNED_OUT. _(medio)_
- **El backup completo NO incluye la actividad (heatmap/rachas)** — `app/lib/data-transfer/keys.ts:7-17` omite `STORAGE_KEYS.activity` aunque el comentario promete "Every syncable key in a full backup" y el adapter la soporta (read/write/upsert). Export→borrar→import (flujo soportado) **pierde permanentemente** las celdas del heatmap y la racha que venían de labs. Se añadió `user_activity` (2026-06-26) después de crear el backup y nadie actualizó la lista; el PR #148 de backup-fidelity añadió customDecks pero no esto. _Cómo:_ añadir activity a `EXPORT_KEYS` y `EXPORT_KEY_SHAPES` ('object') + 1 test round-trip. _(rápido — 5 minutos, hallado por 3 lentes independientes)_
- **Blobs enteros con last-write-wins (settings.prefs y escape-room.progress)** — `settings.ts:128-144` y `useEscapeRoomProgress.ts:68-80` escriben siempre el blob completo desde memoria, sin guard de hidratación ni merge. Dos escenarios: una pestaña/dispositivo obsoleto pisa trofeos/avatares desbloqueados en otro; y cambiar el tema antes de que `hydrate()` resuelva escribe defaults encima del blob real. _Cómo:_ merge-on-write para los sets acumulativos (unlocked*) + flag hydrated que haga esperar a `persistCloud`. _(medio)_
- **11 llamadas `void activity.record()` sin `.catch()` → unhandled rejections que ensucian el sink de errores** — el patrón correcto existe en 2 sitios (`usePractice.ts:174`, `useNumberDictation.ts:82`, con comentario) y los otros 11 labs no lo siguen. Cada respuesta con red caída manda ruido a `/api/errors`, enterrando errores reales (el throttle de 10s/25-por-sesión lo modera pero no lo elimina). _Cómo:_ tragar el error **dentro de `activity.record()`** (stores/activity.ts) y quitar los `.catch()` dispersos — un solo punto de verdad. _(rápido)_

**Bugs funcionales en los labs (los dos primeros, en el lab más nuevo):**

- **Sentence Garden: tocar un mazo no hace nada (en silencio) si falla el write de mark-seen** — `pages/practice/sentence-garden.vue:56-65`: `beginDeck` espera `sg.start()` — que termina con un loop **secuencial** de `srsStore.markSeen()` (upserts a Supabase) — antes de poner `started=true`, y se invoca con `void` sin catch. Con red inestable el picker se queda congelado sin toast: el lab parece roto. Todos los demás labs arrancan la UI síncronamente (p. ej. `cloze.vue:53`). _Cómo:_ arrancar la UI primero y disparar los markSeen como best-effort con catch. _(rápido)_
- **Sentence Garden: el crédito SRS del final de ronda se pierde en silencio si falla el write** — `sentence-garden.vue:84-87` + `useSentenceGarden.ts:141-151`: `finish()` sin try/catch; el summary "7/8" se pinta normal mientras los 'easy' y recalcs no se guardaron. Es exactamente el modo de fallo que el PR #128 arregló en el loop central — el lab más nuevo se saltó esa disciplina (y los `finish()` de cloze/counters/register/conjugation comparten versiones más leves del mismo hueco). _Cómo:_ try/catch + `toast.error(t('errors.save_failed'))`; dentro de `finish()`, continuar con el siguiente ko si uno falla. _(rápido)_
- **Ruleta: el latch anti-doble-tap se cae con submits cruzados entre cartas → doble log + contexto saltado** — `ruleta.vue:240-269`: `submittingPick` es un único ref compartido por las 3 cartas; enviar la carta B mientras A está en vuelo resetea el latch de A (`GrammarCard.vue:98-103` observa el flanco de bajada), permitiendo re-enviar A: dos entradas de log por una respuesta y `advanceProgress` ×2 (salta el contexto #2). Deshace parcialmente la protección del #128. _Cómo:_ `Set<number>` en vez de valor único; `:submitting="submittingPicks.has(i)"`. _(rápido)_
- **Particle Lab: el set 'contraction' es infallable — 100% de accuracy garantizado y crédito 'easy' de 이/가 en cada ronda** — `lib/particle-lab/drill.ts:90` devuelve verdict 'contraction' (nunca 'wrong-family') para cualquier error, `useParticleDrill.ts:115-121` solo bloquea la opción (quedan 2 opciones → la correcta, ya revelada), y `logMistake` es **inalcanzable** para los 11 ítems del set. Un usuario que falle los 11 recibe el mismo crédito de mastería que uno perfecto; sus errores son invisibles para diario, SRS y leeches. _Cómo (decisión de producto):_ (a) contar la trampa como fallo real la primera vez, o (b) mantener el retry pedagógico pero registrar `contractionSlips` y exigir slips===0 para el 'easy'. _(rápido tras decidir)_
- **Escape room: el ambient en loop sigue sonando por toda la app al salir del nivel navegando** — `EscapeRoom.vue` no tiene `onUnmounted`; `audio.stopAll()` solo se llama en `retry()`/`exitToBook()`. El elemento es singleton de módulo con `loop=true`: nav link o back desde mid-run (o desde victory/game-over, donde el leave-guard ya no aplica) → el monasterio suena en /library hasta recargar. _Cómo:_ `onBeforeUnmount(() => audio.stopAll())` — una línea. _(rápido)_

**Seguridad (endurecimiento, no agujeros expuestos):**

- **El gate de "cambio de contraseña requiere la actual" es solo client-side** — `useAuth.ts:195-212`: el comentario afirma que protege contra sesión secuestrada, pero `updatePassword` es un passthrough a `auth.updateUser({password})`; con la anon key pública, una sesión robada rota la contraseña por API directa sin conocer la actual (CWE-620) → toma de cuenta permanente. Relacionado: la edge function `delete-account` (`supabase/functions/delete-account/index.ts:41`) tampoco exige re-auth (el "escribe DELETE" es solo UI). _Cómo:_ activar "Secure password change" en el dashboard de Supabase (verificar disponibilidad en Free) o mover el cambio a una edge function que valide la actual server-side; para delete-account, aceptar `{password}` y validarla. _(rápido-medio)_
- **Sin límites de tamaño en ninguna tabla `user_*`** — `migrations/20260603000001_initial_schema.sql:62+`: `sentence text`, `prefs jsonb`, etc. sin CHECKs de longitud. Con registro abierto + plan Free (~500MB), una cuenta hostil puede insertar megabytes por fila vía PostgREST hasta pausar el proyecto **para todos**. _Cómo:_ migración aditiva con `char_length()`/`octet_length()` CHECKs holgados. _(rápido)_
- **`user_log` usa PK global bigserial con ids generados en cliente (ms actual) → colisiones entre usuarios** — `supabase.ts:68` + `stores/log.ts:31`: dos usuarios que respondan en el mismo milisegundo colisionan (el segundo insert falla); y un **restore de backup falla determinísticamente** si un id del backup ya pertenece a otro usuario (RLS bloquea el UPDATE del upsert) — el rollback atómico protege los datos, pero ese backup queda ininportable para siempre con un error críptico. _Cómo:_ migrar la PK a compuesta `(user_id, id)` como ya hacen user_decks/user_custom_decks. _(medio)_

**Deploy:**

- **Producción resuelve dependencias frescas en cada deploy (npm sin lockfile) — CI valida un árbol distinto al que se shippea** — `vercel.json:3`: `npm install --legacy-peer-deps --no-package-lock` ignora `pnpm-lock.yaml`, con rangos caret en nuxt/i18n/vue/supabase — exactamente el stack cuyos seams ya mordieron (los comentarios de `nuxt.config.ts` documentan dos roturas de hydration/build por versiones). Un minor nuevo de nuxt entra a prod sin pasar por los 7.300 tests. _Cómo:_ `corepack prepare pnpm@9.15.9 && pnpm install --frozen-lockfile` en el buildCommand (el `packageManager` ya está declarado). _(rápido)_

**i18n (los dos únicos huecos reales que quedan):**

- **Los errores de login/signup salen en inglés crudo de Supabase en los 8 locales** — `WelcomeEmailForm.vue:42,55,70` emiten `error.message` ("Invalid login credentials"…) directo al diálogo. Es el error más común de la primera pantalla, para una audiencia no angloparlante con cuentas obligatorias — y todos los caminos hermanos ya localizan. _Cómo:_ mapear `error.code` de supabase-js v2 (invalid_credentials, email_not_confirmed, over_request_rate_limit…) a claves `auth.*` con fallback genérico. _(rápido-medio)_
- **La ruleta toastea excepciones crudas ("Failed to fetch" / "Unknown error") sin traducir** — `ruleta.vue:119,137,186,211` hacen `toast.error(error.value)` donde `usePractice.ts:117` guarda el mensaje técnico en inglés (el disparador real verificado: fallo del markSeen en `start()`). Único `toast.error()` de la app que no pasa por `t()`. _Cómo:_ clave `practice.start_failed` ×8 locales; el mensaje crudo a console. _(rápido)_

**Accesibilidad (patrón claro: los dos juegos más nuevos se saltaron las disciplinas que los demás ya siguen):**

- **Sentence Garden: el verdict correcto es solo-color y nunca se anuncia** — `Bed.vue:25` (borde verde/rojo); solo el caso WRONG tiene `role=status` (`sentence-garden.vue:166`). Todos los labs hermanos anuncian "✓ correcto" textualmente. _(rápido)_
- **Sentence Garden: colocar una carta destruye el botón enfocado — el foco cae a `<body>` en cada tap y no hay live region del estado del bed** — `Tray.vue:12-18` + `useSentenceGarden.ts:76`: un usuario de teclado re-tabula desde arriba 3–6 veces por frase × 8 rondas; un usuario de lector nunca oye qué colocó. _Cómo:_ mover foco a la siguiente carta tras place/remove + una región `aria-live=polite` ("물을 colocado, posición 2 de 4"). _(medio)_
- **Escape room: el feedback de respuesta incorrecta es solo-audio** — `EscapeRoom.vue:221-224`: con mute (botón que el propio juego ofrece) o hipoacusia, fallar no produce **ningún** cambio visual — el jugador re-toca quemando corazones (ocluidos por el overlay y `aria-hidden`) hasta un game-over "aleatorio". El camino soft-reject ya tiene el patrón correcto (`role=status`) para reutilizar. _(rápido)_
- **Escape room: GameOver/Victory sin foco, sin anuncio, y el fondo sigue tabulable** — `GameOverScreen.vue:15`, `VictoryScreen.vue:66`: la narrativa del outro/tier/reward es silenciosa para SR, y Tab activa controles invisibles debajo del overlay. SentenceSummary (misma época) lo hace bien — copiar su patrón. _(rápido)_
- **Escape room: el overlay de puzzle es un modal sin semántica de modal** — `EscapeRoom.vue:371-377`: sin role dialog, sin focus trap, sin Esc, botón de cierre llamado "✕" literal. El proyecto ya tiene `ui/Modal.vue` endurecido — envolver o portar su trap. _(medio)_
- **Bomi ignora prefers-reduced-motion: 9 loops infinitos de motion-v (JS/WAAPI que la media query CSS no puede parar)** — `lib/bomi/poses.ts:52+`, renderizada en el jardín, la ruleta y cada CompletionBanner. Es el único agujero en una disciplina reduced-motion por lo demás completa (39 archivos la respetan). _Cómo:_ `useReducedMotion` de motion-v → pose estática. _(rápido)_

**Bundle (la disciplina lazy de junio quedó a medias — tres módulos nuevos la regresaron):**

- **~900KB de seed del escape room viajan en el chunk de entrada de TODA la app por el trofeo del sidebar** — `usePremios.ts:4` importa `LEVEL_REGISTRY` → niveles completos + diccionarios 8-locale, y la cadena llega a `AppSidebar → AccountMenu` del layout default. Es el mismo modo de fallo que junio arregló para grammars/usage-notes, y hoy **el mayor lever de rendimiento móvil**. _Cómo:_ extraer un `rewards-meta.ts` ligero (id/title/rewards) para usePremios; los niveles completos solo alcanzables desde `pages/escape-room/**`. _(medio)_
- **grammar-pairs (~700KB) se agrega eager y lo carga la biblioteca** — `lib/grammar-pairs/index.ts:2` spreads los 12 archivos; sus hermanos (examples, usage-notes) ya son lazy por nivel. _Cómo:_ espejo del patrón LOADERS. _(medio)_
- **El pool de Sentence Garden importa eager los 6 niveles de examples (~500KB)** — `lib/sentence-garden/pool.ts:2-7`, cuando los loaders lazy por nivel **ya existen** para esos módulos exactos (PR #143 introdujo la regresión al ensanchar el pool). _Cómo:_ derivar niveles del mazo en `sg.start()` y `await` los loaders existentes. _(medio)_

**Estructura (una sola deuda con coste demostrado):**

- **La máquina de estados de drill está copy-pasteada en 6+ composables, con el crédito de fin de ronda ya divergido en 3 capas distintas** — compara `useClozeDrill.ts:37-84` con `useCounterDrill.ts:34-84` y `useRegisterDrill.ts:43-92` (línea por línea); el mastery-credit corre dentro de `next()` (counters), en un wrapper de página (conjugation/register) o en un `finish()` aparte (cloze). El historial ya demostró el coste: el fix de stem-duplication tocó 3 archivos; el guard de ronda vacía existe en unos y falta en otros (`useRegisterDrill.ts:63` y `useConjugationDrill.ts:60` pueden hacer TypeError con ronda vacía). _Cómo:_ factory `createChoiceDrill<Item>()` con hooks buildRound/optionsFor/onRoundDone. _(grande, pero paga cada fix futuro)_
- **El escape room es la única superficie de estudio que no registra actividad** — `stores/escape-room.ts` nunca llama `activity.record()` (los otros ~13 surfaces sí): 20 minutos de nivel = sin celda de heatmap y racha rota. _Cómo:_ `void activity.record()` en resolveSlot/complete. _(rápido)_

### 🟢 Mejoras

**Seguridad/robustez menor:** rate-limit + límite de body en `/api/errors` (server-side; el throttle actual es solo del cliente legítimo) · cabeceras de seguridad (frame-ancestors/nosniff/referrer-policy vía nitro routeRules — `vercel.json headers` NO aplica con Build Output API) · validar esquema de `image_url` de custom decks antes de `<img :src>` (columna viva, upload diferido) · borrar `runtimeConfig.supabaseServiceRoleKey` muerto + la línea engañosa de `.env.example` · normalización **NFC** en `normalizeCompletionAnswer` del escape room (único sitio donde coreano tecleado se compara con seed; IMEs/macOS pueden emitir NFD) · guard de ronda vacía en register/conjugation drills.

**UX:** doble-tap en Save/Delete del deck builder crea mazos duplicados (falta flag in-flight) · un tap fuera del modal del builder descarta todos los cambios sin confirmar (`Modal.vue:81` cierra en overlay-click) · botones nativos sin estilo en SentenceSummary (única pantalla fuera del design system) · trofeo del escape room recién ganado se pierde en silencio si `persist()` falla (catch vacío en `useEscapeRoomProgress.ts:77`) · `toggleDeckCollapsed` y `contexts.removeCustom` con huecos leves de rollback · `clear()` etiqueta todo fallo como error de grammar (`supabase.ts:529`).

**a11y restante (de la auditoría previa, sin cambios):** Button sm/md bajo 44px (los componentes nuevos sí cumplen) · hotspots/escena del escape room anuncian ids crudos (`Hotspot.vue:44`, `Scene.vue:60` — los rooms ya tienen títulos localizados) · `IntroCinematic` con `outline:none` sin focus-visible (viola la regla dura del propio Button.vue) · labels de nav móvil 7px · dictado sin camino no-auditivo (decisión de producto).

**i18n polish:** cero plurales pipe en toda la app ("1 plants ready to revisit") — ~10 claves con contador en en/es/fr/pt-BR · fechas del diario y study sheet con locale del navegador en vez del de la app (el heatmap lo hace bien) · 2 claves francesas sin traducir/concordar (`fr.json:410,1043` → "correctes" como en :975/:1016).

**Perf polish:** `kosForDeck` vive junto al seed cloze de 413KB y acopla el chunk de sentence-garden · PracticeHelp embebe los 8 locales × 11 labs (~170KB) en cada página de lab (loaders por modo) · covers del escape room 7.3MB en PNGs (pngquant ≈ 10-20× menor, o esperar al reemplazo PIL planeado) · cero `shallowRef`/`markRaw` (catálogo ~893KB y diario unbounded en proxies profundos) · `lib/pronunciation` sigue eager (61KB — el resto del hallazgo de junio) · shuffle genérico viviendo bajo particle-lab e importado por 11 módulos ajenos · 4 composables *Master y 4 helpers de audio copy-pasteados (extraer `useLabMastery` y `createVoiceChannel`).

**Producto polish:** la ruleta es la única tarjeta del hub con el cover SVG plano rechazado (los otros 9 son PIL) · el lock "6 puntos" de custom decks es regla de ruleta pero gatea Sentence Garden/cloze donde no predice jugabilidad (un mazo de 3 grammars rico en frases cortas aparece bloqueado).

## Modo comparación — auditoría 2026-06-28 verificada contra el código

| Hallazgo de junio | Estado |
|---|---|
| 🔴 Pérdida silenciosa de respuesta en el loop de práctica | ✅ **Resuelto** (`usePractice.ts:155-183`: bail sin avanzar + retry; verificado adversarialmente sin bugs nuevos) |
| customDecks delete-then-upsert sin rollback | ✅ Resuelto (snapshot+rollback+rethrow en add/update/remove) |
| custom-grammars sin rollback | ✅ Resuelto (`grammar.ts:107-135`) |
| Import de datos no atómico | ✅ Resuelto (snapshot previo + rollback por clave escrita) |
| usage-notes 5.5MB eager en /library y /rescue | ✅ Resuelto (loaders dinámicos por nivel + seed partido n1–n6) |
| grammar-examples + pronunciation eager | 🔄 **Parcial** — examples resuelto; pronunciation (61KB) sigue estático |
| Seed con 8 idiomas por entrada (split por locale) | ⚠️ Sigue (era "más adelante"; el split por nivel sí se hizo) |
| Input 14px → auto-zoom iOS | ✅ Resuelto (16px con comentario explicativo) |
| PWA (manifest/SW) | ⚠️ Sigue — **DEFERRED por decisión del owner** |
| Skip-to-content + foco en cambio de ruta | ✅ Resuelto (`AppShell.vue:20-27,52`) |
| Textarea de práctica sin label | ✅ Resuelto (aria-label cableado al primitive) |
| Speed no anuncia verdict | ✅ Resuelto (`role=status aria-live=assertive`) |
| Diario solo-escritura | ✅ Resuelto (paginación/búsqueda/borrar en /log) |
| Sin captura de errores global | ✅ Resuelto (`plugins/error-capture.client.ts` + `/api/errors`) |
| Stats no apilan en pantalla estrecha | ⚠️ Sigue |
| Touch targets <44px / nav 7px / heatmap 10px | 🔄 Parcial — heatmap ahora es keyboard/SR-accesible; Button sm/md y nav labels siguen |
| Sidebar sin aria-current | ✅ Resuelto de facto (NuxtLink pone `aria-current="page"` nativo) |
| Alt/aria del escape room = ids crudos | ⚠️ Sigue |
| user_log.id PK colisiona | ⚠️ Sigue — y esta pasada lo **agravó**: también rompe restores de backup de forma determinista (ver 🟡) |
| Discovery de labs (rescue sin tarjeta, onboarding) | ⚠️ Sigue |

**14 de 20 resueltos o casi.** Ritmo excelente entre auditorías.

## Análisis por área (síntesis)

**Estructura:** madura y coherente — capa de datos centralizada de verdad, tipos al día, no-god-files respetado. La única deuda con coste demostrado es el esqueleto de drill copy-pasteado (ya causó fixes multi-archivo y guards divergentes). El patrón meta de esta pasada: **cada feature nueva re-decide disciplinas que ya son estándar** (resiliencia, a11y, lazy-loading) — la factory de drills y un checklist de "lab nuevo" eliminarían la clase entera.

**Seguridad:** sin agujeros directos (RLS completo, sin secretos expuestos, sin XSS con origen externo). Lo que queda es endurecimiento de segundo orden: sesión-secuestrada (password/delete), cuotas anti-abuso (tablas sin límites, /api/errors), y la PK compartida de user_log.

**UX/a11y:** el core es ejemplar (Modal, Particle Lab, heatmap). Los dos juegos más nuevos (Sentence Garden, escape room) concentran 6 gaps importantes de a11y + 2 de resiliencia visual — todos con patrón existente que copiar.

**Producto:** el ciclo de cuenta está completo (cambio de email/contraseña, reset, borrado con confirmación — mejor de lo que se esperaba). Los niveles 4–10 del escape room se presentan como "coming soon" elegante, sin dead-ends. Los huecos reales de producto: escape room no cuenta para heatmap/racha, backup sin actividad, y las ideas de abajo.

## Qué falta para "acabar" la plataforma

1. **Contenido del escape room (niveles 4–10)** — el modo insignia está al 30%; los stubs están bien presentados pero es el gap de contenido más grande. Bloqueado además por tu plan de reemplazar todas las imágenes (Downloads→PIL→320×240).
2. **Reviews nativas pendientes (esposa):** ~605 frases del banco de ejemplos (enfocar TOPIK 5/6), nombres/arte de los 36 avatares, escape room L3, chrome 8-locale nuevo, y los 19 ejemplos nuevos del pilot de authoring.
3. **Decisiones abiertas del owner:** pares -더라도/-아어도 que marcan mal una opción correcta (conocido, sin auto-fix) · lote TOPIK 3 del authoring pilot (~22 puntos) si te gustó el de TOPIK 2 · PWA (diferida — desbloquearía offline + reminders con app cerrada) · monetización (Step 17, diferida hasta launch; investigación PortOne/Toss+Paddle ya hecha).
4. **Onboarding/discovery de los 20 labs** — sigue pendiente de junio: un usuario nuevo no descubre el arsenal completo.

## Ideas (ancladas al código, impacto/esfuerzo honesto)

- **Pronóstico de repasos (7 días):** `lib/srs/due.ts` ya computa la fecha exacta de cada ítem; stats solo muestra el count instantáneo. Un mini-bar "3 mañana, 9 el viernes" con el mismo lenguaje visual de weeklyCounts. _(impacto alto para hábito diario / esfuerzo bajo)_
- **Diario deep-linkeable (`/log?q=<ko>`):** la búsqueda ya filtra por `e.ko`; el study sheet ya cuenta las entradas de cada grammar y stats ya lista las "más difíciles" — solo falta enlazarlos. Convierte 3 superficies en un flujo de repaso. _(impacto medio / esfuerzo bajo)_
- **Jugabilidad por lab en la estantería de mazos custom:** sustituir el lock fijo de 6 por un predicado por lab (para Sentence Garden: rondas disponibles en el pool). _(impacto medio / esfuerzo bajo-medio)_
- **Racha/meta diaria más visible** (ya tienes dailyGoal en settings y streak en stats): un nudge en el jardín al estilo "2/5 de hoy" cerraría el loop de hábito que el SRS ya alimenta. _(impacto alto / esfuerzo medio — decisión de diseño tuya)_

## Plan sugerido

**Ahora (esta semana) — victorias rápidas, casi todas one-liners o <1 día:**
1. **Backup:** añadir `activity` a EXPORT_KEYS (+test). _5 min, cierra pérdida de datos real._
2. **Cluster de resiliencia barato:** setReviewState con snapshot+rollback+toast · swallow en `activity.record()` (quita 11 unhandled rejections) · Sentence Garden start/finish con el patrón #128 · `submittingPicks` como Set en ruleta · `onBeforeUnmount(stopAll)` en EscapeRoom.
3. **Vercel build con pnpm --frozen-lockfile** — que prod shippee el árbol que CI validó.
4. **i18n de errores:** mapa de códigos de auth de Supabase + `practice.start_failed` (×8 locales).

**Próximo (este mes):**
5. **a11y de los dos juegos nuevos:** verdict + focus management de Sentence Garden; wrong-feedback visible + end screens + semántica de modal del escape room; Bomi reduced-motion.
6. **Bundle:** rewards-meta ligero para usePremios (~900KB fuera del entry) · lazy por nivel en grammar-pairs y sentence-garden pool.
7. **Datos:** RPC replace-set transaccional (cierra la ventana delete-then-upsert de raíz) + flag hydrated que bloquee escrituras tras hidratación fallida + mastery de labs a prefs jsonb per-user.
8. **Seguridad:** Secure password change (dashboard o edge function) · CHECKs de tamaño en tablas · migración PK compuesta de user_log.
9. **Particle Lab contraction:** decidir (a) o (b) y aplicar.

**Más adelante:**
10. Factory `createChoiceDrill` (elimina la clase de drift entre labs).
11. Contenido: escape room L4–10 + reviews de la esposa + lote TOPIK 3.
12. Ideas: forecast de repasos, diario deep-linkeable, jugabilidad por lab.
13. Polish acumulado: plurales i18n, fechas con locale de app, headers de seguridad, rate-limit /api/errors, pngquant covers, shallowRef, cover PIL de la ruleta, 44px, PWA/monetización cuando decidas.

---

### Nota de honestidad
Ningún hallazgo alcanzó 🔴 tras la verificación adversarial (48 agentes; cada 🟡 confirmado con traza independiente, varios matizados: el clobber SRS se auto-repara parcialmente, el flood de rejections está moderado por el throttle del sink, el delete-account se degradó porque un token robado ya puede borrar datos vía RLS). Los verificadores también **refutaron** partes de hallazgos (p. ej. el disparador del toast de la ruleta no era el que el finder creía — se corrigió aquí). El legacy de la raíz resultó ser un deploy vivo de GitHub Pages, no basura. Monetización, PWA, leaked-password (plan Free) y drag-and-drop siguen fuera de alcance por decisión tuya.
