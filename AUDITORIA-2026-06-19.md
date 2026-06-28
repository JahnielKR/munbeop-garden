# Auditoría de Munbeop Garden — re-auditoría (modo comparación)
_Fecha: 2026-06-19 · Stack: Nuxt 4 (SPA `ssr:false`), Vue 3 `<script setup>`, Pinia, Supabase (anon key + RLS, sin server), @nuxtjs/i18n 9 (8 locales), Tailwind 3, Vitest (106 archivos de test), pnpm. · Auditoría previa: ver `AUDITORIA-2026-06-18.md`._

> Re-auditoría multi-agente (29 agentes): verificación de los 16 hallazgos previos contra el código **actual** + barrido fresco de 8 áreas, con verificación adversarial de cada hallazgo crítico/importante (rastreando el origen del dato antes de asignar severidad). Esta pasada **corrigió varias severidades infladas** y **descartó 2 hallazgos fabricados/falsos positivos** (ver nota de honestidad al final). Las severidades de abajo son las corregidas tras verificación.

## Veredicto general

En 24 h el proyecto pasó de "maduro con un bug crítico de pérdida de datos" a **maduro y sin hallazgos críticos**. De los 16 hallazgos de ayer, **13 están resueltos y verificados en el código** (no solo "claimed"): el bug crítico de hidratación, el tragado de errores del adapter, el bucle de repaso, CI, lazy del seed, writes delta de log/SRS, endurecimiento del route gate, tipos generados, el rail de exhaustividad y la página de Stats real. Quedan 3 pendientes y son todos de baja severidad (deck-focus muerto, una etiqueta hardcodeada, y 8 micro-deudas).

Ya no hay nada que sangre en producción. Lo que queda se divide en dos: **(1) huecos de producto prometidos pero no cumplidos** —pricing con tiers de pago sin cobro ni gating, y export sin import— y **(2) pulido de resiliencia/UX** —no hay `app/error.vue`, no hay estado de carga, y el chart de ritmo de Stats es invisible para lectores de pantalla—. Ninguno es urgente; el de mayor retorno honesto es decidir el modelo de monetización (o quitar el pricing falso) y añadir `app/error.vue` como red de seguridad de fallos fatales.

## Progreso desde la auditoría anterior (modo comparación)

**Resueltos y verificados (13):**

| # | Hallazgo previo | Cómo se cerró |
|---|---|---|
| 🔴 P1 | Hidratación contra noop; `INITIAL_SESSION` no re-hidrataba data stores (pérdida de datos) | `useAuth.ts:57-64` re-hidrata los 5 data stores + settings en `INITIAL_SESSION` vía `appStatus.track`; test de regresión en `useAuth.init.test.ts:51-69`. Doblemente seguro porque P2 ya no permite que un error de lectura se confunda con "sin datos". |
| 🟡 P2 | `SupabaseAdapter` se tragaba todo `{error}` | `supabase.ts:13-17` `assertOk()` lanza en cada read/write (incl. ambas mitades de delete+upsert); tests con mock que devuelve `error` (`supabase.test.ts:215-242`). |
| 🟡 P3 | Fetch fallido = estado vacío silencioso | `appStatus.ts` (idle/loading/ready/error + `retry`) + `DataErrorBanner.vue` (role=alert) montado en `default.vue:54`. **Parcial:** cubre los fallos de hidratación, pero falta `app/error.vue` para fallos fatales fuera de ese camino → ver nuevo importante #1. |
| 🟡 P4 | Bucle de repaso roto (`setReviewState` sin call site) | `log.vue:48-56` botón "marcar repasado" → `setReviewState`; misma predicado `isPendingReview` que el clima del jardín, así que la lluvia sí se despeja. |
| 🟡 P5 | Seed de gramática (~893 KB) eager | `grammar.ts:33` `await import('~/seed/grammars')` solo en la rama fallback vacía. |
| 🟡 P6 | Log re-subía todo el historial por respuesta | `log.add()` → `storage.append()` (1 INSERT, `supabase.ts:348`). |
| 🟡 P7 | Sin CI | `.github/workflows/ci.yml`: lint+typecheck+test en push/PR, Node 24. |
| 🟡 P8 | SRS map re-upserteado entero ×3 | `srs.ts` → `upsertOne()` (1 fila por carta, `supabase.ts:361`). |
| 🟢 P9 | Route gate confiaba en substring sin validar | `welcome-redirect.global.ts:40-51` parsea `expires_at` y degrada seguro; tests de caducidad. |
| 🟢 P10 | Default silencioso para `StorageKey` no mapeado | `assertNever(key)` en ambos switches (rail de exhaustividad). |
| 🟢 P11 | `clear()` omitía `user_settings` | `clear()` ahora borra `user_settings` + `user_escape_room`; test. *(Queda latente: `remove()` sobre key jsonb escribe `[]` en vez de borrar — dormido, nunca se llama.)* |
| 🟢 P12 | Sin tipos `Database` generados | `database.types.ts` + cliente `createClient<Database>`; casts `as unknown as` eliminados (solo quedan 2 `as Json` intencionales en jsonb). |
| 🟢 P13 | `/stats` placeholder | Página real (`stats.vue` + `useStats.ts` + `lib/stats/*`), con tests. |

