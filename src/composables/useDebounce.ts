// デバウンス機能のComposable

import { ref } from 'vue'

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  const timeout = ref<NodeJS.Timeout | null>(null)

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
    
    timeout.value = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  const cancel = () => {
    if (timeout.value) {
      clearTimeout(timeout.value)
      timeout.value = null
    }
  }

  return {
    debouncedFn: debouncedFn as T,
    cancel
  }
}