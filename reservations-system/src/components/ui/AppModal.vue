<template>
  <dialog
    v-if="isOpen"
    ref="dialogRef"
    class="popup-dialog"
    @close="handleClose"
    @cancel="handleCancel"
    @click="handleBackdropClick"
  >
    <div class="popup-content" @click.stop>
      <!-- Header Section -->
      <div class="popup-header" v-if="$slots.header || title">
        <slot name="header">
          <h2 class="popup-title">{{ title }}</h2>
        </slot>
        <button v-if="showCloseButton" class="popup-close" @click="close" aria-label="Close dialog">
          &times;
        </button>
      </div>

      <div class="popup-body">
        <slot></slot>
      </div>

      <div class="popup-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

interface PopupDialogProps {
  modelValue?: boolean
  title?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  preventEscClose?: boolean
}

interface PopupDialogEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'cancel', event: Event): void
  (e: 'open'): void
}

const props = withDefaults(defineProps<PopupDialogProps>(), {
  modelValue: false,
  title: '',
  showCloseButton: true,
  closeOnBackdropClick: true,
  preventEscClose: false,
})

const emit = defineEmits<PopupDialogEmits>()

const dialogRef = ref<HTMLDialogElement | null>(null)
const isOpen = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      open()
    } else {
      close()
    }
  },
)

const open = async () => {
  if (!isOpen.value) {
    isOpen.value = true
    await nextTick()

    if (dialogRef.value) {
      dialogRef.value.showModal()
    }

    emit('open')
  }
}

const close = () => {
  if (isOpen.value) {
    dialogRef.value?.close()
    isOpen.value = false
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleClose = () => close()

const handleCancel = (event: Event) => {
  if (props.preventEscClose) {
    event.preventDefault()
  } else {
    close()
  }
  emit('cancel', event)
}

const handleBackdropClick = (event: MouseEvent) => {
  if (!props.closeOnBackdropClick) return

  if (event.target === dialogRef.value) {
    close()
  }
}

onMounted(() => {
  if (props.modelValue) nextTick(() => open())
})

defineExpose({ open, close })
</script>

<style scoped>
.popup-dialog {
  border: none;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: min(90vw, 800px);
  max-height: min(90vh, 800px);
  width: fit-content;
  min-width: 400px;
  background: white;
  margin: auto;
  display: flex;
  flex-direction: column;
}

@media (max-height: 600px) {
  .popup-dialog {
    max-height: 95vh;
  }
}

@media (max-width: 480px) {
  .popup-dialog {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.popup-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  margin: 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  margin: 0;
}

.popup-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.popup-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.popup-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.popup-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin: 0;
}

.popup-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
  margin: 0;
}

.popup-dialog:focus {
  outline: none;
}

body:has(.popup-dialog[open]) {
  overflow: hidden;
}
</style>
