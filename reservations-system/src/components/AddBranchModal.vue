<template>
  <AppModal
    v-model="isOpen"
    title="Enable Reservations for Branches"
    :show-close-button="true"
    :close-on-backdrop-click="true"
  >
    <div class="min-w-full">
      <p class="text-gray-600 mb-6">
        Select branches to enable reservations. You can select multiple branches at once.
      </p>

      <AppSelectInput
        v-model="selectedBranchIds"
        label="Select Branches"
        placeholder="Choose branches to enable reservations"
        :multiple="true"
        :options="branchOptions"
        :disabled="loading || disabledBranches.length === 0"
        validation-name="branches"
        validation-rules="required"
      />

      <div v-if="disabledBranches.length === 0" class="text-gray-500 text-sm mt-2">
        All branches already have reservations enabled.
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
        <p class="text-red-800 text-sm">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <AppButton label="Cancel" variant="secondary" @click="closeModal" :disabled="loading" />
      <AppButton
        label="Enable Reservations"
        variant="primary"
        @click="handleSubmit"
        :disabled="loading || selectedBranchIds.length === 0"
      />
    </template>
    <AppLoader v-if="loading" text="Wait For Enabling Reservations for Branches" />
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from './ui/AppButton.vue'
import AppLoader from './ui/AppLoader.vue'
import AppModal from './ui/AppModal.vue'
import AppSelectInput from './ui/AppSelectInput.vue'

interface Props {
  modelValue: boolean
  disabledBranches: Array<{
    id: string
    name: string
    reference: string
  }>
  loading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', branchIds: string[]): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

const emit = defineEmits<Emits>()

const isOpen = ref(props.modelValue)
const selectedBranchIds = ref<Array<string | number>>([])

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
    if (!newValue) {
      // Reset selection when modal closes
      selectedBranchIds.value = []
    }
  },
)

// Watch for internal changes to isOpen
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    emit('close')
  }
})

// Compute options for the select input
const branchOptions = computed(() => {
  return props.disabledBranches.map((branch) => ({
    value: branch.id,
    label: `${branch.name} (${branch?.reference || 'No reference available'})`,
  }))
})

const closeModal = () => {
  isOpen.value = false
  selectedBranchIds.value = []
}

const handleSubmit = () => {
  if (selectedBranchIds.value.length === 0) {
    return
  }

  // Convert to string array and emit
  const branchIds = selectedBranchIds.value.map((id) => id.toString())
  emit('submit', branchIds)
}
</script>
