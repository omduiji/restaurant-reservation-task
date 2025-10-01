import { ref } from 'vue'

export function useLoader(initialState: boolean = false) {
  const isLoading = ref(initialState)

  const show = (): void => {
    isLoading.value = true
  }

  const hide = (): void => {
    isLoading.value = false
  }

  const toggle = (): void => {
    isLoading.value = !isLoading.value
  }

  const withLoader = async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
    show()
    try {
      const result = await asyncFunction()
      return result
    } finally {
      hide()
    }
  }

  return {
    isLoading,
    show,
    hide,
    toggle,
    withLoader,
  }
}