**Siguen abiertos (3, todos baja severidad):**

- ⚠️ **P14 — deck-focus muerto.** `grammar.ts:45-51` `toggleDeck` sigue mutando solo en memoria, **sin call site** y sin persistir `excludedDeckIds` (no se hidrata). Cualquier exclusión se pierde al recargar. Cerrarlo requiere `STORAGE_KEYS` nuevo + mapping/migración.
- ⚠️ **P15 — `기타 (Otros)` hardcodeado** en `library.vue:108` (la parte coreana está bien por convención de marca; el `(Otros)` en español se salta i18n en los 8 locales).
- ⚠️ **P16 — 8 micro-deudas, todas sin tocar:** `log.id` float floored (`log.ts:30` vs `supabase.ts:73`); `bomi.ts` sin tests; `typeCheck:false` en build (mitigado por CI); `i18n lazy:false`; PNG de portada de 513 KB como thumbnail; settings hidratado dos veces en recarga dura; `runtimeConfig.supabaseServiceRoleKey` muerto en SPA; decodificación de cosmético duplicada (`escape-room.ts:207` vs `usePremios.ts:69`).

## Lo que está bien hecho

- **La cirugía de la auditoría anterior fue limpia y con red de tests.** Cada fix crítico/importante trae su test (regresión de hidratación, ramas de error del adapter con mock fiel, delta writes que asertan que el write full-collection *no* se llama). Es la marca de un equipo que arregla con disciplina, no a parches.
- **Seguridad sólida y verificada en vivo.** RLS completo y correcto en las 10 tablas (confirmado contra el proyecto Supabase `zbohswpyydwvzowvjaiw`: `rls_enabled=true`, cero lints de RLS); catálogo SELECT-only; secretos fuera del bundle; XSS nulo (un solo `innerHTML` de bootstrap de tema, sin input); edge function de borrado verifica el JWT del propio usuario antes de `admin.deleteUser` (imposible borrar otra cuenta).
- **Capa de datos ejemplar.** `StorageAdapter` con interfaz async estrecha, 3 implementaciones, facade stateless re-resuelto por acción, rail de exhaustividad, `assertOk`, writes O(1) delta. `lib/domain` y `lib/garden` son matemática pura sin Vue.
- **Stats es una página real y correcta.** Métricas derivadas de funciones puras inyectables (`now` parametrizado), guardas de división por cero en todos lados, distribución por TOPIK con regex que casa los deck ids reales, CTA `?focus=` cableado de punta a punta a la ruleta. Buena cobertura de tests + paridad i18n en 8 locales.
- **Settings sin tabs-fantasma.** Las pestañas que la memoria marcaba como diferidas (Learning/Appearance) hoy renderizan contenido real y persistente: Apariencia (locale + tema 3-vías), Aprendizaje (CRUD de contextos con piso de activos), Cuenta (reauth antes de cambiar contraseña, oculta para OAuth-only), Danger Zone (escribir DELETE + edge function). Accesibilidad fuerte (tablist ARIA, radiogroup, focus-visible).
- **Escape-room como vertical slice completo.** Nivel 02 con intro/outro y "farewell shot" real, audio por sala, progreso cross-run persistido, loop de trofeos/equipar cableado. Los niveles 3-10 son runway honesto (`coming-soon` con sello).
- **Accesibilidad de movimiento de primera.** `prefers-reduced-motion` con reset global duro + 31 componentes guardando sus keyframes; `Modal.vue` es un diálogo accesible de manual.

