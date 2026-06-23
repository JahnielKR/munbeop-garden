import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Theme-token guard for the escape room UI.
 *
 * The in-game puzzle UI paints on the app's themed surface, so every CSS
 * custom property it references must be a real, theme-aware token — otherwise
 * `var(--ghost, #fallback)` silently pins a light-theme literal in BOTH themes
 * and dark mode breaks (e.g. the Korean-line box stayed cream `#ffe8b4` while
 * `var(--text)` flipped to near-white → white-on-cream, unreadable).
 *
 * This test would have caught `--surface-elevated` and `--text-muted` (used by
 * five escape-room components but never declared in the token system). It reads
 * the actual files from disk so it tracks the real CSS, not a mirror.
 */

// vitest runs with cwd = the `munbeop/` package root (see vitest.config.ts).
const STYLES_DIR = join(process.cwd(), 'app/assets/styles')
const ER_COMPONENTS_DIR = join(process.cwd(), 'app/components/escape-room')

/** Recursively collect files with one of the given extensions. */
function filesByExt(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...filesByExt(full, exts))
    } else if (exts.some((e) => entry.endsWith(e))) {
      out.push(full)
    }
  }
  return out
}

/** Left-hand-side custom-property declarations: `--name:` (not `var(--name)`). */
function definedTokens(css: string): string[] {
  const names: string[] = []
  // `--foo:` but not inside `var(--foo` — require the `:` to be a declaration,
  // i.e. the property name is not immediately preceded by `(`.
  const re = /(^|[^(\w-])(--[A-Za-z0-9-]+)\s*:/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css))) names.push(m[2])
  return names
}

/** Every `var(--name` reference (ignoring any fallback). */
function referencedTokens(css: string): string[] {
  const names: string[] = []
  const re = /var\(\s*(--[A-Za-z0-9-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css))) names.push(m[1])
  return names
}

describe('escape-room theme tokens', () => {
  // The design-system tokens (colors-light/dark, typography, spacing, …) plus
  // any component-local custom properties make up the universe of "defined".
  const defined = new Set<string>()
  for (const f of filesByExt(STYLES_DIR, ['.css'])) {
    for (const name of definedTokens(readFileSync(f, 'utf8'))) defined.add(name)
  }
  const componentFiles = filesByExt(ER_COMPONENTS_DIR, ['.vue'])
  for (const f of componentFiles) {
    for (const name of definedTokens(readFileSync(f, 'utf8'))) defined.add(name)
  }

  it('found the token files and the escape-room components', () => {
    expect(defined.has('--surface')).toBe(true)
    expect(defined.has('--text')).toBe(true)
    expect(componentFiles.length).toBeGreaterThanOrEqual(10)
  })

  it('references no undefined CSS custom properties (no ghost tokens)', () => {
    const ghosts: string[] = []
    for (const f of componentFiles) {
      const css = readFileSync(f, 'utf8')
      for (const name of referencedTokens(css)) {
        if (!defined.has(name)) ghosts.push(`${name} in ${f.split(/[\\/]/).pop()}`)
      }
    }
    expect(ghosts).toEqual([])
  })
})
