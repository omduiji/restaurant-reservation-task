<template>
  <main class="flex flex-col gap-y-12">
    <section
      class="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-white p-6 rounded-lg"
    >
      <h1 class="text-2xl font-bold">Reservations</h1>
      <AppButton
        label="Disable Restaurants"
        @click="openConfirmation('disableAllBranches')"
        :disabled="!enabledBranches.length"
      />
    </section>

    <section
      class="rounded-lg overflow-hidden bg-white border-white shadow-lg pt-6 flex flex-col gap-y-6 p-6"
    >
      <AppButton class="w-fit self-end" label="Add Branches" @click="showAddBranches" />

      <BranchTable
        :data="enabledBranches"
        :columns="tableColumns"
        :actions="tableActions"
        :row-click="handleRowClick"
        key-field="id"
        generic-type="branch"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <div class="text-gray-400 text-lg mb-2">No branches found</div>
            <div class="text-gray-500 text-sm">Add branches to get started with reservations</div>
            <AppButton class="w-fit self-end" label="Add Branches" @click="showAddBranches" />
          </div>
        </template>
      </BranchTable>
    </section>
    <AddBranchModal
      v-model="showAddBranchModal"
      :disabled-branches="disabledBranches"
      :loading="loading"
      :error="error"
      @submit="handleEnableBranches"
      @close="showAddBranchModal = false"
    />
    <AppConfirmationModal
      ref="confirmationModal"
      v-model="confirmationState.show"
      :title="confirmationState.modalTitle"
      :message="confirmationState.modalMessage"
      :confirm-text="confirmationState.confirmText"
      :cancel-text="confirmationState.cancelText"
      :variant="confirmationState.variant"
      :loading="confirmationState.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
    <ReservationModal
      v-model="showEditBranchModal"
      :branch="selectedBranch"
      @save="handleSaveBranchSettings"
      @close="closeEditModal"
    />
    <AppLoader :loading="loading" overlay :text="loaderText" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AddBranchModal from './components/AddBranchModal.vue'
import AppConfirmationModal from './components/AppConfirmationModal.vue'
import type { TableAction, TableColumn } from './components/BranchTable.vue'
import BranchTable from './components/BranchTable.vue'
import ReservationModal from './components/ReservationModal.vue'
import AppButton from './components/ui/AppButton.vue'
import AppLoader from './components/ui/AppLoader.vue'
import { useBranches } from './composables/useBranches'
import { useConfirmationModal } from './composables/useConfirmationModal'
import type { Branch, ReservationSettings, WeekDay } from './types/index'

const {
  confirmationState,
  registerConfirmation,
  openConfirmation,
  handleConfirm,
  handleCancel,
  showResult,
} = useConfirmationModal()

// Register confirmations after ensuring all functions exist
registerConfirmation('disableAllBranches', {
  modalTitle: 'Disable All Reservations',
  modalMessage:
    'Are you sure you want to disable reservations for all branches? This action will make all branches unavailable for reservations.',
  confirmText: 'Disable All',
  cancelText: 'Cancel',
  variant: 'danger',
  successMessage: 'All reservations have been successfully disabled.',
  errorMessage: 'Failed to disable reservations. Please try again.',
  onConfirm: async () => {
    await disableAllReservations()
  },
})

registerConfirmation('disableSingleBranch', {
  modalTitle: 'Disable Reservations',
  modalMessage: (branch: Branch) =>
    `Are you sure you want to disable reservations for ${branch.name}? This branch will become unavailable for reservations.`,
  confirmText: 'Disable',
  cancelText: 'Keep Enabled',
  variant: 'danger',
  successMessage: (branch: Branch) =>
    `Reservations for ${branch.name} have been successfully disabled.`,
  errorMessage: 'Failed to disable reservations for this branch. Please try again.',
  onConfirm: async (branch: Branch) => {
    await disableReservationForBranch(branch.id)
    await fetchBranches()
  },
})

const {
  enabledBranches,
  disabledBranches,
  loading,
  error,
  fetchBranches,
  enableReservations,
  disableReservationForBranch,
  disableAllReservations,
  updateBranchSettings,
} = useBranches()

const showAddBranchModal = ref(false)
const showEditBranchModal = ref(false)
const selectedBranch = ref<Branch | null>(null)
const confirmationModal = ref()
const loaderText = ref('')

const tableColumns: TableColumn[] = [
  {
    key: 'name',
    label: 'Branch Name',
    headerClass: 'text-left',
    cellClass: 'font-medium text-gray-900',
  },
  {
    key: 'reference',
    label: 'Reference',
    headerClass: 'text-left',
    cellClass: 'text-gray-600',
  },
  {
    key: 'number_of_reservable_tables',
    label: 'Number of Tables',
    headerClass: 'text-left',
    cellClass: 'text-center',
  },
  {
    key: 'reservation_duration',
    label: 'Reservation Duration',
    headerClass: 'text-left',
    cellClass: 'text-gray-600',
  },
]

const fetchData = async () => {
  await fetchBranches()
}

const openSettings = (branch: Branch): void => {
  selectedBranch.value = branch
  showEditBranchModal.value = true
}

const closeEditModal = (): void => {
  showEditBranchModal.value = false
  selectedBranch.value = null
}

const handleSaveBranchSettings = async (
  settings: Omit<ReservationSettings, 'schedules'> & {
    reservation_times: Record<WeekDay, [string, string][]>
  },
): Promise<void> => {
  try {
    if (!selectedBranch.value) return
    loaderText.value = 'Updating branch settings...'
    await updateBranchSettings(selectedBranch.value.id, settings)
    closeEditModal()
    showResult('Success!', 'Branch settings have been updated successfully.', 'success')
  } catch (err) {
    showResult(
      'Error',
      String(err) || 'Failed to update branch settings. Please try again.',
      'danger',
    )
  } finally {
    loaderText.value = ''
  }
}

const disableBranch = async (branch: Branch): Promise<void> => {
  openConfirmation('disableSingleBranch', branch)
}

const showAddBranches = () => {
  showAddBranchModal.value = true
}

const handleEnableBranches = async (branchIds: string[]) => {
  try {
    await enableReservations(branchIds)
    showAddBranchModal.value = false
  } catch (err) {
    console.error('Failed to enable reservations:', err)
  }
}

// Event handlers
const handleRowClick = (branch: Branch): void => {
  openSettings(branch)
}

const tableActions: TableAction<Branch>[] = [
  {
    label: 'Edit',
    class: 'bg-primary-100 text-white hover:bg-primary-700',
    handler: (branch: Branch) => {
      openSettings(branch)
    },
  },
  {
    label: 'Disable',
    class: 'bg-white text-gray-500 border border-gray-500 hover:bg-gray-50',
    handler: disableBranch,
  },
]

onMounted(() => {
  fetchData()
})
</script>
