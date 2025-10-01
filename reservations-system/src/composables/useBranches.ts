import { useBranchesComputed } from './useBranchComputed'
import { useBranchesApi } from './useBranchesApi'
import { useBranchReservations } from './useBranchReservations'
import { useBranchSettings } from './useBranchSettings'
import { useBranchesState } from './useBranchState'

export function useBranches() {
  const state = useBranchesState()
  const computed = useBranchesComputed(state.branches)

  const api = useBranchesApi({
    loading: state.loading,
    error: state.error,
    onBranchesUpdate: state.setBranches,
    onBranchUpdate: state.updateBranch,
  })

  const reservations = useBranchReservations({
    loading: state.loading,
    error: state.error,
    enabledBranches: computed.enabledBranches,
    onUpdate: api.fetchBranches,
  })

  const settings = useBranchSettings({
    loading: state.loading,
    error: state.error,
    onUpdate: api.fetchBranches,
  })

  return {
    // State
    branches: state.branches,
    enabledBranches: computed.enabledBranches,
    disabledBranches: computed.disabledBranches,
    loading: api.loading,
    error: state.error,

    // Actions
    fetchBranches: api.fetchBranches,
    fetchBranch: api.fetchBranch,
    enableReservations: reservations.enableReservations,
    disableReservationForBranch: reservations.disableReservationForBranch,
    disableAllReservations: reservations.disableAllReservations,
    updateBranchSettings: settings.updateBranchSettings,
    clearError: state.clearError,

    // Helpers
    getEnabledTablesCount: computed.getEnabledTablesCount,
  }
}
