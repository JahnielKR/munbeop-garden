# Auditoría de Munbeop Garden — re-auditoría (modo comparación)
_Fecha: 2026-06-28 · Stack: Nuxt 4 (SPA `ssr:false`), Vue 3 `<script setup>`, Pinia (setup stores), Supabase (anon key + RLS, 1 edge function), @nuxtjs/i18n 9 (8 locales: en/es/fr/pt-BR/th/id/vi/ja), Tailwind 3, Vitest (295 archivos de test), pnpm. · Auditoría previa: `AUDITORIA-2026-06-19.md` (y `AUDITORIA-2026-06-18.md`)._

> Re-auditoría multi-agente (24 agentes: 7 finders por dimensión + verificación adversarial de cada hallazgo crítico/importante, rastreando el origen del dato antes de asignar severidad) sobre el código **actual**, tras **558 commits** desde la auditoría del 2026-06-19. La verificación adversarial **degradó varias severidades infladas** (la colisión de PK del log de 🔴→🟢, el avatar stale de 🟡→🟢) y el lead **verificó en vivo** el estado de Supabase + descartó 2 hallazgos de agente que eran falsos positivos (`i18n lazy` ya está en `true`; el "usage-notes a medio terminar" está en realidad completo). Las severidades de abajo son las corregidas.

## Veredicto general

El proyecto está **maduro, en producción, y sin hallazgos críticos**. En el trimestre desde la última auditoría se añadieron ~20 labs de práctica, avatares, paths, placement, number-market, library polish y el heatmap de actividad — y, contra lo esperado, ese código nuevo es **sólido**: el motor de conjugación coreana tiene 402 casos golden, las labs de respuesta múltiple incluyen siempre la opción correcta, y la matemática del heatmap es correcta (round-trip TZ-free verificado). La capa de seguridad sigue siendo el punto fuerte (12/12 tablas con RLS scoped a `auth.uid()`, edge function de borrado a prueba de coerción, sin secretos en cliente).

Lo que queda se reparte en tres grupos: **(1)** un puñado de bugs finos reales —el más interesante es que el store de `settings` no se resetea al cerrar sesión, así que en un dispositivo compartido las exclusiones de mazos/avatar/tema de un usuario se filtran al siguiente—; **(2)** el cluster de **monetización/legal sin terminar** —pricing anuncia tiers de pago sin checkout ni modelo de entitlement, y pricing/features/policies muestran copy hardcodeado en inglés (i18n saltado en 7 de 8 locales), siendo `policies.vue` el de mayor riesgo por presentar texto legal placeholder como si fuera vinculante—; y **(3)** pulido de a11y en lo más nuevo (heatmap de actividad sin nombres accesibles, `/paths` sin estado de carga/vacío). Ninguno sangra en producción; el de mayor retorno honesto es decidir la postura de monetización (o sustituir el pricing falso por un panel honesto) y arreglar el leak de `settings` entre cuentas.

## Progreso desde la auditoría anterior (modo comparación)

**Resueltos y verificados en el código actual (la gran mayoría):**

| Item previo | Cómo se cerró (verificado) |
|---|---|
| ⚠️ P14 — deck-focus muerto | Ahora **persistido**: `settings.ts:114` `toggleDeck` + blob `prefs` (`:84`), hidratado (`:64`), cableado a la UI en `library.vue`. |
| ⚠️ P15 — `(Otros)` hardcodeado | i18n-keyed: `library.vue` usa `t('library.orphan_section')` en los 8 locales. |
| 🟡 Imp — sin `app/error.vue` | `app/error.vue` existe, localizado, con manejo de chunk-load fatal. |
| 🟡 Imp — chart de ritmo de Stats sin a11y | `stats.vue` ahora tiene `role="img"` + `aria-label` + etiquetas de eje. |
| 🟢 — sin IMPORT de datos | `useDataImport` añadido (espejo del export). |
| 🟢 — flash de "no data" en hidratación | `GardenSkeleton` + `heroState()` gatean loading/empty/populated. |
| 🟢 — ratio easy/hard miente (100% hard) | `v-if` añadido. |
| 🟢 — `bomi.ts` sin tests | Tests añadidos. |
| 🟢 — orquestación (`useGardenState`/`usePractice`) sin tests | Tests añadidos. |
| 🟢 — `delete-account` testeado por regex | Tests de comportamiento añadidos. |
| 🟢 — first-run / invierno≈cero-progreso | Onboarding + `EmptyPlot` añadidos. |
| 🟢 — `i18n lazy:false` | **Ya en `lazy: true`** (`nuxt.config.ts:58`) — el hallazgo de un agente era falso positivo. |
| 🟢 — keys i18n muertas (`empty.*`) | Limpiadas. |

