import { ref } from 'vue'
import type { Branch } from '../types'

export function useBranchesState() {
  const branches = ref<Branch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const clearError = () => {
    error.value = null
  }

  const setBranches = (data: Branch[]) => {
    branches.value = data
  }

  const updateBranch = (id: string, data: Branch) => {
    const index = branches.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      branches.value[index] = data
    }
  }

  return {
    branches,
    loading,
    error,
    clearError,
    setBranches,
    updateBranch,
  }
}
