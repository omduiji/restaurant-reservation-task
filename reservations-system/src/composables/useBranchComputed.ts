import { computed, type Ref } from 'vue'
import type { Branch } from '../types'

export function useBranchesComputed(branches: Ref<Branch[]>) {
  const getEnabledTablesCount = (branch: Branch): number => {
    return branch.sections.reduce((count, section) => {
      return count + section.tables.filter((table) => table.accepts_reservations).length
    }, 0)
  }

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

  return {
    enabledBranches,
    disabledBranches,
    getEnabledTablesCount,
  }
}
