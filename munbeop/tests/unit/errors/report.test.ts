import { describe, it, expect } from 'vitest'
import { toReport, createThrottle } from '~/lib/errors/report'

describe('toReport', () => {
  it('pulls message + stack off an Error and attaches the route', () => {
    const err = new Error('boom')
    const r = toReport('vue', err, '/practice/ruleta')
    expect(r).toMatchObject({ kind: 'vue', message: 'boom', route: '/practice/ruleta' })
    expect(r.stack).toContain('boom')
  })

  it('stringifies non-Error throws and omits stack/route when absent', () => {
    const r = toReport('unhandledrejection', 'just a string')
    expect(r.message).toBe('just a string')
    expect(r.stack).toBeUndefined()
    expect(r.route).toBeUndefined()
  })

  it('handles null/undefined throws without crashing', () => {
    expect(toReport('error', null).message).toBe('Unknown error')
    expect(toReport('error', undefined).message).toBe('Unknown error')
  })

  it('clips an oversized message and stack', () => {
    const big = new Error('x'.repeat(2000))
    big.stack = 'y'.repeat(10_000)
    const r = toReport('error', big)
    expect(r.message.length).toBe(500)
    expect(r.stack!.length).toBe(4000)
  })
})

describe('createThrottle', () => {
  it('suppresses an identical report within the window, then allows it after', () => {
    const gate = createThrottle({ windowMs: 1000, maxPerSession: 100 })
    const report = { kind: 'error' as const, message: 'same' }
    expect(gate(report, 0)).toBe(true)
    expect(gate(report, 500)).toBe(false) // within window
    expect(gate(report, 1200)).toBe(true) // window elapsed
  })

  it('lets distinct signatures through independently', () => {
    const gate = createThrottle()
    expect(gate({ kind: 'error', message: 'a' }, 0)).toBe(true)
    expect(gate({ kind: 'error', message: 'b' }, 0)).toBe(true)
    expect(gate({ kind: 'vue', message: 'a' }, 0)).toBe(true) // different kind
  })

  it('stops sending once the per-session cap is hit', () => {
    const gate = createThrottle({ maxPerSession: 2, windowMs: 0 })
    expect(gate({ kind: 'error', message: 'a' }, 0)).toBe(true)
    expect(gate({ kind: 'error', message: 'b' }, 1)).toBe(true)
    expect(gate({ kind: 'error', message: 'c' }, 2)).toBe(false) // cap reached
  })
})
