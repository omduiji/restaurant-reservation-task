import { type Ref } from 'vue'
import * as api from '../services/api'
import type { Branch } from '../types'
import { useLoader } from './useLoader'

interface UseBranchReservationsOptions {
  loading: Ref<boolean>
  error: Ref<string | null>
  enabledBranches: Ref<Branch[]>
  onUpdate: () => Promise<void>
}

export function useBranchReservations(options: UseBranchReservationsOptions) {
  const { loading, error, enabledBranches, onUpdate } = options
  const { withLoader } = useLoader()

  const enableReservations = async (branchIds: string[]) => {
    loading.value = true
    error.value = null

    try {
      await withLoader(async () => {
        await Promise.all(branchIds.map((id) => api.enableReservations(id)))
        await onUpdate()
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to enable reservations'
      console.error('Error enabling reservations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const disableReservationForBranch = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      if (id.length === 0) {
        return
      }
      await api.disableReservations(id)
      await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
      console.error('Error disabling reservations for branch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const disableAllReservations = async () => {
    loading.value = true
    error.value = null

    try {
      await withLoader(async () => {
        const enabledIds = enabledBranches.value.map((branch) => branch.id)
        if (enabledIds.length === 0) {
          return
        }
        await api.disableAllReservations(enabledIds)
        await onUpdate()
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
      console.error('Error disabling all reservations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    enableReservations,
    disableReservationForBranch,
    disableAllReservations,
  }
}
