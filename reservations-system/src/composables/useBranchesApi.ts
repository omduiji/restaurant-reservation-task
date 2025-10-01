import type { Branch } from '@/types'
import { type Ref } from 'vue'
import * as api from '../services/api'
import { useLoader } from './useLoader'

interface UseBranchesApiOptions {
  loading: Ref<boolean>
  error: Ref<string | null>
  onBranchesUpdate: (data: Branch[]) => void
  onBranchUpdate: (id: string, data: Branch) => void
}

export function useBranchesApi(options: UseBranchesApiOptions) {
  const { loading, error, onBranchesUpdate, onBranchUpdate } = options
  const { isLoading, withLoader } = useLoader()

  const fetchBranches = async () => {
    loading.value = true
    error.value = null

    try {
      await withLoader(async () => {
        const response = await api.getBranches()
        onBranchesUpdate(response.data)
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch branches'
      console.error('Error fetching branches:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBranch = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      return await withLoader(async () => {
        const response = await api.getBranch(id)
        onBranchUpdate(id, response.data)
        return response.data
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch branch'
      console.error('Error fetching branch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: isLoading,
    fetchBranches,
    fetchBranch,
  }
}
