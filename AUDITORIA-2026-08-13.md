# Auditoría integral de Munbeop Garden

Fecha: 13 de agosto de 2026

## Veredicto ejecutivo

Munbeop Garden ya no se siente como un prototipo genérico. Tiene una identidad visual reconocible, una propuesta pedagógica concreta, contenido para TOPIK 1-6, ocho idiomas, varias modalidades de práctica y una cobertura automatizada excepcionalmente amplia.

La mayor deuda no estaba en la cantidad de funciones, sino en los bordes que separan una buena aplicación de una plataforma lista para operar: dependencias vulnerables, semántica de sesión, escrituras demasiado amplias en Supabase, copias incompletas, estados de error ausentes y componentes fuera de pantalla aún accesibles al teclado. Esta auditoría corrigió esos puntos dentro del código.

El proyecto queda técnicamente sano, compilable y con el bloqueo de seguridad de producción cerrado. No lo considero todavía listo para monetización pública por tres decisiones pendientes: definir el sistema real de planes, decidir cómo validar la corrección lingüística de las respuestas abiertas y sustituir el borrador legal por textos revisados para la operación real.

## Estado por prioridad

### P0 - Resuelto el 21 de agosto de 2026

1. Se aplicaron y verificaron `20260821124950_explicit_data_api_grants.sql` y `20260821125151_lock_down_remaining_default_privileges.sql` en el proyecto Supabase vivo.

   Las migraciones revocan los privilegios implícitos de `anon`, reducen `authenticated` y `service_role` a las operaciones necesarias, limitan las secuencias, protegen los objetos futuros propiedad de `postgres` y restringen el catálogo a usuarios autenticados. Se validaron en transacciones antes de aplicarlas y después mediante privilegios efectivos, políticas RLS y pruebas con el rol `authenticated`.

### P1 - Alta importancia

1. Convertir precios conceptuales en un producto real o presentarlos como roadmap.

   `/pricing` muestra Sprout, Grove a USD 4/mes y Forest a USD 49, pero no existen checkout, webhooks, tabla de suscripciones ni comprobación de derechos. La nota de beta aclara que hoy todo es gratis, lo cual evita una promesa falsa, pero la próxima decisión debe ser una de estas dos: implementar facturación y entitlements de extremo a extremo, o reemplazar los precios por una página explícita de beta gratuita.

2. Definir una fuente de verdad para corregir respuestas abiertas.

   La práctica principal comprueba que haya hangul, pero el estudiante se califica a sí mismo como fácil o difícil. Esto funciona como diario de producción, no como evaluación confiable. Una versión premium necesitará reglas deterministas, comparación contra respuestas esperadas o evaluación asistida con explicaciones y límites de coste.

3. Sustituir el borrador legal antes de lanzamiento comercial.

   La página de políticas está traducida y se marca honestamente como borrador. Antes de aceptar pagos necesita razón social, responsable de datos, jurisdicción, retención, subprocesadores, procedimiento de eliminación y un contacto real revisado legalmente.

4. Activar la protección contra contraseñas filtradas al pasar a Supabase Pro.

   El asesor de seguridad confirma que esta protección sigue desactivada. Supabase la ofrece solo en el plan Pro o superior; debe habilitarse antes de una apertura comercial junto con una longitud mínima de al menos ocho caracteres, sin asumir aquí un cambio de plan con coste.

### P2 - Importancia media

1. Recuperar SSR o prerender para las rutas públicas.

   Toda la aplicación usa `ssr: false`. Esto simplificó un problema histórico de hidratación, pero `/welcome`, `/features`, `/pricing` y `/policies` entregan inicialmente un shell vacío. En la comprobación móvil se observó ese lienzo antes de montar Vue. Conviene probar SSR híbrido ahora que Nuxt e i18n fueron actualizados, manteniendo client-only las áreas autenticadas si hace falta.

2. Implementar una PWA real si las notificaciones son parte de la promesa.

   No hay manifest ni service worker servidos por Nuxt. El recordatorio actual se evalúa al abrir la aplicación, por lo que no puede avisar de manera fiable con la plataforma cerrada ni aportar funcionamiento offline.

3. Dividir las notas de uso también por idioma.

   Ya se cargan por nivel TOPIK y bajo demanda, lo cual protege la entrada inicial. Sin embargo, los chunks N4 y N5 contienen los ocho idiomas y rondan 1,15 MB sin comprimir, unos 370 KB gzip. El siguiente corte útil es nivel + locale.

4. Añadir telemetría de producto con privacidad.

   Existe captura de errores de primera parte, pero no medición de activación, finalización de ejercicios, retención, dificultad real por punto gramatical o abandono de onboarding. Sin esa información será difícil priorizar contenido y monetización.