## Hallazgos priorizados (nuevos, post-verificación adversarial)

### 🔴 Críticos
**Ninguno.** El proyecto ya no tiene hallazgos críticos. (Dos propuestas iniciales —`app/error.vue` ausente y la inversión de capas del jardín— se degradaron a importante/mejora tras verificar.)

### 🟡 Importantes

- **No existe `app/error.vue` — un error fatal cae a la pantalla blanca sin estilo de Nuxt.** El `DataErrorBanner` solo atrapa fallos de hidratación que pasan por `appStatus.track()`. Cualquier otra cosa —error en el `setup` de una página, error de render, 404 de ruta mal escrita, **fallo de carga de chunk en un deploy stale** (rutinario en SPAs)— burbujea a la pantalla de error built-in de Nuxt: sin chrome pixel-art, sin locale, sin tema, sin vuelta a la app salvo el botón "atrás". Además `auth/callback.vue:28-34` y `auth/reset-password.vue:53-55` son callejones sin salida (texto de error, sin botón de recuperación). _Dónde:_ `app/` (no hay `error.vue`), `app/pages/auth/callback.vue`, `reset-password.vue`. _Por qué importa:_ SPA en 8 locales detrás de un gate de auth; un usuario en móvil en Corea con un chunk stale acaba en una pantalla rota que ignora toda la identidad y todos los afford­ances de error que ya construiste. _Cómo:_ `app/error.vue` con semántica `NuxtErrorBoundary` (lee `error`, muestra mensaje localizado en el wood-frame, botón "ir a inicio" `clearError({redirect:'/'})` + recarga para chunk-load); reutilizar las keys `errors.*` que ya existen en los 8 locales; añadir un link a `/welcome` en las ramas de error de auth. _(esfuerzo: medio)_

- **El pricing anuncia 3 tiers de pago pero no hay cobro, ni gating, y las features "de pago" ya son gratis.** `pricing.vue:21-41` presenta Sprout (gratis) / Grove ($4/mes, destacado) / Forest ($49 único) con "Cancel any time" — pero cero integración de pago (sin Stripe/Toss/KakaoPay, sin botón de checkout en ninguna card), `AuthUser = User` sin campo de plan/entitlement, y ningún código gatea nada por tier. Todo lo que los tiers de pago prometen —"Cross-device sync", "Data export", "Deeper stats"— ya está disponible **gratis** para cualquier usuario logueado (`settings.vue:83` exporta sin condición; sync es el comportamiento por defecto del adapter). La cabecera lo admite: `TODO(v8.1): replace tier copy + numbers`. _Dónde:_ `app/pages/pricing.vue`, `app/lib/auth/types.ts:6`. _Por qué importa:_ la página es pública (menú de welcome + Settings→About), así que usuarios reales ven precios que no pueden pagar por cosas que ya tienen gratis. No hay ningún camino a ingresos. _Cómo:_ **decidir primero la postura de monetización.** Si monetizas: columna `plan`/entitlement en Supabase expuesta en el auth store, gatea las features anunciadas, y cablea checkout (Toss/KakaoPay encajan con el mercado local). Si no aún: reemplaza `pricing.vue` por un panel honesto "gratis durante la beta" y quita la matriz de tiers falsa (igual que el `stale-copy.test.ts` ya forzó a quitar la mentira "Local-only"). _(esfuerzo: grande — es decisión de negocio)_

