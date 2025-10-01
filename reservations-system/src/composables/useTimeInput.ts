// composables/useTimeInput.ts
import { computed, nextTick, ref, useTemplateRef, watch, type Ref } from 'vue'

interface UseTimeInputOptions {
  modelValue: Ref<string> | (() => string)
  onUpdate: (value: string) => void
  defaultHours?: string
  defaultMinutes?: string
}

export function useTimeInput(options: UseTimeInputOptions) {
  const { modelValue, onUpdate, defaultHours = '09', defaultMinutes = '00' } = options

  const hoursInput = ref('')
  const minutesInput = ref('')
  const hoursInputRef = useTemplateRef<HTMLInputElement>('')
  const minutesInputRef = useTemplateRef<HTMLInputElement>('')

  const hoursNumber = computed(() => {
    const num = parseInt(hoursInput.value, 10)
    return isNaN(num) ? 0 : num
  })

  const minutesNumber = computed(() => {
    const num = parseInt(minutesInput.value, 10)
    return isNaN(num) ? 0 : num
  })

  const clampedHours = computed(() => Math.max(0, Math.min(23, hoursNumber.value)))
  const clampedMinutes = computed(() => Math.max(0, Math.min(59, minutesNumber.value)))

  const formattedHours = computed(() => clampedHours.value.toString().padStart(2, '0'))
  const formattedMinutes = computed(() => clampedMinutes.value.toString().padStart(2, '0'))

  const formattedTime = computed(() => `${formattedHours.value}:${formattedMinutes.value}`)

  const isHoursValid = computed(() => {
    if (!hoursInput.value) return false
    return hoursNumber.value >= 0 && hoursNumber.value <= 23
  })

  const isMinutesValid = computed(() => {
    if (!minutesInput.value) return false
    return minutesNumber.value >= 0 && minutesNumber.value <= 59
  })

  const isTimeValid = computed(() => isHoursValid.value && isMinutesValid.value)

  const parseTimeValue = (timeValue: string) => {
    if (!timeValue) {
      return { hours: defaultHours, minutes: defaultMinutes }
    }
    const [hours, minutes] = timeValue.split(':')
    return {
      hours: hours || defaultHours,
      minutes: minutes || defaultMinutes,
    }
  }

  const initializeFromValue = (timeValue: string) => {
    const { hours, minutes } = parseTimeValue(timeValue)
    hoursInput.value = hours
    minutesInput.value = minutes
  }

  const formatHours = () => {
    if (!hoursInput.value) {
      hoursInput.value = defaultHours
      return
    }
    hoursInput.value = formattedHours.value
  }

  const formatMinutes = () => {
    if (!minutesInput.value) {
      minutesInput.value = defaultMinutes
      return
    }
    minutesInput.value = formattedMinutes.value
  }

  const handleInputChange = (inputRef: Ref<string>, maxValue: number, formatFn: () => void) => {
    const strValue = String(inputRef.value || '')
    const numericValue = strValue.replace(/[^\d]/g, '')
    const limitedValue = numericValue.slice(0, 2)

    if (limitedValue === '') {
      inputRef.value = ''
      return
    }

    if (/^\d{1,2}$/.test(limitedValue)) {
      const numValue = parseInt(limitedValue, 10)

      if (numValue <= maxValue) {
        inputRef.value = limitedValue

        if (limitedValue.length === 2) {
          nextTick(() => formatFn())
        }
      }
    }
  }

  const handleHoursChange = () => {
    handleInputChange(hoursInput, 23, formatHours)
  }

  const handleMinutesChange = () => {
    handleInputChange(minutesInput, 59, formatMinutes)
  }

  const modelValueGetter = typeof modelValue === 'function' ? modelValue : () => modelValue.value

  watch(
    modelValueGetter,
    (newValue) => {
      initializeFromValue(newValue)
    },
    { immediate: true },
  )

  watch([hoursInput, minutesInput], () => {
    if (isTimeValid.value) {
      onUpdate(formattedTime.value)
    }
  })

  watch(clampedHours, (newVal) => {
    if (hoursInput.value && hoursNumber.value > 23) {
      hoursInput.value = newVal.toString().padStart(2, '0')
    }
  })

  watch(clampedMinutes, (newVal) => {
    if (minutesInput.value && minutesNumber.value > 59) {
      minutesInput.value = newVal.toString().padStart(2, '0')
    }
  })

  return {
    // Refs
    hoursInput,
    minutesInput,
    hoursInputRef,
    minutesInputRef,

    // Computed
    hoursNumber,
    minutesNumber,
    formattedHours,
    formattedMinutes,
    formattedTime,
    isHoursValid,
    isMinutesValid,
    isTimeValid,

    // Methods
    handleHoursChange,
    handleMinutesChange,
    formatHours,
    formatMinutes,
  }
}