5. Fortalecer el rate limit en infraestructura si aparece abuso.

   `/api/errors` ya limita tamaño, formato y frecuencia. El límite en memoria es adecuado como primera barrera, pero es por instancia. Para abuso real conviene una regla distribuida de firewall o un almacén compartido.

### P3 - Mejora incremental

1. Llevar los controles táctiles pequeños a 44 por 44 px cuando el diseño lo permita. Algunos botones compactos cumplen el mínimo WCAG de 24 px, pero siguen siendo incómodos en móvil.
2. Aumentar el texto de la navegación móvil, que en ciertos puntos baja a 7 px.
3. Autoalojar las fuentes de Google para reducir dependencia externa, latencia y exposición de metadatos.
4. Limpiar avisos deprecados transitivos cuando sus paquetes propietarios publiquen versiones compatibles. No representan vulnerabilidades conocidas hoy.
5. Reducir ruido de `stderr` en pruebas que deliberadamente simulan fallos y en tests de composables que invocan `onMounted` sin un componente huésped.

## Correcciones realizadas

### Seguridad y dependencias

- Nuxt actualizado a 4.5.1 y `@nuxtjs/i18n` a 10.6.0.
- Lockfile actualizado y dependencias transitivas vulnerables fijadas con overrides de `pnpm`.
- Resultado de auditoría de producción: de 32 vulnerabilidades conocidas (2 críticas, 22 altas, 6 moderadas y 2 bajas) a 0 conocidas.
- DevTools desactivado por defecto y eliminada la referencia innecesaria a `service_role` del runtime de la aplicación.
- CI ahora instala con lockfile estricto y bloquea vulnerabilidades altas de producción.
- Vercel usa `pnpm` reproducible y añade encabezados de seguridad: `nosniff`, `DENY`, política de referrer y Permissions Policy.
- El receptor de errores acepta solo JSON, limita el body a 16 KiB, aplica rate limit, evita caché y acota los campos registrados.
- Las URLs de error ya no incluyen query strings, evitando filtrar tokens de recuperación u OAuth.

### Autenticación y cuenta

- El listener de Supabase Auth ya no ejecuta trabajo asíncrono dentro del callback que puede bloquear el cliente.
- El cierre de sesión normal usa alcance local, por lo que no expulsa al usuario de todos sus dispositivos.
- La eliminación de cuenta revoca las sesiones globales antes de borrar al usuario, de forma best effort.
- La salida de una cuenta eliminada limpia el estado local incluso si el usuario ya desapareció del servidor.
- La Edge Function de eliminación fija una versión concreta del cliente Supabase.

### Base de datos y persistencia

- Nueva migración de privilegios explícitos para Data API: `anon` sin acceso a tablas de catálogo o usuario, catálogo legible por autenticados y operaciones de usuario protegidas por RLS.
- Los privilegios por defecto de tablas, secuencias y funciones propiedad de `postgres` quedan completamente privados; cada exposición futura deberá declararse de forma explícita.
- Se eliminó el índice `user_log(user_id, ko)`, que no respaldaba ninguna consulta del producto y registraba cero usos; se conservan los índices de fecha y clave primaria que sí intervienen en lecturas y mutaciones.
- Los IDs de diario ahora los genera PostgreSQL; ya no se intenta insertar un identificador local en una secuencia global.
- Las mutaciones rutinarias de actividad, mazos, gramática personalizada, contextos y revisión escriben una sola fila y hacen rollback local si fallan.
- Cambiar el estado de revisión dejó de reescribir todo el historial del usuario.
- La actividad dejó de borrar y recrear todo el mapa en cada respuesta.
- La actividad diaria usa el RPC atómico `increment_user_activity`: dos dispositivos ya no pueden sobrescribir el mismo total y la cola cliente agrupa concurrencia y reintenta los ticks pendientes tras un fallo de red.
- Las copias ahora incluyen mazos personalizados y actividad, dos colecciones que antes se perdían al exportar.
- La importación rechaza tipos anidados inválidos, fechas, posiciones fraccionarias y enumeraciones incorrectas, además de archivos mayores a 10 MiB.
- La restauración completa usa `restore_user_backup` en una sola transacción PostgreSQL: las claves presentes se reemplazan fielmente, las ausentes quedan intactas y cualquier fila inválida revierte las diez colecciones.
- Los valores `null` de una copia borran la colección correspondiente; los IDs internos del diario se regeneran para evitar colisiones al importar entre cuentas.

### UX y accesibilidad

