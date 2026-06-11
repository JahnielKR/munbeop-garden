/**
 * The only paths an anonymous visitor may load. Policy (2026-06-11):
 * accounts are MANDATORY — everything outside this surface lives behind
 * a session.
 *
 * Shared by the welcome-redirect middleware (blocks anonymous navigation)
 * and useAuth (escorts passively signed-out users back to the gate).
 */
const PUBLIC_PATHS = new Set(['/welcome', '/pricing', '/features', '/policies'])

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path) || path.startsWith('/auth/')
}
