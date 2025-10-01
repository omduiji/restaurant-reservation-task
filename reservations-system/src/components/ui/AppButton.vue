<template>
  <button
    :type="computedType"
    :class="[
      'rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'primary' &&
        'bg-primary-100 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-gray-300 disabled:text-gray-500',
      variant === 'secondary' &&
        'bg-white text-gray-500 border border-gray-500 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300',
      variant === 'danger' &&
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500',
      variant === 'text' &&
        'text-black hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
      variant === 'remove' &&
        'bg-white text-gray-500 border border-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-600 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300',
      size === 'small' && 'px-3 py-1 text-sm',
      size === 'medium' && 'px-4 py-2',
      size === 'large' && 'px-6 py-3 text-lg',
      size === 'custom' && '',
      fullWidth ? 'w-full' : 'w-fit',
      customClass,
    ]"
    :disabled="disabled"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'text' | 'remove'
  size?: 'small' | 'medium' | 'large' | 'custom'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  label?: string
  fullWidth?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  label: '',
  fullWidth: false,
  customClass: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const computedType = computed(() => props.type)

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
