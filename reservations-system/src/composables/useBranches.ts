import { computed, ref } from 'vue'
import * as api from '../services/api'
import type { Branch } from '../types'
import { useLoader } from './useLoader'

export function useBranches() {
  const branches = ref<Branch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { isLoading, withLoader } = useLoader()

  // Computed properties
  const enabledBranches = computed(() =>
    branches.value
      .filter((branch) => branch.accepts_reservations)
      .map((branch) => ({
        ...branch,
        number_of_reservable_tables: getEnabledTablesCount(branch),
      })),
  )

  const disabledBranches = computed(() =>
    branches.value.filter((branch) => !branch.accepts_reservations),
  )

  // Helper function to count enabled tables in a branch
  const getEnabledTablesCount = (branch: Branch): number => {
    return branch.sections.reduce((count, section) => {
      return count + section.tables.filter((table) => table.accepts_reservations).length
    }, 0)
  }

  // Fetch all branches
  const fetchBranches = async () => {
    loading.value = true
    error.value = null

    try {
      await withLoader(async () => {
        const response = await api.getBranches()
        branches.value = response.data
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch branches'
      console.error('Error fetching branches:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single branch by ID
  const fetchBranch = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      return await withLoader(async () => {
        const response = await api.getBranch(id)
        // Update the branch in the list if it exists
        const index = branches.value.findIndex((b) => b.id === id)
        if (index !== -1) {
          branches.value[index] = response.data
        }
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

  // Enable reservations for selected branches
  const enableReservations = async (branchIds: string[]) => {
    loading.value = true
    error.value = null

    try {
      await withLoader(async () => {
        await Promise.all(branchIds.map((id) => api.enableReservations(id)))
        await fetchBranches() // Refresh data
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to enable reservations'
      console.error('Error enabling reservations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Disable reservations for all enabled branches
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
        await fetchBranches() // Refresh data
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
      console.error('Error disabling all reservations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  // Disable reservations for all enabled single branch
  const disableReservationForBranch = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      if (id.length === 0) {
        return
      }
      await api.disableReservations(id)
      await fetchBranches() // Refresh data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
      console.error('Error disabling reservations for branch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update branch settings (reservation duration, tables, schedules)
  const updateBranchSettings = async (branchId: string, settings: Partial<Branch>) => {
    loading.value = true
    error.value = null

    try {
      await api.updateBranch(branchId, settings)
      await fetchBranches()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update branch settings'
      console.error('Error updating branch settings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error message
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    branches,
    enabledBranches,
    disabledBranches,
    loading: isLoading,
    error,

    // Actions
    fetchBranches,
    fetchBranch,
    enableReservations,
    disableReservationForBranch,
    disableAllReservations,
    updateBranchSettings,
    clearError,

    // Helpers
    getEnabledTablesCount,
  }
}
