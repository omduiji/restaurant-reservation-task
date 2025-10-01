<template>
  <AppModal
    v-model="isOpen"
    :title="title"
    :show-close-button="showCloseButton"
    :close-on-backdrop-click="closeOnBackdropClick"
    :prevent-esc-close="preventEscClose"
    @close="handleClose"
    @cancel="handleCancel"
  >
    <template #header>
      <slot name="header">
        <div class="confirmation-header">
          <div class="confirmation-icon" v-if="icon || $slots.icon">
            <slot name="icon">
              <span v-if="icon">{{ icon }}</span>
            </slot>
          </div>
          <h2 class="confirmation-title">{{ title }}</h2>
        </div>
      </slot>
    </template>

    <div class="confirmation-content" :class="contentClass">
      <slot name="message">
        <div class="confirmation-message" v-if="message">
          {{ message }}
        </div>
      </slot>

      <slot></slot>

      <div class="confirmation-details" v-if="$slots.details || details">
        <slot name="details">
          {{ details }}
        </slot>
      </div>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="confirmation-actions" :class="actionsAlignment">
          <AppButton
            v-if="showCancelButton && cancelText"
            variant="secondary"
            size="medium"
            :disabled="loading"
            :autofocus="autoFocusCancel"
            @click="handleCancelClick"
            :label="cancelText"
          />
          <AppButton
            v-if="showConfirmButton"
            :variant="confirmButtonVariant"
            size="medium"
            :disabled="loading"
            :autofocus="autoFocusConfirm && (!showCancelButton || !cancelText)"
            @click="handleConfirmClick"
            :label="confirmText"
          />
          <slot name="additional-actions"></slot>
        </div>
      </slot>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppModal from '../components/ui/AppModal.vue'

type Variant = 'danger' | 'warning' | 'info' | 'success' | 'default'
type ActionsAlignment = 'left' | 'center' | 'right' | 'space-between'

interface ConfirmationModalProps {
  // Core props
  modelValue?: boolean
  title?: string
  message?: string
  details?: string

  // Action texts
  confirmText?: string
  cancelText?: string | null

  // Visibility controls
  showConfirmButton?: boolean
  showCancelButton?: boolean
  showCloseButton?: boolean

  // Styling
  variant?: Variant
  size?: 'sm' | 'md' | 'lg' | 'xl'
  actionsAlignment?: ActionsAlignment

  // Behavior
  loading?: boolean
  closeOnBackdropClick?: boolean
  preventEscClose?: boolean
  closeOnConfirm?: boolean
  closeOnCancel?: boolean
  autoFocusConfirm?: boolean
  autoFocusCancel?: boolean

  // Custom icon
  icon?: string
}

interface ConfirmationModalEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<ConfirmationModalProps>(), {
  modelValue: false,
  title: 'Confirmation Required',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showConfirmButton: true,
  showCancelButton: true,
  showCloseButton: true,
  variant: 'default',
  size: 'md',
  actionsAlignment: 'right',
  loading: false,
  closeOnBackdropClick: false,
  preventEscClose: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  autoFocusConfirm: true,
  autoFocusCancel: false,
  icon: '',
})

const emit = defineEmits<ConfirmationModalEmits>()

const isOpen = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal
  },
)

watch(
  () => isOpen.value,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
)

const confirmButtonVariant = computed(() => {
  const variantMap: Record<Variant, 'primary' | 'danger' | 'secondary'> = {
    default: 'primary',
    danger: 'danger',
    warning: 'danger',
    info: 'primary',
    success: 'primary',
  }
  return variantMap[props.variant]
})

const contentClass = computed(() => `confirmation-content--${props.size}`)

const actionsAlignment = computed(() => `confirmation-actions--${props.actionsAlignment}`)

const defaultIcon = computed(() => {
  const icons: Record<Variant, string> = {
    default: '❓',
    danger: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
  }
  return icons[props.variant]
})

const icon = computed(() => props.icon || defaultIcon.value)

const handleConfirmClick = () => {
  emit('confirm')
  if (props.closeOnConfirm) {
    isOpen.value = false
  }
}

const handleCancelClick = () => {
  emit('cancel')
  if (props.closeOnCancel) {
    isOpen.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
}

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped>
.confirmation-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.confirmation-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.confirmation-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.confirmation-content {
  padding: 0.5rem 0;
}

.confirmation-content--sm {
  min-width: 300px;
}

.confirmation-content--md {
  min-width: 400px;
}

.confirmation-content--lg {
  min-width: 500px;
}

.confirmation-content--xl {
  min-width: 600px;
}

.confirmation-message {
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 0.5rem;
}

.confirmation-details {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-top: 1rem;
}

.confirmation-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.confirmation-actions--left {
  justify-content: flex-start;
}

.confirmation-actions--center {
  justify-content: center;
}

.confirmation-actions--right {
  justify-content: flex-end;
}

.confirmation-actions--space-between {
  justify-content: space-between;
}
</style>