- **El chart de ritmo de Stats es invisible para lectores de pantalla y no tiene etiquetas de semana.** Las 8 barras de "Practice rhythm" (`stats.vue:82-86`) son `<div>` cuyo único dato es una altura CSS: sin `aria-label`, sin valor por barra, sin eje X (ni fechas ni "esta semana"/"hace 8 semanas"). Las barras de maestría y el ratio easy/hard sí exponen sus números como texto; el chart estrella de la página no. _Por qué importa:_ es la página que pediste endurecer, y a11y+i18n son ciudadanos de primera aquí (focus-visible ya añadido en los CTAs y el banner). Un lector de pantalla no obtiene nada y un usuario vidente no puede leer un solo valor. _Cómo:_ `role="img"` + `aria-label` que resuma la serie (`t('stats.rhythm.aria', { total, weeks: 8 })`), `title`/span sr-only por barra con el conteo, y marcadores mínimos de semana bajo las barras. Requiere keys nuevas en los 8 locales. _(esfuerzo: medio)_

### 🟢 Mejoras

**Stats (la página que pediste) — además del a11y de arriba:**
- **El ratio easy/hard miente para un usuario solo-SRS sin log.** `hasData` puede ser true por filas SRS solas (`markSeen` crea fila sin entrada de log). Entonces `log.entries` está vacío y la plantilla pinta `0% easy / 100% hard` (el lado hard se calcula como `100 - easyPct`, no del conteo real). Muestra un "100% te resultó difícil" fabricado y desmotivador en una página pensada para motivar. _Cómo (rápido):_ `v-if="split.easy + split.hard > 0"` en el bloque `.ratio` (o `—` neutro). `stats.vue:87-96`.
- **Las sub-barras de maestría pueden recortarse/desbordar** por tres `Math.round()` independientes que suman ≠100% (`overflow:hidden` recorta la cola tree). El fill y el porcentaje impreso pueden contradecirse. _Cómo:_ redondeo acumulado o `flex-grow`. `stats.vue:24,63-67`. _(rápido)_
- **Flash de "no data" durante la hidratación.** Para un usuario con datos, en recarga dura aparece el empty-state ("No stats yet…") hasta que resuelve la nube. Existe `appStatus.status==='loading'` pero ninguna página lo consume. _Cómo:_ gatear empty vs dashboard en el status de carga / un ref `hydrated`. _(medio)_

**Settings (la página que pediste):**
- **Falta IMPORT de datos (el export es de un solo sentido).** `useDataExport.ts` ya arma un JSON versionado y round-trippable con las 8 keys; no hay contraparte para recargarlo. El export queda como artefacto muerto tras un borrado de cuenta o al migrar de dispositivo. _Cómo:_ `useDataImport` espejo (file picker → validar `app==='munbeop-garden'` → escribir cada key con la validación defensiva que ya usan los hydrate) + botón junto a Export con paso de confirmación. _(medio)_
- **Contexto CRUD optimista sin rollback.** `contexts.ts` muta en memoria y luego hace `await write()`; el adapter ahora lanza, pero no hay try/catch → si la nube falla, la UI queda desincronizada hasta recargar, sin aviso. (Verificado: el toast de éxito **sí** espera a que el write resuelva, así que no miente; el patrón optimista es además común a otros stores.) _Cómo:_ snapshot+rollback+toast de error, o enrutar por `appStatus.track`. _(medio)_
- **Cambio de email no está reauth-gated** (a diferencia del de contraseña, que sí re-verifica la actual). Es una primitiva de account-takeover; el helper `reauthenticate()` ya existe. Mitigado porque Supabase exige confirmar por link. `AccountCredentials.vue:59-70`. _(rápido)_
- **Sin link "olvidé mi contraseña" dentro de Settings.** `resetPassword()` y la página existen y están testeados, pero la pestaña Cuenta solo ofrece cambio-con-contraseña-actual; un usuario logueado que la olvidó no tiene salida. _Cómo:_ botón "¿Olvidaste tu contraseña actual?" → `resetPassword(user.email)`. _(rápido)_
- **Contradicción de comentarios sobre locale.** Tres sitios dicen "locale es per-device, no lo persiste el adapter", pero `settings.ts:53` lo refleja en el blob `prefs` sincronizado y gana al hidratar → locale *sí* es account-global. No es bug (la nube gana), pero es trampa de mantenimiento. _Cómo:_ alinear comentarios con el comportamiento real (o dejar de reflejarlo). _(medio)_
- **Confirmación de alcance:** no hay control global de audio en Settings (el audio vive dentro del escape-room). Si se quiere, cabe en el blob `prefs` sin migración nueva.

