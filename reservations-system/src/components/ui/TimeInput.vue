<template>
  <div class="time-input-24h flex items-center gap-2">
    <!-- Hours -->
    <input
      ref="hoursInputRef"
      v-model="hoursInput"
      type="text"
      placeholder="09"
      maxlength="2"
      class="hours-input border p-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="hasError ? 'border-red-500' : 'border-gray-300'"
      @input="handleHoursChange"
      @blur="formatHours"
    />
    <div class="">
      <span class="time-separator text-gray-600 font-medium text-lg">:</span>
    </div>

    <!-- Minutes -->
    <input
      ref="minutesInputRef"
      v-model="minutesInput"
      type="text"
      placeholder="00"
      maxlength="2"
      class="minutes-input border p-2 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="hasError ? 'border-red-500' : 'border-gray-300'"
      @input="handleMinutesChange"
      @blur="formatMinutes"
    />
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

interface Props {
  modelValue: string
  validationBaseName?: string
  hasError?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  validationBaseName: 'time',
  hasError: false,
})

const emit = defineEmits<Emits>()

// Reactive inputs for hours and minutes
const hoursInput = ref('09')
const minutesInput = ref('00')
const hoursInputRef = ref<HTMLInputElement | null>(null)
const minutesInputRef = ref<HTMLInputElement | null>(null)

// Parse current time value and initialize inputs
const initializeFromValue = (timeValue: string) => {
  if (!timeValue) {
    hoursInput.value = '09'
    minutesInput.value = '00'
    return
  }

  const [hoursStr, minutesStr] = timeValue.split(':')
  hoursInput.value = hoursStr || '09'
  minutesInput.value = minutesStr || '00'
}

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    initializeFromValue(newValue)
  },
  { immediate: true },
)

// Format hours to 2-digit with leading zero
const formatHours = () => {
  if (!hoursInput.value) {
    hoursInput.value = '09'
    updateTime()
    return
  }

  let hours = parseInt(hoursInput.value, 10)
  if (isNaN(hours)) {
    hoursInput.value = '09'
  } else {
    hours = Math.max(0, Math.min(23, hours))
    hoursInput.value = hours.toString().padStart(2, '0')
  }
  updateTime()
}

// Format minutes to 2-digit with leading zero
const formatMinutes = () => {
  if (!minutesInput.value) {
    minutesInput.value = '00'
    updateTime()
    return
  }

  let minutes = parseInt(minutesInput.value, 10)
  if (isNaN(minutes)) {
    minutesInput.value = '00'
  } else {
    minutes = Math.max(0, Math.min(59, minutes))
    minutesInput.value = minutes.toString().padStart(2, '0')
  }
  updateTime()
}

// Handle hours input change
const handleHoursChange = () => {
  const strValue = String(hoursInput.value || '')

  // Only allow numbers
  const numericValue = strValue.replace(/[^\d]/g, '')

  // Limit to 2 digits max
  const limitedValue = numericValue.slice(0, 2)

  // Validate the value
  if (limitedValue === '' || /^\d{1,2}$/.test(limitedValue)) {
    const numValue = parseInt(limitedValue, 10)

    // Check if the value is within valid range
    if (isNaN(numValue) || (numValue >= 0 && numValue <= 23)) {
      hoursInput.value = limitedValue

      // Auto-format if user entered 2 digits
      if (limitedValue.length === 2) {
        nextTick(() => {
          formatHours()
        })
      }
    }
  }
  updateTime()
}

// Handle minutes input change
const handleMinutesChange = () => {
  const strValue = String(minutesInput.value || '')

  // Only allow numbers
  const numericValue = strValue.replace(/[^\d]/g, '')

  // Limit to 2 digits max
  const limitedValue = numericValue.slice(0, 2)

  // Validate the value
  if (limitedValue === '' || /^\d{1,2}$/.test(limitedValue)) {
    const numValue = parseInt(limitedValue, 10)

    // Check if the value is within valid range
    if (isNaN(numValue) || (numValue >= 0 && numValue <= 59)) {
      minutesInput.value = limitedValue

      // Auto-format if user entered 2 digits
      if (limitedValue.length === 2) {
        nextTick(() => {
          formatMinutes()
        })
      }
    }
  }
  updateTime()
}

// Update the complete time value
const updateTime = () => {
  const hours = hoursInput.value.padStart(2, '0')
  const minutes = minutesInput.value.padStart(2, '0')

  // Validate final values
  const hoursNum = parseInt(hours, 10)
  const minutesNum = parseInt(minutes, 10)

  if (hoursNum >= 0 && hoursNum <= 23 && minutesNum >= 0 && minutesNum <= 59) {
    const formattedTime = `${hours}:${minutes}`
    emit('update:modelValue', formattedTime)
  } else {
    // Reset to default if invalid
    hoursInput.value = '09'
    minutesInput.value = '00'
    emit('update:modelValue', '09:00')
  }
}

// Additional safety: validate on changes
watch([hoursInput, minutesInput], () => {
  const hoursNum = parseInt(hoursInput.value, 10)
  const minutesNum = parseInt(minutesInput.value, 10)

  if (hoursNum > 23) {
    hoursInput.value = '23'
    updateTime()
  }

  if (minutesNum > 59) {
    minutesInput.value = '59'
    updateTime()
  }
})
</script>

<style scoped>
.time-input-24h {
  min-width: 140px;
}

.hours-input,
.minutes-input {
  width: 60px;
}

.time-separator {
  margin: 0 4px;
}
</style>
