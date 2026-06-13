# Spec — Sidebar plegado como mini-rail de iconos + toggle integrado

Fecha: 2026-06-13 · Estado: aprobado por Jhoan (chat 2026-06-13, "dale")
Sustituye el comportamiento "se pliega a 0" del garden spec §5.5.

## 1. Problema

Plegado, el sidebar desaparece por completo (grid `220px → 0px`): no se puede
navegar sin expandirlo, y el único control visible es el botón de 22×44 px
colgado del borde con un track sticky (hack con historial de bugs de drift).

## 2. Diseño

### AppShell.vue

- Grid: `220px 1fr` ↔ **`64px 1fr`** (la columna nunca llega a 0). Misma
  transición de 240 ms sobre `grid-template-columns`.
- Se elimina **entero** el bloque del handle: `.shell__handle`,
  `.shell__collapse`, sus reglas (hover/focus/collapsed/PRM/mobile) y el
  botón del template. Nada vuelve a colgar del borde.
- `<AppSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />` —
  el shell sigue siendo el dueño del estado y de su persistencia
  (localStorage `ui.sidebarCollapsed`, clave sin cambios — las preferencias
  existentes sobreviven).
- `.shell__sidebar` ya no fija `width: 220px`: el ancho interior pasa a ser
  responsabilidad del propio sidebar en cada estado, con su propia
  transición de `width` 240 ms para acompañar al grid.
- Mobile (≤768 px) intacto: rail oculto, MobileNavbar manda.

### AppSidebar.vue

- Props: `collapsed?: boolean`; emit: `toggle`. Clase raíz
  `.sidebar--collapsed` cuando aplica.
- **Plegado (64 px)**:
  - Los 6 links se vuelven casillas cuadradas centradas (alto 44 px, blanco
    táctil), solo icono. Label oculto pero el nombre accesible se conserva:
    `:aria-label` y `:title` (tooltip nativo) siempre presentes en el link.
  - La pestaña activa conserva ventana `--paper` + marco `--ink-line` +
    sombra dura (se lee "icono enmarcado"). El cursor ▶ (`::before`) se
    oculta plegado — no hay sitio a la izquierda; el marco carga la señal.
  - Marca: solo `문법` reducido (~18 px) y centrado, contorno de 8
    direcciones intacto; `Garden` oculto.
  - Footer (AccountWidget + LocaleSwitcher): `display: none` — contenido
    textual que no cabe; se accede expandiendo.
- **Toggle nuevo**: `<button>` como fila al fondo del sidebar (debajo del
  footer), visible en ambos estados:
  - Expandido: glifo `◂` en la columna de icono + label
    `t('nav.sidebar_collapse')` (clave existente, traducida en los 8
    locales). Plegado: casilla cuadrada con `▸` centrado y
    `t('nav.sidebar_expand')` como aria-label/title.
  - Mismo lenguaje visual que los links (hover tint, focus ring, fuente
    pixel); `aria-expanded="!collapsed"`.
- El flip de layout interno (labels/footers) es seco al cambiar la clase;
  el movimiento de 240 ms del ancho lo arropa. Estética pixel: correcto.

## 3. Fuera de alcance

- Variante compacta de AccountWidget/LocaleSwitcher.
- Tooltips pixel custom (se usa `title` nativo).
- Cambios en MobileNavbar o en el cursor ▶ expandido (queda como está).

## 4. Verificación

1. Pre-vuelo (workflow): claves i18n `nav.sidebar_collapse/expand` presentes
   en los 8 locales; tests que toquen AppShell/AppSidebar/clases `shell__*`;
   otros consumidores de `.shell__collapse` / `ui.sidebarCollapsed`.
2. typecheck + suite completa.
3. Review adversarial del diff (workflow) — bugs/CSS/a11y/regresiones; los
   hallazgos confirmados se corrigen antes del merge.
4. Preview: plegar/expandir navegando con click y teclado, casilla activa
   enmarcada, persistencia tras reload, mobile intacto, PRM sin transición.
5. Merge a main → push → deploy Vercel READY.
