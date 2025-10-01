<template>
  <div class="flex items-center gap-2 w-36">
    <input
      ref="hoursInputRef"
      v-model="hoursInput"
      type="text"
      placeholder="09"
      maxlength="2"
      class="border p-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500 w-16"
      :class="hasError ? 'border-red-500' : 'border-gray-300'"
      @input="handleHoursChange"
      @blur="formatHours"
    />
    <div>
      <span class="text-gray-600 font-medium text-lg mx-0 my-3">:</span>
    </div>
    <input
      ref="minutesInputRef"
      v-model="minutesInput"
      type="text"
      placeholder="00"
      maxlength="2"
      class="border p-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500 w-16"
      :class="hasError ? 'border-red-500' : 'border-gray-300'"
      @input="handleMinutesChange"
      @blur="formatMinutes"
    />
  </div>
</template>

<script setup lang="ts">
import { useTimeInput } from '@/composables/useTimeInput'
import { toRef } from 'vue'

interface Props {
  modelValue: string
  validationBaseName?: string
  hasError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  validationBaseName: 'time',
  hasError: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const {
  hoursInput,
  minutesInput,
  hoursInputRef,
  minutesInputRef,
  handleHoursChange,
  handleMinutesChange,
  formatHours,
  formatMinutes,
} = useTimeInput({
  modelValue: toRef(props, 'modelValue'),
  onUpdate: (value) => emit('update:modelValue', value),
})
</script>

<style scoped></style>
