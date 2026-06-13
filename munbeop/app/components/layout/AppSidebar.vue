<script setup lang="ts">
import AccountWidget from './AccountWidget.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface NavItem {
  to: string
  labelKey: string
  icon: IconName
}

// Korean subtitles used to ride alongside each label (내 정원, 연습,
// 도서관…). They were dropped per user feedback because longer i18n
// labels (FR "Herboristerie", ID "Perpustakaan") plus the Hangul
// subtitle blew past the 220 px sidebar width and wrapped or got
// truncated. The brand mark 문법 stays — that's the product name,
// not a translation crutch.
const items: NavItem[] = [
  { to: '/', labelKey: 'nav.garden', icon: 'home' },
  { to: '/practice', labelKey: 'nav.practice', icon: 'practice' },
  { to: '/library', labelKey: 'nav.library', icon: 'library' },
  { to: '/stats', labelKey: 'nav.stats', icon: 'stats' },
  { to: '/log', labelKey: 'nav.log', icon: 'log' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'settings' },
]

// Mini-rail mode (spec 2026-06-13): the shell owns the collapsed state
// and its persistence; the sidebar renders both widths and hosts the
// toggle as its bottom row. Collapsed = 64px icon rail — nav stays
// usable, labels move into aria-label + native title tooltips.
defineProps<{ collapsed?: boolean }>()
defineEmits<{ toggle: [] }>()

const { t } = useI18n()
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar__brand">
      <span class="sidebar__brand-ko">문법</span>
      <span class="sidebar__brand-name">Garden</span>
    </div>
    <nav class="sidebar__nav">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
        :aria-label="t(item.labelKey)"
        :title="collapsed ? t(item.labelKey) : undefined"
      >
        <Icon :name="item.icon" :size="18" />
        <span class="sidebar__label">{{ t(item.labelKey) }}</span>
      </NuxtLink>
    </nav>
    <div class="sidebar__footer">
      <AccountWidget />
      <LocaleSwitcher />
    </div>
    <button
      type="button"
      class="sidebar__toggle font-pixel"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? t('nav.sidebar_expand') : t('nav.sidebar_collapse')"
      :title="collapsed ? t('nav.sidebar_expand') : undefined"
      @click="$emit('toggle')"
    >
      <span class="sidebar__toggle-glyph" aria-hidden="true">{{ collapsed ? '▸' : '◂' }}</span>
      <span class="sidebar__label">{{
        collapsed ? t('nav.sidebar_expand') : t('nav.sidebar_collapse')
      }}</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  /* El rail del shell (sticky, 100vh, overflow-y) es quien fija y
   * scrollea; aquí solo crecemos con el contenido (min-height: 100%
   * viene de .shell__sidebar). Un height:100vh fijo dejaba el fondo y
   * el borde sin pintar más allá del primer viewport en pantallas
   * bajas — y plegado, el toggle (único control de recuperación)
   * quedaba flotando sobre el dither de la página. */
  width: 220px;
  /* Panel liso: la identidad pixel vive en la pestaña activa y el cursor
   * (la veta vertical producía banding en light y era invisible en dark). */
  background-color: var(--paper-warm);
  border-right: 2px solid var(--border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* Mismo timing que el grid del shell (240ms ease) para que el borde
   * derecho viaje pegado a la columna durante el plegado. */
  transition: width 240ms ease;
}
/* Mini-rail: 64px, solo iconos. El flip interno (labels/footer) es seco;
 * el ancho en movimiento lo arropa — menú pixel, sin fades. */
.sidebar--collapsed {
  width: 64px;
  padding: 24px 8px;
}
.sidebar__brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.sidebar--collapsed .sidebar__brand {
  justify-content: center;
}
/* Plegado, la marca se reduce a 문법 chico y centrado — el contorno de 8
 * direcciones escala con el text-shadow, no se toca. */
.sidebar--collapsed .sidebar__brand-ko {
  font-size: 18px;
}
.sidebar--collapsed .sidebar__brand-name {
  display: none;
}
/* Brand gold + ink pixel outline (classic Zelda trick for legible yellow
 * on any surface). Outline uses --always-dark, not --ink, on purpose —
 * in dark mode --ink is light and would ruin the contour. 8 direcciones:
 * sin las diagonales el contorno se abre en las uniones de trazos del
 * Hangul, y en light (gold 1.46:1 sobre madera) el rim carga toda la
 * legibilidad. */
.sidebar__brand-ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 26px;
  color: var(--gold);
  text-shadow:
    2px 0 0 var(--always-dark),
    -2px 0 0 var(--always-dark),
    0 2px 0 var(--always-dark),
    0 -2px 0 var(--always-dark),
    2px 2px 0 var(--always-dark),
    -2px -2px 0 var(--always-dark),
    2px -2px 0 var(--always-dark),
    -2px 2px 0 var(--always-dark);
}
.sidebar__brand-name {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  color: var(--text);
}
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
/* Item de nav. El borde transparente reserva el marco de la pestaña
 * activa: reposo y activo miden exactamente igual → cero salto de
 * layout al navegar. */