**UX / first-run:**
- **"Invierno" y "cero progreso" son visualmente idénticos, sin guía de primer uso.** Un usuario nuevo (pct=0) ve cielo de invierno + nieve + árbol pelado + Bomi dormido + "Dormant (winter)" — igual que un usuario veterano en un nivel sin empezar. No hay copy de primer uso. _Cómo:_ cuando `active.pct===0 && lastPracticedAt===null`, overlay con CTA "planta tu primera frase". _Además:_ las keys `empty.garden` y `empty.stats` son **muertas** (no se referencian en ningún sitio) — borrarlas de los 8 locales. _(medio)_
- **Sin "skip to content"** y `.sr-only`/`:focus-visible` son por-componente, no globales: un usuario de teclado tabula por 7+ items del sidebar en cada página. _(rápido)_
- **Regiones aria-live anidadas en el stack de toasts** (wrapper `polite` + cada toast con su `alert/status`) — comportamiento indefinido en lectores de pantalla. Quitar el live del wrapper. _(rápido)_

**Rendimiento / bundle:**
- **`i18n lazy:false`** mete los 8 locales en el chunk eager (~125 KB raw / ~42 KB gzip; ~33-37 KB gzip son locales no usados). _Cómo:_ `lazy:true` (los `file:` ya están). _(medio, casi una línea)_
- **`CottageCorner` baja ambos PNGs light+dark (~332 KB)** en cada página y oculta uno con `display:none` (el navegador igual los descarga). _Cómo:_ swap por `background-image` CSS (solo baja el del tema activo) y re-encodar a WebP. _(rápido)_
- **Definiciones de niveles de escape-room (~58 KB raw / ~16 KB gzip) entran al chunk de layout** vía `AccountMenu → usePremios → LEVEL_REGISTRY`, solo para el pip de trofeos. Crece ~20-40 KB por cada nivel que pase a `playable`. _Cómo:_ extraer un `REWARDS_BY_LEVEL` leve a un módulo hoja. _(medio)_
- **Doble hidratación en recarga dura** (pase noop desechable + pase real `INITIAL_SESSION`, que re-lee el catálogo completo). _Cómo:_ gatear el pase del layout en presencia de token de sesión. _(medio)_
- **Sin telemetría ni captura de errores.** SPA logueado con try/catch agresivo (correcto) → estás ciego a lo que falla en prod. El entorno ya expone Sentry y PostHog. _Cómo:_ `app/error.vue` + plugin que cablee `config.errorHandler` + `unhandledrejection` a un sink; capturar excepciones en los `catch {}` de write/sync manteniendo el toast. _(medio)_