- `/paths` incorpora skeleton, error con reintento y estado vacío, traducidos en los ocho idiomas.
- El mapa de actividad pasó de cientos de paradas de Tab a un único foco móvil con navegación por flechas, Home y End.
- La cámara de dos paneles marca el panel fuera de pantalla con `inert` y `aria-hidden`, evitando foco y ruido para tecnologías de asistencia.
- Se corrigieron adaptaciones de i18n v10 en ejercicios de cloze, conjugación, placement y registro.
- Se normalizaron etiquetas HTML y el lint queda en cero errores y cero advertencias.

## Evaluación de producto

### Lo mejor

- La marca es memorable. El jardín pixel art, la progresión de plantas y la cámara de entrada tienen personalidad propia.
- La profundidad del contenido es una ventaja competitiva real: TOPIK 1-6, ejemplos, pronunciación, pares confundibles y notas extensas en ocho idiomas.
- La variedad de práctica evita una experiencia de tarjetas monótona: ruleta, cloze, conjugación, partículas, registro, contadores, placement, mercado de números y escape rooms.
- El modelo de dominio está bastante bien separado y las reglas centrales tienen pruebas densas.
- La exportación de datos, eliminación de cuenta, preferencias multicuenta y estados de error muestran una preocupación sana por confianza y autonomía del usuario.

### Lo que más falta

- Una definición nítida del bucle pedagógico: producir, recibir corrección confiable, entender el error y volver a intentarlo en el momento correcto.
- Un onboarding que demuestre ese bucle antes de presentar toda la amplitud de modos.
- Una propuesta comercial coherente con lo que el backend realmente puede autorizar.
- Métricas que permitan distinguir funciones atractivas de funciones que mejoran aprendizaje y retención.
- Una estrategia pública de adquisición: SSR/prerender, metadatos sociales, contenido indexable y medición de conversión.

## Verificación final

- `pnpm lint`: correcto, 0 errores y 0 advertencias.
- `pnpm typecheck`: correcto.
- `pnpm test`: 314 archivos y 7.170 pruebas correctas.
- `pnpm audit --prod --audit-level=high`: 0 vulnerabilidades conocidas.
- `pnpm build`: correcto con Nuxt 4.5.1, Nitro 2.13.4, Vite 8.2.1 y Vue 3.5.41.
- Revisión visual: escritorio 1440x900 y móvil 390x844.
- Portada, features, precios y políticas cargan sin desbordamiento horizontal; la portada mantiene legibilidad y encuadre en móvil.
- Comprobación local final con configuración publicable de Supabase: `/welcome`, menú de acceso y navegación a `/features` sin overlay ni errores de navegador.
- Migraciones de endurecimiento aplicadas al proyecto vivo como versiones `20260821124950` y `20260821125151`.
- Verificación por rol: `authenticated` puede leer 300 gramáticas y 8 contextos, pero con `auth.uid()` nulo no observa filas de `user_log`; las 28 políticas de usuario son exclusivas de `authenticated` y usan `auth.uid()`.
- Optimización `20260821125602` aplicada; el asesor de rendimiento dejó de señalar el índice de historial sin uso. El asesor de seguridad conserva únicamente la protección de contraseñas filtradas, dependiente del plan Pro.
- RPC atómico de actividad aplicado como `20260821130400`; una prueba con rol `authenticated` confirmó incrementos `1 + 2 = 3`, valor persistido `3` y rollback limpio.
- Restauración transaccional aplicada como `20260821131340`; se probaron las diez colecciones, el reemplazo parcial, la regeneración de IDs y el rollback después de un fallo deliberado, sin persistir datos de prueba.
- `git diff --check`: correcto. Los avisos mostrados son solo normalización futura LF/CRLF de Git en Windows.

## Actualización operativa del 21 de agosto

La conexión administrativa volvió a estar disponible. Se detectaron dos migraciones aplicadas directamente en producción el 15 de agosto y se recuperaron sus sentencias al repositorio para eliminar la deriva de historial. Después se desplegaron dos capas de privilegios mínimos, la eliminación del índice sin uso, el incremento atómico de actividad y la restauración transaccional, siempre con el número asignado por Supabase reflejado localmente. El antiguo bloqueo P0 queda cerrado y el historial remoto coincide con los archivos del repositorio.

## Referencias técnicas

- [Nuxt 4.5 security release](https://nuxt.com/blog/v4-5-security)
- [Nuxt changelog](https://nuxt.com/changelog)
- [Migración de Nuxt i18n](https://i18n.nuxtjs.org/docs/guide/migrating)
- [Opciones actuales de Nuxt i18n](https://i18n.nuxtjs.org/docs/api/options)
- [Seguridad de Supabase Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Seguridad de contraseñas en Supabase Auth](https://supabase.com/docs/guides/auth/password-security)
- [Cierre de sesión en Supabase Auth](https://supabase.com/docs/guides/auth/signout)
- [Gestión de datos de usuario en Supabase Auth](https://supabase.com/docs/guides/auth/managing-user-data)
