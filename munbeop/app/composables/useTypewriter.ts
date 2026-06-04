import { ref, readonly, watch, onScopeDispose, getCurrentScope, type Ref } from 'vue'

export interface TypewriterOptions {
  speed?: number
  onDone?: () => void
}

/**
 * Reveal `text` one code-point at a time. Returns rendered text, a done
 * flag, and a skip() that flushes the rest of the line instantly.
 *
 * Iteration uses `[...str]` (not str.length) so combined Hangul jamo and
 * astral-plane glyphs render as single ticks.
 */
export function useTypewriter(text: Ref<string>, opts: TypewriterOptions = {}) {
  const speed = opts.speed ?? 40
  const rendered = ref('')
  const done = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null
  let chars: string[] = []
  let index = 0
  let firedOnDone = false

  function clear() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function complete() {
    if (firedOnDone) return
    firedOnDone = true
    done.value = true
    opts.onDone?.()
  }

  function tick() {
    if (index >= chars.length) {
      clear()
      complete()
      return
    }
    rendered.value += chars[index]
    index += 1
    if (index >= chars.length) {
      clear()
      complete()
    }
  }

  function restart() {
    clear()
    chars = [...text.value]
    index = 0
    rendered.value = ''
    done.value = false
    firedOnDone = false
    if (chars.length === 0) {
      complete()
      return
    }
    timer = setInterval(tick, speed)
  }

  function skip() {
    clear()
    rendered.value = text.value
    index = chars.length
    complete()
  }

  watch(text, restart, { immediate: true })
  if (getCurrentScope()) onScopeDispose(clear)

  return { rendered: readonly(rendered), done: readonly(done), skip }
}
