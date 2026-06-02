import { beforeEach } from 'vitest'

beforeEach(() => {
  // Reset localStorage between tests so storage adapter tests stay isolated.
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }
})