**Estructura / tests / seguridad-defensa:**
- **Constantes de dominio del jardín viven dentro de `PixelTree.vue`** (`TREE_SPECIES`, `TREE_THRESHOLDS`, `layersForProgress`), importadas hacia arriba por `lib/garden` y `useGardenState.ts:4` (este último importa un **valor** runtime desde un componente). Inversión de capas real que ensucia la testabilidad. _(Nota: la auditoría inicial afirmó un "ciclo de imports" — **es falso**, `PixelTree.vue` no importa de `~/lib/garden`; por eso esto es mejora, no importante.)_ _Cómo:_ extraer a `lib/garden/tree.ts`. _(medio)_
- **`poses.ts` (datos de Bomi) vive en `components/` pero lo consume el store** `bomi.ts:20`. Misma clase de inversión, más leve. _Cómo:_ mover a `lib/bomi/`. _(rápido)_
- **Sin regla de lint de fronteras de import** (`eslint.config.mjs` tiene 3 reglas). Las 2 inversiones de arriba entraron precisamente por eso. _Cómo:_ `import/no-cycle` + `no-restricted-imports` por capa. _(medio)_
- **`bomi.ts` (máquina de poses con timers) sin tests** — único store sin cobertura. Lógica de umbrales + cancelación de timers, barata de fijar con fake timers. _(medio)_
- **La edge function `delete-account` se testea por regex de texto, no por comportamiento** — las 4 ramas (401 sin header, 401 sesión inválida, 500, 200 ok) sin ejercer. Es la operación más destructiva de la app. _Cómo:_ exportar el handler y drive un `Request`. _(medio)_
- **`useGardenState` y `usePractice` (orquestación) sin tests** — solo su lib pura. Son los seams read/write del producto; el patrón de `useStats.test.ts` aplica directo. _(medio)_
- **`setReviewState` sigue haciendo write O(historial)** (`log.ts:52` → re-upsert de todo el log para voltear una fila). Es el último write no-delta; el log es la colección de crecimiento ilimitado. _Cómo:_ `updateOne`/`upsertOne` por id. _(medio)_
- **Protección de contraseña filtrada DESACTIVADA en Supabase** (advisor `auth_leaked_password_protection = DISABLED`) y el form de **signup no exige longitud mínima** (reset y cambio sí exigen 8). El fix real es el toggle del dashboard + piso server-side (el gate en el cliente es teatro: la anon key es pública). Riesgo per-cuenta (RLS aísla), por eso mejora, no importante. _(rápido/config)_
- **Script de migración admin desactiva verificación TLS** (`apply-resync-migration.mjs:41,48` `rejectUnauthorized:false`) sobre la conexión con la credencial de mayor privilegio. Es herramienta local de dev. _Cómo:_ usar la CA del pooler o `ssl:true`. _(rápido)_

## Análisis por área

### Estructura / arquitectura
Sigue siendo el punto fuerte: sin god files (el mayor no-seed es 543 LOC), responsabilidades separadas, adapter ejemplar. Las únicas deudas reales son la inversión de capas jardín→`.vue` (y la gemela de `poses.ts`) y la ausencia de una regla de lint que proteja las fronteras que la arquitectura asume. La duplicación de decodificación de cosméticos (P16) sigue ahí.

### Seguridad
La más fuerte y verificada en vivo: RLS completo (10/10 tablas, cero lints), sin secretos en cliente, XSS nulo, edge function de borrado a prueba de coerción, route gate ya endurecido con chequeo de expiración. Lo que queda es defensa-en-profundidad de cuentas (activar leaked-password protection + piso de contraseña server-side; reauth en cambio de email) y un detalle de tooling local (TLS en el script de migración). Nada de exposición de datos.

### Diseño visual / UX
Buen oficio (movimiento accesible, modal de manual, empty states localizados, responsive deliberado). Los huecos son los estados que la gente olvida bajo fallo/primer-uso: no hay `app/error.vue` (el mayor), no se renderiza el estado de carga (flash de invierno en recarga), invierno≈cero-progreso sin onboarding, y el chart de ritmo de Stats sin a11y. Hay keys i18n muertas (`empty.garden`, `empty.stats`).

### Features / producto
El loop señal (práctica→SRS→jardín→escape-room→trofeos) está pulido y completo, con persistencia cross-run y export. Lo prometido-no-cumplido: **pricing con tiers de pago sin cobro ni gating** (y features de pago ya gratis), **import ausente**, copy `TODO(v8.1)` en pricing/features/policies (hardcodeado en inglés en los 8 locales), las 3 secciones "Coming soon" permanentes del study sheet de la library, y cero telemetría para decidir el roadmap con evidencia.

