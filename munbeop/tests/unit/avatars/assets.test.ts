// munbeop/tests/unit/avatars/assets.test.ts
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { AVATARS, EPIC_FRAME_URL, LEGENDARY_FRAME_URL, RARE_FRAME_URL } from '~/lib/avatars/catalog'

// vitest runs from munbeop/, so public/ is relative to cwd.
const pub = (url: string) => resolve(process.cwd(), 'public', url.replace(/^\//, ''))

describe('avatar assets', () => {
  it('every catalog avatar has a png in public/img/avatars', () => {
    const missing = AVATARS.map((a) => `/img/avatars/${a.id}.png`).filter((u) => !existsSync(pub(u)))
    expect(missing).toEqual([])
  })

  it('the shared legendary frame png exists', () => {
    expect(existsSync(pub(LEGENDARY_FRAME_URL))).toBe(true)
  })

  it('the epic frame png exists', () => {
    expect(existsSync(pub(EPIC_FRAME_URL))).toBe(true)
  })

  it('the rare frame png exists', () => {
    expect(existsSync(pub(RARE_FRAME_URL))).toBe(true)
  })
})
