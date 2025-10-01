import { computed, ref } from 'vue'
import {
  getBranches as apiBranches,
  disableAllReservations as apiDisableAllReservations,
  enableReservations as apiEnableReservations,
  updateBranch as apiUpdateBranch,
} from '../services/api'
import type { Branch } from '../types'

export function useApi() {
  const branches = ref<Branch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const enabledBranches = computed(() =>
    branches.value.filter((branch) => branch.accepts_reservations),
  )

  const disabledBranches = computed(() =>
    branches.value.filter((branch) => !branch.accepts_reservations),
  )

  const fetchBranches = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiBranches()
      branches.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch branches'
    } finally {
      loading.value = false
    }
  }

  const enableReservations = async (branchIds: string[]) => {
    loading.value = true
    error.value = null

    try {
      await Promise.all(branchIds.map((id) => apiEnableReservations(id)))
      await fetchBranches()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to enable reservations'
    } finally {
      loading.value = false
    }
  }

  const disableAllReservations = async () => {
    loading.value = true
    error.value = null

    try {
      const enabledIds = enabledBranches.value.map((branch) => branch.id)
      await apiDisableAllReservations(enabledIds)
      await fetchBranches()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
    } finally {
      loading.value = false
    }
  }

  const updateBranchSettings = async (branchId: string, settings: Partial<Branch>) => {
    loading.value = true
    error.value = null

    try {
      await apiUpdateBranch(branchId, settings)
      await fetchBranches()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update branch settings'
    } finally {
      loading.value = false
    }
  }

  return {
    branches,
    enabledBranches,
    disabledBranches,
    loading,
    error,
    fetchBranches,
    enableReservations,
    disableAllReservations,
    updateBranchSettings,
  }
}