**Siguen abiertos (baja severidad salvo el de monetización):** pricing-tiers falso (decisión de negocio, ver 🟡); `MasteryBar` triple-rounding; contexts optimista sin rollback; reauth en cambio de email; "olvidé contraseña" dentro de Settings; `setReviewState` full-write; CottageCorner dual-PNG; `REWARDS_BY_LEVEL` en el chunk de layout; inversiones de capa (`PixelTree.vue`, `poses.ts`); regla de lint de fronteras de import; telemetría (diferida por la policy "no trackers"); leaked-password protection (limitación del plan Free); TLS en el script de migración admin.

## Lo que está bien hecho

- **El código nuevo (las ~20 labs) está a la altura del resto.** El motor de conjugación coreana —el generador de contenido de mayor riesgo— tiene 402 casos golden sobre los 80 verbos del dataset; se verificaron a mano ~16 de los pares irregulares más peligrosos (돕다/곱다 ㅂ-irr→오, 짓다/낫다/붓다 ㅅ-irr, 깨닫다/싣다 ㄷ-irr, 멀다/만들다 ㄹ-drop, 치르다/따르다/들르다 ㅡ-elisión, h-irr) y todas las formas son correctas. Lecturas de números (만/억, 유월/시월, 공/영, 스무/스물 prenominal), adjunción de partículas (incl. la excepción (으)로 tras ㄹ), distractores de contadores, escalera de placement, detección de leeches y progresión de paths: todo correcto y con tests.
- **Seguridad sólida y verificada en vivo.** Las 12 tablas (incl. las nuevas `user_settings`, `user_escape_room`, `user_custom_decks`, `user_activity`) tienen RLS scoped a `auth.uid() = user_id` con `WITH CHECK` en writes; los únicos `using(true)` son los catálogos públicos de solo-lectura. La edge function `delete-account` verifica el JWT del propio caller (`auth.getUser`) **antes** de `admin.deleteUser(user.id)` → imposible borrar otra cuenta. Service-role key server-only, nunca en cliente. Único advisor: leaked-password (limitación del plan Free).
- **Heatmap de actividad correcto.** `localDayKey`/`ordinalOf`/`keyOfOrdinal` hacen un round-trip TZ-free consistente; el merge log+activity usa `max` para no doble-contar. Sin bug de timezone.
- **Capa de datos ejemplar (sigue).** `StorageAdapter` async, 3 impls, facade re-resuelto por acción, rail de exhaustividad (`assertNever`), `assertOk` que lanza, writes delta (`append`/`upsertOne`). Lectura con fallback-solo-en-vacío que evita el clásico "error leído como vacío".
- **Estados y a11y maduros en lo central.** Garden home distingue loading/empty/populated; `/stats` tiene empty state + chart `role="img"`; `DataErrorBanner` con retry; rescue/cloze/placement con guía y foco gestionado; `ProgressDots` es un `progressbar` real; `SpeedHud` usa `role="timer"`.
- **usage-notes es una feature COMPLETA**, no abandonada: `UsageNotesSection` consume `notesFor(grammar.ko)` → `USAGE_NOTES` (300 notas para 300 gramáticas del catálogo, 1:1 por nivel, 8 locales c/u). El `<ComingSoonSection>` es solo el fallback por-ko (alcanzable hoy solo por gramáticas custom del usuario).

## Hallazgos priorizados (post-verificación adversarial)

### 🔴 Críticos
**Ninguno.** No hay exposición de datos, pérdida de datos en uso normal, ni roturas en producción.

### 🟡 Importantes

