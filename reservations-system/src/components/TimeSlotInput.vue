<template>
  <div
    class="time-slot-input flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 justify-start"
  >
    <!-- Start Time -->
    <div class="">
      <p class="block text-sm font-medium text-gray-700 mb-2">Start Time</p>
      <TimeInput
        :model-value="startTime"
        :validation-base-name="`${day}_${index}_start`"
        @update:modelValue="$emit('update:start-time', $event)"
      />
    </div>

    <!-- Separator -->
    <div class="flex items-center pt-6">
      <span class="text-gray-500 font-medium text-lg">-</span>
    </div>

    <!-- End Time -->
    <div class="">
      <p class="block text-sm font-medium text-gray-700 mb-2">End Time</p>
      <TimeInput
        :model-value="endTime"
        :validation-base-name="`${day}_${index}_end`"
        @update:modelValue="$emit('update:end-time', $event)"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 pt-6">
      <AppButton
        v-if="canRemove"
        variant="remove"
        size="small"
        @click="$emit('remove')"
        type="button"
        class="!p-2"
        title="Remove time slot"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeekDay } from '../types'
import AppButton from './ui/AppButton.vue'
import TimeInput from './ui/TimeInput.vue'

interface Props {
  startTime: string
  endTime: string
  day: WeekDay
  index: number
  canAdd?: boolean
  canRemove?: boolean
}

interface Emits {
  (e: 'update:start-time', value: string): void
  (e: 'update:end-time', value: string): void
  (e: 'add'): void
  (e: 'remove'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.time-slot-input {
  transition: all 0.2s ease;
}

.time-slot-input:hover {
  @apply bg-gray-100 border-gray-300;
}
</style>