### Datos / estado
La capa de datos quedó endurecida: `assertOk`, rail de exhaustividad, writes delta para log/SRS, tipos generados. Único write O(n) restante: `setReviewState`. Cobertura de error del adapter excelente. Gaps de test: `bomi.ts`, orquestación (`useGardenState`/`usePractice`), comportamiento de la edge function.

## Plan sugerido

**Ahora (esta semana) — victorias rápidas + red de seguridad:**
1. **Quick wins de Stats** (la página que pediste): guarda `v-if` en el ratio easy/hard (no más "100% hard" falso), redondeo de las sub-barras de maestría. `stats.vue`. _(rápido)_
2. **`app/error.vue`** + links de recuperación en `auth/callback` y `reset-password`. La mayor red de seguridad de UX que falta. _(medio)_
3. **A11y del chart de ritmo de Stats** (`role="img"` + aria-label + valor por barra + etiquetas de semana, keys en 8 locales). _(medio)_
4. **Higiene de config/seguridad (config, no código):** activar *Leaked Password Protection* y subir el piso de longitud en el dashboard de Supabase; añadir `MIN_LEN>=8` al form de signup. _(rápido)_
5. **Limpieza:** key i18n para `(Otros)` (`library.vue:108`); borrar las keys muertas `empty.garden`/`empty.stats`. _(rápido)_

**Próximo (este mes) — completar loops de producto + first-load:**
6. **Decidir monetización** y actuar: gatear features por plan + checkout (Toss/KakaoPay), **o** reemplazar el pricing falso por un panel honesto. Es la mayor incongruencia de producto visible. _(grande / decisión de negocio)_
7. **Import de datos** (espejo de `useDataExport`) en la pestaña Datos. _(medio)_
8. **Estado de carga / skeleton** (mata el flash de invierno) + hint de primer-uso en el jardín. _(medio)_
9. **Recortes de bundle:** `i18n lazy:true`, `CottageCorner` a un solo PNG por tema, `REWARDS_BY_LEVEL` hoja para sacar los niveles del chunk de layout. _(medio)_
10. **Telemetría + captura de errores** (Sentry/PostHog ya disponibles; la policy promete "no third-party trackers", valorar self-hosted). _(medio)_

**Más adelante — rumbo de lanzamiento:**
11. Copy real de pricing/features/policies como keys i18n (depende de #6).
12. Tests pendientes: `bomi.ts`, comportamiento de `delete-account`, orquestación `useGardenState`/`usePractice`.
13. `setReviewState` a write delta (`updateOne`); cerrar deck-focus (persistir `excludedDeckIds` + UI, necesita migración); `log.id` por bigserial.
14. Higiene de capas: extraer constantes del jardín a `lib/garden/tree.ts` y `poses.ts` a `lib/bomi/`; regla de lint `import/no-cycle` + fronteras.
15. Reauth en cambio de email; link "olvidé contraseña" en Settings; TLS en el script de migración.

---

### Nota de honestidad sobre esta auditoría
La verificación adversarial descartó/corrigió hallazgos de la primera pasada de los agentes, para no entrenarte a ignorar las alertas:
- **Fabricado:** un "ciclo de imports" en `PixelTree.vue` (afirmaba que importa de `~/lib/garden` — **no lo hace**; su único import es `vue`). La inversión de capas es real, pero no hay ciclo → degradado a mejora.
- **Falso positivo (refutado contra el build real):** `topik-spine.json` (72 KB) supuestamente en el chunk eager. El build de producción muestra que el tree-shaking funciona y el JSON vive en chunks de ruta lazy, no en el entry. No hay nada que arreglar ahí.
- **Severidades infladas corregidas:** varios "importantes" bajaron a "mejora" al confirmar que el fix de fondo es config (no código), que el impacto gzip era mucho menor que el raw citado, o que no había exposición de datos. P. ej. el toast "optimista que miente" en contextos: verificado que **sí** espera al write, no miente.
