// composables/useConfirmationModal.ts
import { reactive, ref } from 'vue'

type ModalVariant = 'danger' | 'warning' | 'info' | 'success' | 'default'

interface ConfirmationConfig<T = unknown> {
  modalTitle: string
  modalMessage: string | ((data: T) => string)
  confirmText: string
  cancelText: string
  variant: ModalVariant
  onConfirm: (data: T) => Promise<void> | void
  onCancel?: (data: T) => void
  successMessage?: string | ((data: T) => string)
  errorMessage?: string | ((data: T) => string)
}

interface ConfirmationState<T = unknown> {
  show: boolean
  type: string
  modalTitle: string
  modalMessage: string
  confirmText: string
  cancelText: string
  variant: ModalVariant
  loading: boolean
  data: T | null
  mode: 'confirmation' | 'result'
}

export function useConfirmationModal() {
  const confirmationState = reactive<ConfirmationState>({
    show: false,
    type: '',
    modalTitle: '',
    modalMessage: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    loading: false,
    data: null,
    mode: 'confirmation',
  })

  const confirmationConfigs = ref<Record<string, ConfirmationConfig>>({})

  const registerConfirmation = <T = unknown>(type: string, config: ConfirmationConfig<T>) => {
    confirmationConfigs.value[type] = config as ConfirmationConfig
  }

  const openConfirmation = <T = unknown>(type: string, data?: T) => {
    const config = confirmationConfigs.value[type]
    if (!config) {
      console.error(`No confirmation configuration found for type: ${type}`)
      return
    }

    confirmationState.mode = 'confirmation'
    confirmationState.type = type
    confirmationState.modalTitle = config.modalTitle
    confirmationState.modalMessage =
      typeof config.modalMessage === 'function' ? config.modalMessage(data) : config.modalMessage
    confirmationState.confirmText = config.confirmText
    confirmationState.cancelText = config.cancelText
    confirmationState.variant = config.variant
    confirmationState.loading = false
    confirmationState.data = data
    confirmationState.show = true
  }

  const showResult = (title: string, message: string, variant: ModalVariant = 'success') => {
    confirmationState.mode = 'result'
    confirmationState.modalTitle = title
    confirmationState.modalMessage = message
    confirmationState.confirmText = 'OK'
    confirmationState.cancelText = '' // No cancel button for results
    confirmationState.variant = variant
    confirmationState.loading = false
    confirmationState.show = true
  }

  const handleConfirm = async () => {
    if (confirmationState.mode === 'result') {
      // For result modals, just close them
      confirmationState.show = false
      confirmationState.type = ''
      confirmationState.data = null
      return
    }

    // For confirmation modals, execute the action
    const config = confirmationConfigs.value[confirmationState.type]
    if (!config) return

    confirmationState.loading = true

    try {
      await config.onConfirm(confirmationState.data)

      // Show success result
      const successMessage =
        typeof config.successMessage === 'function'
          ? config.successMessage(confirmationState.data)
          : config.successMessage

      if (successMessage) {
        showResult('Success!', successMessage, 'success')
      } else {
        // If no success message, just close the modal
        confirmationState.show = false
        confirmationState.type = ''
        confirmationState.data = null
      }
    } catch (err) {
      console.error(`Failed to execute ${confirmationState.type}:`, err)

      // Show error result
      const errorMessage =
        typeof config.errorMessage === 'function'
          ? config.errorMessage(confirmationState.data)
          : config.errorMessage || 'An error occurred while processing your request.'

      showResult('Error', errorMessage, 'danger')
    } finally {
      confirmationState.loading = false
    }
  }

  const handleCancel = () => {
    if (confirmationState.mode === 'confirmation') {
      const config = confirmationConfigs.value[confirmationState.type]
      if (config?.onCancel) {
        config.onCancel(confirmationState.data)
      }
    }

    confirmationState.show = false
    confirmationState.type = ''
    confirmationState.data = null
    confirmationState.mode = 'confirmation' // Reset to default mode
  }

  return {
    confirmationState,
    registerConfirmation,
    openConfirmation,
    handleConfirm,
    handleCancel,
    showResult,
  }
}