- **Monetización sin terminar: pricing anuncia tiers de pago sin cobro, sin gating y sin modelo de entitlement.** `pricing.vue:21-41` presenta Sprout (gratis) / Grove ($4/mes) / Forest ($49 único) — pero **cero** integración de pago (sin Stripe/Toss/KakaoPay, sin botón de checkout), `AuthUser` no tiene campo `plan`/entitlement (`app/lib/auth/types.ts`), así que el modelo de datos **ni siquiera puede representar** un usuario de pago, y las features "de pago" (sync, export, stats) ya son gratis. Cabecera: `TODO(v8.1)`. _Por qué importa:_ la página es pública (sidebar de welcome); usuarios reales ven precios que no pueden pagar por cosas que ya tienen. _Cómo:_ **decidir la postura de monetización primero.** Si monetizas: columna `plan`/entitlement en Supabase expuesta en el auth store + gating + checkout (Toss/KakaoPay encajan con el mercado coreano). Si no aún: reemplazar por un panel honesto "gratis en beta". _(esfuerzo: grande — decisión de negocio)_

- **Páginas públicas con copy hardcodeado en inglés — i18n saltado en 7 de 8 locales; `policies.vue` presenta texto legal placeholder como vinculante.** En `pricing.vue`, `features.vue` y `policies.vue` solo el título pasa por `t()`; los cuerpos son strings en inglés literales (`'Cross-device sync'`, "Pick the plan… Cancel any time", secciones Privacy/Terms/Cookies/Contact). Las tres llevan `TODO(v8.1)`. _Por qué importa:_ un usuario tailandés/japonés/indonesio ve inglés en páginas públicas; y `policies.vue` muestra Privacidad/Términos como si fueran vinculantes siendo placeholder — riesgo legal. _Cómo:_ mover los cuerpos a keys i18n (depende de #monetización para el copy real); marcar policies como borrador hasta tener el texto legal real. _(esfuerzo: medio)_

- **El store `settings` no se resetea al cerrar sesión → fuga de estado entre cuentas en dispositivo compartido.** `useAuth.hydrateDataStores()` (`useAuth.ts:28-38`) re-hidrata 7 stores en `SIGNED_OUT` pero **omite** `useSettingsStore()`; y `settings.hydrate()` (`settings.ts:53-73`) aplica cada campo **solo si** el valor de la nube está presente, sin resetear primero a defaults. Resultado: usuario A excluye mazos (focus mode) / elige avatar / tema y cierra sesión; usuario B entra; si el blob de B no trae ese campo, **los valores de A persisten en memoria** y, p. ej., reducen silenciosamente el draw de práctica de B. Contraste: `useEscapeRoomProgress.hydrate()` **sí** resetea a `[]` en la lectura noop — ese es el patrón correcto que `settings` omite. _Por qué importa:_ cuentas obligatorias + contexto de dispositivo compartido (hogar coreano) lo hace plausible; el bug es invisible (sin error) y corrompe la corrección del draw. _Cómo:_ resetear los refs a defaults al inicio de `hydrate()` antes de aplicar la nube, y/o incluir `useSettingsStore()` en `hydrateDataStores()`. _(esfuerzo: rápido)_

- **Heatmap de actividad: 365 celdas focusables sin nombre accesible y sin resumen `role="img"`.** `ActivityHeatmap.vue:85-108` — un usuario de lector de pantalla que tabula el calendario no oye nada (ni fecha ni conteo). El chart de ritmo de Stats sí se arregló; el heatmap (más nuevo) no. _Cómo:_ `role="img"` + `aria-label` que resuma la serie en la grilla, y `aria-label`/`title` por celda con fecha+conteo (o quitar el foco de las celdas y exponer un resumen sr-only). Keys nuevas en 8 locales. _(esfuerzo: medio)_

- **`/paths` es la única página nueva sin estado de carga ni vacío.** `paths.vue:26-34` renderiza directo la lista; si los datos aún no hidrataron o no hay progresión, se ve solo título + lead con lista en blanco (no existe key `paths.empty` en ningún locale). _Cómo:_ skeleton de carga + copy de estado vacío/degenerado. _(esfuerzo: rápido)_

- **`SupabaseAdapter.remove()` escribe `[]`, que para las keys jsonb (settings/escapeRoom) corrompe el blob en vez de borrar la fila (latente).** `supabase.ts:466-468` implementa `remove(key)` como `write(key, [])`. Para las colecciones está bien (delete + skip upsert vacío), pero el arm de settings/escapeRoom hace `upsert({ prefs: value })` → guardaría `prefs: []` (un array donde se espera objeto/null), y el guard de lectura (`prefs != null`) deja pasar el `[]` → `settings.hydrate` lee todo como ausente y **resetea silenciosamente las preferencias**. _Estado:_ DORMIDO — ningún código llama hoy a `adapter.remove()`/`clear()` (verificado repo-wide). Es un arma cargada: la primera feature "resetear preferencias" que pase por `remove()` lo dispara. _Cómo:_ hacer `remove()` key-aware (para settings/escapeRoom `.delete().eq('user_id', …)`), espejo del arm de `activity`. _(esfuerzo: rápido)_

- **`user_log.id` es un PK `bigserial` GLOBAL pero el cliente le pasa un id de baja entropía → colisión posible que lanza en insert (robustez).** `log.ts:31` genera `id: Date.now() + Math.random()`, y `supabase.ts:68` hace `Math.floor(e.id)` antes del insert — **el `Math.floor` destruye la fracción aleatoria**, dejando la unicidad apoyada solo en el reloj de milisegundos contra un PK global (no per-usuario, `initial_schema.sql:59`). Dos inserts en el mismo ms colisionan; el segundo lanza vía `assertOk`. _Honestidad de severidad:_ los verificadores adversariales lo bajaron porque cada `logStore.add` hace `await` de un insert de red (decenas de ms) y se serializa, así que en la escala actual (owner + esposa) la probabilidad es astronómicamente baja y el impacto sería un write de journal fallido (no pérdida de progreso, no exposición). Pero el **diseño es genuinamente incorrecto** (PK global elegido por cliente + `floor` que anula la única protección) y la corrección es barata. _Cómo:_ no fabricar id para un `bigserial` — omitir `id` en el insert y dejar que Postgres lo asigne; o `PRIMARY KEY (user_id, id)`; o `crypto.randomUUID()`. _(esfuerzo: rápido)_

- **`contexts` CRUD optimista sin rollback.** `contexts.ts` muta en memoria y luego `await write()`; el adapter lanza, pero sin try/catch → si la nube falla, la UI queda desincronizada hasta recargar, sin aviso. _Cómo:_ snapshot+rollback+toast de error, o enrutar por `appStatus.track`. _(esfuerzo: medio)_

- **`setReviewState` sigue haciendo write O(historial).** `log.ts:43-54` re-upsertea todo el log para voltear una fila — único write no-delta que queda sobre la colección de crecimiento ilimitado. _Cómo:_ `updateOne`/`upsertOne` por id. _(esfuerzo: medio)_

- **Toast stack anida `aria-live`.** `Toast.vue:33-42` envuelve un contenedor `aria-live` alrededor de toasts que ya tienen su propia región `alert/status` → doble-anuncio / comportamiento indefinido. _Cómo:_ quitar el live del wrapper. _(esfuerzo: rápido)_

- **Leaked Password Protection desactivada en Supabase** (advisor `auth_leaked_password_protection = DISABLED`). Es config del dashboard; el toggle es Pro-only y el proyecto está en plan Free → **bloqueado hasta upgrade**, diferido. El piso de longitud de contraseña en signup ya se añadió. _(esfuerzo: rápido/config, bloqueado por plan)_

### 🟢 Mejoras

**Bugs finos (todos verificados, baja probabilidad o cosméticos):**
- **Dictation marca `3:5` como incorrecto para `3:05`** — el minuto debe ir zero-padded y la hora no; gramática de formato estricta puede rechazar respuestas válidas del usuario. `number-market` dictation. _(rápido)_
- **Trampa de contracción == respuesta correcta (latente).** `particle-lab/drill.ts:28-31,63-69`: `correctForm` de una contracción cae a `contractionTrap(noun)` (= `noun+가`, la forma incorrecta) si el item lleva un noun fuera de los 4 pronombres hard-coded; hoy el seed solo usa los 4 válidos, pero el `?? contractionTrap` debería lanzar, no fallar silencioso. _Cómo:_ assert/throw o test de invariante de seed. _(rápido)_
- **Avatar de jardín renderiza sin re-chequear que sigue desbloqueado.** `usePremios.ts:125-153`: la rama de cosmético de escape valida contra ownership vivo, la del avatar de jardín lo resuelve solo por id del catálogo estático (y el comentario afirma falsamente que se valida). Cerrado en la práctica por `syncUnlocks()` en mount, pero la inconsistencia entre ramas hermanas + el comentario engañoso es el smell. _(rápido)_
- **`activity.record()` fire-and-forget sin catch.** `usePractice.ts:161` `void activity.record()` → un error de Supabase se vuelve unhandled rejection (invisible sin telemetría). _Cómo:_ `.catch(() => {})`. _(rápido)_
- **Interval de Bomi lo limpia el `onUnmounted` del primer host** aunque el store es singleton: al navegar fuera de la página que montó a Bomi primero, el tick de 250 ms se detiene y la mascota deja de derivar a poses idle hasta recargar. _(medio)_

**Limpieza / i18n:**
- **Key i18n muerta:** `library.modal.coming_soon.examples` no se referencia en ningún sitio (quedó tras cablear los ejemplos); borrar de los 8 locales. _(rápido)_
- **README muy desactualizado:** dice "64 tests" (hay 295), lista como "próximos planes" features ya en producción (escape room, cosméticos, avatares). _(rápido)_
- **`MEMORY.md` con set de locales obsoleto** (`es/en/ko/ja/zh/fr/pt/de`); el real es `en/es/fr/pt-BR/th/id/vi/ja`. _(rápido)_

**Mejoras heredadas aún abiertas (baja severidad):** `MasteryBar` triple-`Math.round` puede recortar/desbordar; reauth en cambio de email; link "olvidé contraseña" dentro de Settings; comentarios que dicen "locale per-device" cuando está account-synced; CottageCorner baja ambos PNG (light+dark) y oculta uno con `display:none`; `REWARDS_BY_LEVEL`/`LEVEL_REGISTRY` entra al chunk de layout solo por el pip de trofeos; doble hidratación en recarga dura.

**Estructura / tests / perf:**
- **Inversiones de capa:** constantes del jardín (`TREE_*`) viven en `PixelTree.vue` e importadas hacia arriba por `lib`/composables; `poses.ts` (datos de Bomi) en `components/` consumido por el store. _Cómo:_ extraer a `lib/garden/tree.ts` y `lib/bomi/`. _(medio)_
- **Sin regla de lint de fronteras de import** (`eslint.config.mjs` tiene 3 reglas) — es lo que dejó entrar las inversiones. _Cómo:_ `import/no-cycle` + `no-restricted-imports` por capa. _(medio)_
- **Sin telemetría / captura de errores.** SPA logueado con try/catch agresivo → ciego en prod. La policy promete "no third-party trackers"; valorar self-hosted (PostHog/Sentry ya disponibles en el entorno) o un sink propio. _(medio)_
- **`setReviewState` delta**, `log.id` por bigserial (ver 🟡), TLS en `apply-resync-migration.mjs` (herramienta local). _(varios)_
- _Nota de bundle:_ `notesFor` importa estáticamente todo el seed `usage-notes` (~4.6 MB de `.ts` crudo) y `UsageNotesSection` lo importa estáticamente — pero como solo lo consume la ruta `/library`, queda en el chunk de esa ruta (lazy), no en el entry. Aceptable; conviene confirmarlo en el build real antes de actuar (la auditoría previa ya tuvo un falso positivo de "seed eager" que el tree-shaking desmintió).

## Análisis por área

### Estructura / arquitectura
Sigue siendo el punto fuerte: sin god files (el mayor es `AccountMenu.vue` 550 LOC), responsabilidades separadas, adapter ejemplar, 50 composables bien delimitados. Deuda real: las dos inversiones de capa (jardín→`.vue`, `poses.ts`) y la ausencia de una regla de lint que proteja las fronteras que la arquitectura asume.

### Seguridad
La más fuerte y verificada en vivo: RLS completo y correcto (12/12 tablas scoped a `auth.uid()`), edge function de borrado a prueba de coerción, sin secretos en cliente, sin autorización confiada solo a Vue (no existe entitlement aún). Lo único genuino es el diseño del PK de `user_log` (id global elegido por cliente) y defensa-en-profundidad de cuentas (leaked-password bloqueado por plan Free; reauth en cambio de email). Nada de exposición de datos.

### Diseño visual / UX
Buen oficio (movimiento accesible con `prefers-reduced-motion`, modal de manual, empty states, responsive deliberado para móvil coreano). Los huecos son finos y concretos: heatmap de actividad sin a11y, `/paths` sin loading/empty, toast con `aria-live` anidado, y algunas señales solo-por-color (pips de MasterStrip, intensidad del heatmap).

### Features / producto
El loop señal (práctica→SRS→jardín→escape-room→trofeos→avatares) está pulido, completo y persistido cross-run, con import/export. Lo prometido-no-cumplido es el cluster monetización/legal: **pricing con tiers de pago sin cobro ni gating ni modelo de entitlement**, y pricing/features/policies con copy placeholder hardcodeado en inglés. El escape-room L4–L10 son stubs `coming-soon` honestos (no defectos). Cero telemetría para decidir el roadmap con evidencia.

### Datos / estado
Endurecida y madura: `assertOk`, rail de exhaustividad, writes delta, tipos generados. Riesgos finos: el reset de `settings` ausente en sign-out (fuga entre cuentas), `remove()` sobre jsonb (latente), `setReviewState` aún O(n), y el PK de `user_log`.

## Plan sugerido

**Ahora (esta semana) — victorias rápidas + el bug entre cuentas:**
1. **Resetear `settings` en sign-out** (resetear refs a defaults en `hydrate()` antes de aplicar la nube, y/o incluirlo en `hydrateDataStores()`). Es el bug nuevo más afilado. _(rápido)_
2. **`/paths`: skeleton de carga + estado vacío** (key `paths.empty` en 8 locales). _(rápido)_
3. **A11y del heatmap de actividad** (`role="img"` + aria por celda). _(medio)_
4. **`remove()` key-aware** para settings/escapeRoom (cerrar el arma cargada). _(rápido)_
5. **Limpieza:** quitar la key muerta `coming_soon.examples`; arreglar el grading de dictation (`3:05`); `activity.record().catch()`; actualizar README + locales de `MEMORY.md`. _(rápido)_

**Próximo (este mes) — decisión de producto + a11y/robustez:**
6. **Decidir monetización** y actuar: gating por plan + checkout (Toss/KakaoPay), **o** reemplazar el pricing falso por un panel honesto. Mover los cuerpos de pricing/features/policies a i18n; marcar `policies` como borrador hasta tener texto legal real. _(grande / decisión de negocio)_
7. **PK de `user_log`** a bigserial asignado por Postgres (o `(user_id, id)`); `setReviewState` a write delta; `contexts` con rollback. _(medio)_
8. **Toast `aria-live`**, reauth en cambio de email, "olvidé contraseña" en Settings. _(rápido)_

**Más adelante — rumbo de lanzamiento:**
9. Telemetría/captura de errores (self-hosted, respetando "no trackers").
10. Higiene de capas: extraer `TREE_*` a `lib/garden/tree.ts` y `poses.ts` a `lib/bomi/`; regla de lint `import/no-cycle` + fronteras.
11. Recortes menores de bundle (CottageCorner a un PNG por tema, `REWARDS_BY_LEVEL` hoja); leaked-password al pasar a plan Pro.

---

### Nota de honestidad sobre esta auditoría
La verificación adversarial corrigió/descartó hallazgos de los finders para no entrenarte a ignorar las alertas:
- **Falso positivo:** `i18n lazy:false` — el código actual ya tiene `lazy: true` (`nuxt.config.ts:58`). Descartado.
- **Anchor del lead refutado:** el "usage-notes a medio terminar" (seed enorme pero UI en ComingSoon) — verificado que la feature está **completa y cableada** (`notesFor()`→`USAGE_NOTES`, 300/300 gramáticas); ComingSoon es solo el fallback por-ko. No hay nada que terminar ahí.
- **Severidades infladas corregidas:** la colisión de PK del log bajó de 🔴 a 🟢/robustez (cada `add` serializa un insert de red, así que mismo-ms es irreal en la escala actual; el sub-claim de "merge de filas → pérdida de datos" es lógicamente imposible porque el PK hace que el segundo insert lance antes de poder coexistir). El avatar stale bajó de 🟡 a 🟢 (cerrado por `syncUnlocks()` en mount).
