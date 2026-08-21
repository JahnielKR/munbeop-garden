# Auditoría de Munbeop Garden — segunda pasada (forward-looking)
_Fecha: 2026-06-28 (pasada 2, post-fixes) · Stack: Nuxt 4 SPA, Vue 3, Pinia, Supabase (anon+RLS), i18n 8 locales, Vitest (301 archivos), pnpm · Pasada 1 de hoy: `AUDITORIA-2026-06-28-pass1.md`._

> Re-análisis multi-agente (26 agentes, 7 dimensiones forward-looking + verificación adversarial) sobre el código **actual**, tras los 7 PRs de hoy (#117–#123). Objetivo: **qué trabajar AHORA**, excluyendo monetización (diferida por el owner). Anclado en el bundle **medido** del build real.

## Veredicto general

El proyecto está **maduro y sano**: los 7 PRs de hoy cerraron la deuda sustantiva y **no introdujeron regresiones** (verificado). Seguridad estable (RLS completo; único advisor = leaked-password, plan Free). El coreano —lo más difícil de validar— es **sólido**: el motor de conjugación y números pasan 400+ golden tests y no se encontró ni una forma generada o autorada incorrecta. Lo que queda no es deuda de bugs viejos, sino **trabajo de alto valor hacia adelante**, concentrado en cuatro frentes: **(1)** un fallo real de pérdida de datos en el loop central de práctica bajo red flaky; **(2)** el peso del bundle en móvil (un chunk medido de 5.5MB en la biblioteca); **(3)** resiliencia de datos no propagada a varios stores; y **(4)** a11y estructural + PWA real para los usuarios móviles coreanos.

## Lo que está bien hecho (para calibrar)

- **Los 7 PRs de hoy están limpios** — el verificador de regresión no encontró ningún defecto introducido (settings reset, i18n páginas, heatmap a11y, inversiones de capa, Bomi tick, CottageCorner). El gate ahora incluye `pnpm build` en CI.
- **Coreano de primera.** Conjugación (todos los irregulares ㅂ/ㄷ/ㅅ/ㄹ/ㅡ/르/ㅎ + 으시 + 습니다/어요, 340 golden), números (만/억, 유월/시월, 공/영, 스무, 61 golden), honoríficos suppletivos (드세요/잡수십니다/계세요/께서), 분류사 nativo vs sino, y hasta las formas literarias TOPIK-6 (좋으련마는, -기로서니, -(으)ㄹ망정) son correctas. **Cero coreano mal generado o autorado.**
- **a11y de los drills, ejemplar.** `Modal.vue` con focus-trap + Esc + restore; el Particle Lab es el patrón oro (aria-live de feedback, foco por fase, verdictos texto+icono no-solo-color); Counter/Cloze/number-market envuelven el verdicto en `role=status` con ✓/✗.
- **Móvil consciente.** Shell con MobileNavbar fija de 64px + safe-area, tiles con `min-height:44px`, grids con `auto-fit/minmax`, CottageCorner oculta en móvil.

## Hallazgos priorizados

### 🔴 Crítico

- **Pérdida silenciosa de la respuesta de práctica cuando el write a la nube falla a mitad del drill.** `usePractice.persistEntry` (`usePractice.ts:137-168`) no tiene try/catch; y `GrammarCard` llama `reset()` (borra `sentence.value`) **sincrónicamente** justo tras `emit('submit')`, **antes** de que el `await persistEntry` resuelva (`GrammarCard.vue:57-96`). Si `storage.append` (Supabase) falla —rutinario en red móvil flaky en Corea— pasa todo esto **en silencio**: el input ya está borrado, el SRS no se recalcula, la carta no avanza, `onSubmit` queda en una promesa rechazada (sin toast, sin nada), y la entrada en memoria desaparece al recargar (nunca llegó a la nube). El loop central de la app. _Por qué importa:_ es la acción más frecuente del usuario, en el peor entorno de red, y pierde su esfuerzo + su progreso SRS + el incremento del jardín sin avisar. _Cómo:_ envolver `persistEntry` en try/catch; ante fallo, **preservar la frase**, mostrar toast de reintento, y no limpiar/avanzar hasta confirmar (o reintentar). El patrón de rollback ya existe en `contexts`/`escapeRoom`; aplicarlo al loop. _(esfuerzo: medio)_

### 🟡 Importantes

**Bundle / móvil (el mayor lever de rendimiento):**
- **El seed de usage-notes (5.5MB) se importa estáticamente en la ruta de biblioteca y de rescate.** `lib/usage-notes/index.ts:2` hace `import { USAGE_NOTES } from '~/seed/usage-notes'` (los 6 niveles, ~4.5MB), y `UsageNotesSection.vue` + `RescuePanel.vue` lo importan estático → el chunk `9bnLjc6u.js` (5,548,259 bytes medidos) es dependencia estática del chunk de `/library` y de `/practice/rescue`. **No** está en el first-paint (verificado: el home no lo carga), pero abrir la biblioteca (referencia de todo el currículo) o el rescate descarga ~5.5MB de JS antes de pintar la primera carta. _Cómo:_ `import()` dinámico por nivel TOPIK en `notesFor`/`examplesFor`/`guideFor`, **espejo exacto** de `stores/grammar.ts:53` (`await import('~/seed/grammars')`, que por eso es un chunk lazy de 313KB). Convierte ~5.5MB eager en un shell + fetch por nivel bajo demanda. _(esfuerzo: medio · el mayor impacto móvil)_
- **Cada entrada del seed lleva los 8 idiomas** (`seed/locale.ts:11`, helper posicional `L()`), así que ~7/8 del payload es locale que el usuario nunca ve. Tras el split por nivel, un split por locale más lleva la descarga real de ~5.5MB a ~100-150KB. _(esfuerzo: grande, escalonar tras lo anterior)_
- **grammar-examples (489KB) + pronunciation (61KB)** comparten el mismo anti-patrón de import estático en la ruta de biblioteca — arreglar junto con usage-notes. _(medio)_
- **El input de práctica dispara auto-zoom en iOS Safari** (font-size 14px < 16px, `ui/Input.vue:85`). Afecta al control más usado (frase de práctica) + login + deck-builder. _Cómo:_ subir a `16px` (one-liner; el autor de DictationInput ya lo evitó a 20px, prueba de que se notó). _(rápido · victoria enorme)_
- **La app se vende como PWA pero no es instalable** — la app Nuxt no tiene web manifest, ni `apple-mobile-web-app` meta, ni service worker (el `service-worker.js` de la raíz es del legacy v2.22). Sin offline, no instalable, y los recordatorios de repaso (Step 16) no pueden disparar con la app cerrada. _(medio)_

**Resiliencia de datos (la disciplina de rollback no se propagó):**
- **customDecks puede borrar TODOS los mazos en la nube** ante un fallo a mitad de write. `customDecks.ts:37-67` usa el mismo delete-then-upsert sin rollback que se arregló en contexts: un corte de red entre el delete y el upsert deja la nube vacía mientras el estado local parece bien, hasta la próxima hidratación. _Cómo:_ snapshot+rollback como en contexts. _(medio)_
- **custom-grammars: mismo patrón** sin rollback (`grammar.ts:92-121`). _(rápido)_
- **El import de datos no es atómico** (`useDataImport.ts:15-27`): un fallo a mitad deja la cuenta medio-sobrescrita. _Cómo:_ validar todo primero, o escribir transaccional/con rollback. _(medio)_

**a11y estructural (lo que la pasada 1 no tocó):**
- **Sin "skip to content" y sin gestión de foco/anuncio en cambio de ruta** (`AppShell.vue:43`) — en esta SPA `ssr:false`, un usuario de teclado/lector re-tabula el sidebar de 7 ítems en cada una de las 26 páginas, y ningún cambio de página se anuncia. _(medio)_
- **El textarea de "escribe la frase" no tiene label accesible** (`SentenceInput.vue` → `Input.vue` solo con `:placeholder`) — el control más usado del flujo. _(rápido)_
- **number-market modo Speed no anuncia correcto/incorrecto** (sus modos hermanos sí). _(rápido)_

**Producto:**
- **El diario es de solo-escritura** (`log.vue:30`): muestra solo las 20 entradas más nuevas, sin paginación, búsqueda ni borrar — y el jardín entero se construye sobre esa metáfora del diario. _(medio)_
- **Sin captura de errores global** en producción (solo un `error.vue` estático). Un sink self-hosted/solo-errores cumpliría sin romper "no third-party trackers". _(rápido)_
- **Las stats "gramáticas más difíciles" no apilan en pantalla estrecha** (`stats.vue:349-400`). _(rápido)_

### 🟢 Mejoras

- **Coreano:** el único riesgo real son los bancos **TOPIK 5/6** (literario/arcaico, no verificables por test) — enfocar ahí la review nativa de la esposa en vez de repartirla; todo bajo TOPIK 5 es bajo riesgo. Un par de ítems menores de naturalidad/gloss para esa review (p. ej. cloze 우유를 먹었어요 vs gloss "drank milk"; espaciado en lecturas de hora 한 시/삼십 분).
- **Touch targets < 44px** (Button md ~37px, sm ~29px), labels de nav móvil a **7px**, celdas del heatmap a 10px (no toqueables para inspección por día).
- **Sidebar `<nav>` sin label + sin `aria-current`** en el activo; **alt/aria del escape-room** son ids técnicos crudos.
- **`user_log.id` PK** sigue colisionando en el mismo ms (`Math.floor` mata el desempate aleatorio) — baja prob., diferido.
- **Discovery de labs:** el lab de rescate no tiene tarjeta en el hub; el onboarding no presenta los 20 labs a usuarios nuevos.

## Plan sugerido (qué trabajar ahora)

**Ahora (esta semana) — el crítico + victorias de alto impacto/bajo esfuerzo:**
1. 🔴 **Arreglar la pérdida de respuesta en el loop de práctica** (try/catch en `persistEntry` + preservar frase + toast de reintento + no avanzar hasta confirmar). _Lo primero._
2. 🟡 **Lazy-load del seed usage-notes/examples/pronunciation** (`import()` por nivel, espejo de `grammar.ts:53`) — quita ~5.5MB de `/library` y `/rescue`. El mayor impacto móvil.
3. 🟡 **`ui/Input.vue` a font-size 16px** — one-liner, mata el auto-zoom de iOS en el input central.
4. 🟡 **Rollback en customDecks + customGrammars** (mismo fix que contexts) — cierra el riesgo de borrar todos los mazos.

**Próximo (este mes):**
5. 🟡 **a11y estructural:** skip-to-content + foco en cambio de ruta (AppShell), label del textarea de práctica, live-feedback en Speed.
6. 🟡 **PWA real:** manifest + service worker en la app Nuxt (instalable + offline + reminders que disparen).
7. 🟡 **Import atómico** + **diario navegable** (paginación/búsqueda/borrar en `/log`).
8. 🟡 **Captura de errores** self-hosted (sin trackers de terceros).

**Más adelante / owner:**
9. Review nativa de la esposa **enfocada en TOPIK 5/6** (literario/arcaico).
10. Split del seed por locale (tras el split por nivel) — descarga real → ~100-150KB.
11. Pulido: touch targets <44px, nav a 7px, heatmap cells, stats stacking, escape-room alt labels, discovery de labs, log-id PK.

---

### Nota de honestidad
La verificación adversarial bajó el 5.5MB de 🔴 a 🟡 (la ruta funciona; es regresión de perf severa en móvil, no rotura funcional) y confirmó que el coreano está sólido (cero formas incorrectas). El verificador de regresión de los 7 PRs de hoy **no encontró nada** — el trabajo de hoy quedó limpio. Monetización quedó **fuera de alcance** por decisión del owner.