.sidebar__link {
  position: relative;
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  color: var(--text-soft);
  text-decoration: none;
  border: 2px solid transparent;
  outline: none;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
/* Cursor de menú LADX: triángulo gold con rim oscuro (gold da 1.46:1
 * sobre la madera clara — el rim carga la visibilidad, como en 문법).
 * Bastan 4 drop-shadows axiales: se componen en cadena y cubren también
 * las diagonales. Oculto en reposo; preview al 45% en hover/focus;
 * pleno y parpadeando en el activo. */
.sidebar__link::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 7px solid var(--gold);
  filter:
    drop-shadow(1px 0 0 var(--always-dark))
    drop-shadow(-1px 0 0 var(--always-dark))
    drop-shadow(0 1px 0 var(--always-dark))
    drop-shadow(0 -1px 0 var(--always-dark));
  opacity: 0;
}
.sidebar__link:not(.sidebar__link--active):hover {
  background: var(--surface-hover);
  color: var(--text);
}
.sidebar__link:not(.sidebar__link--active):hover::before,
.sidebar__link:not(.sidebar__link--active):focus-visible::before {
  opacity: 0.45;
}
/* El outline de foco aplica a todos (también a la pestaña activa); el
 * fondo de foco solo a los no-activos, para no pisar la ventana de paper
 * de la pestaña al navegar con teclado. */
.sidebar__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.sidebar__link:not(.sidebar__link--active):focus-visible {
  background: var(--surface-hover);
  color: var(--text);
}
/* Pestaña activa: ventana de paper con marco y sombra dura. En light es
 * más clara que la madera; en dark, más oscura que el pino (ventana al
 * cielo abisal) y la sombra crema recorta la silueta. Cambio seco a
 * propósito — los menús pixel no hacen fade. */
.sidebar__link--active {
  background: var(--paper);
  border-color: var(--ink-line);
  color: var(--text);
  box-shadow: 3px 3px 0 var(--shadow-color);
}
.sidebar__link--active::before {
  opacity: 1;
  animation: sidebar-cursor-blink 1.1s steps(1) infinite;
}
/* Mini-rail: cada link es una casilla cuadrada centrada, solo icono.
 * 44px de alto = blanco táctil. El cursor ▶ no cabe a la izquierda
 * (padding de 8px) — se oculta y la señal de activo la carga la ventana
 * de paper con marco y sombra, que sobreviven tal cual. El nombre del
 * link vive en aria-label + title (tooltip nativo). */
.sidebar--collapsed .sidebar__link {
  grid-template-columns: 24px;
  justify-content: center;
  /* El svg del icono mide 18px dentro de la columna de 24 — centrarlo
   * también, o queda 4px a la izquierda del glifo del toggle. */
  justify-items: center;
  gap: 0;
  padding: 6px 0;
  min-height: 44px;
}
.sidebar--collapsed .sidebar__link::before {
  display: none;
}
.sidebar--collapsed .sidebar__label {
  display: none;
}
@keyframes sidebar-cursor-blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none;
  }
  .sidebar__link--active::before {
    animation: none;
  }
}
.sidebar__label {
  /* Pixel font for the chrome; CJK falls through Noto Sans KR for ja
   * locale labels; Thai / Vietnamese drop into system-ui. 10 px
   * fits the longest EN label inside the 220 px sidebar. */
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.03em;
  line-height: 1.4;
  white-space: nowrap;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
/* Thai / Vietnamese tone marks + stacked diacritics, and Japanese
 * kanji strokes, all lose detail at 10 px. Bump one step so the
 * glyphs stay legible. */
:lang(th) .sidebar__label,
:lang(vi) .sidebar__label,
:lang(ja) .sidebar__label {
  font-size: 13px;
}
.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Ancho final del contenido expandido (220 − 32 padding − 2 borde).
   * Al expandir, el footer reaparece cuando la caja aún mide ~64px;
   * sin esto el email (word-break) se apila en una columna alta y
   * flashea un scrollbar en el rail durante los 240ms. Con min-width
   * mantiene su layout final y el rail solo recorta por la derecha. */
  min-width: 186px;
}
/* Plegado, el footer (email / cerrar sesión / idioma) es contenido
 * textual que no cabe en 64px — se accede expandiendo. */
.sidebar--collapsed .sidebar__footer {
  display: none;
}

/* Toggle plegar/expandir: la última fila del sidebar, con el mismo
 * lenguaje que los links del nav (hover tint, focus inset, borde
 * reservado de 2px). Sustituye al botón flotante del borde y su track
 * sticky en AppShell. font-pixel solo mata el antialiasing — la fuente
 * se declara aquí, como hacía el botón viejo. */
.sidebar__toggle {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: transparent;
  color: var(--text-soft);
  border: 2px solid transparent;
  outline: none;
  text-align: left;
  cursor: pointer;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.sidebar__toggle:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.sidebar__toggle:focus-visible {
  background: var(--surface-hover);
  color: var(--text);
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.sidebar__toggle-glyph {
  justify-self: center;
  font-size: 9px;
  line-height: 1;
}
/* Guardia para locales futuros: si un label superara el track de 1fr,
 * degrada a ellipsis en vez de recortarse a medio glifo sobre el borde
 * (min-width:0 anula el suelo min-content del item de grid). */
.sidebar__toggle .sidebar__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Plegado: casilla cuadrada centrada como los links. El footer oculto ya
 * no empuja hacia abajo, así que el margin-top:auto pasa al toggle. */
.sidebar--collapsed .sidebar__toggle {
  grid-template-columns: 24px;
  justify-content: center;
  gap: 0;
  padding: 6px 0;
  min-height: 44px;
  margin-top: auto;
}
</style>
