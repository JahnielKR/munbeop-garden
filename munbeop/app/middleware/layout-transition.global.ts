import { defineNuxtRouteMiddleware } from '#imports'

/**
 * Sets the layout transition per navigation so NuxtLayout fires the
 * right camera-pan keyframe.
 *
 * The pan ONLY plays at the welcome ↔ in-app boundary. Within the app
 * (e.g. /practice → /library) we set layoutTransition to false so the
 * layout swap is instant.
 *
 * Important: NuxtLayout reads `route.meta.layoutTransition` directly
 * (see node_modules/nuxt/dist/app/components/nuxt-layout.js). It does
 * NOT read a `:transition` prop. This middleware is the only correct
 * way to drive layout-level transitions dynamically.
 *
 *   from /welcome   → to /any      → pan-right  ("entering the castle")
 *   from /auth/cb   → to /any      → pan-right  (after OAuth round-trip)
 *   from /any       → to /welcome  → pan-left   ("leaving the castle")
 *   from /a         → to /b inside the app → false (instant)
 *
 * No `mode` on the transition objects — Vue defaults to simultaneous
 * (both leaving and entering layouts are in the DOM together), which
 * combined with `position: fixed; inset: 0` in transitions.css gives
 * the cohesive 200vw camera pan from the reference HTML.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const isWelcome = (path: string) => path === '/welcome' || path === '/welcome/'
  const isAuthCallback = (path: string) => path.startsWith('/auth/callback')

  const cameFromBoundary = isWelcome(from.path) || isAuthCallback(from.path)
  const goingToWelcome = isWelcome(to.path)

  if (cameFromBoundary && !goingToWelcome) {
    to.meta.layoutTransition = { name: 'pan-right' }
  } else if (!cameFromBoundary && goingToWelcome) {
    to.meta.layoutTransition = { name: 'pan-left' }
  } else {
    to.meta.layoutTransition = false
  }
})
