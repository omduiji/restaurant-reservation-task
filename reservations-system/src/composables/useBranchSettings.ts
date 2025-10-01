import { type Ref } from 'vue'
import * as api from '../services/api'
import type { Branch } from '../types'

interface UseBranchSettingsOptions {
  loading: Ref<boolean>
  error: Ref<string | null>
  onUpdate: () => Promise<void>
}

export function useBranchSettings(options: UseBranchSettingsOptions) {
  const { loading, error, onUpdate } = options

  const updateBranchSettings = async (branchId: string, settings: Partial<Branch>) => {
    loading.value = true
    error.value = null

    try {
      await api.updateBranch(branchId, settings)
      await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update branch settings'
      console.error('Error updating branch settings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    updateBranchSettings,
  }
}
