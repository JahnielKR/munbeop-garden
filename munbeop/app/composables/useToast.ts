const message = ref<string>('')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(text: string, durationMs = 2500) {
    message.value = text
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
    }, durationMs)
  }
  return { message: readonly(message), visible: readonly(visible), show }
}
