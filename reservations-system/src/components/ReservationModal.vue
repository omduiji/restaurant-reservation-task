<template>
  <AppModal
    v-model="isOpen"
    :title="`Edit Reservation Settings - ${branch?.name}`"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="popup-title">Edit Reservation Settings - {{ branch?.name }}</h2>
      </div>
    </template>

    <FormWrapper
      :key="formKey"
      :initial-values="initialFormValues"
      @submit="handleSubmit"
      v-slot="{ meta, isSubmitting: veeSubmitting, values, setFieldValue }"
    >
      <div class="space-y-6">
        <!-- Reservation Duration -->
        <div
          class="mx-auto p-3 border border-l-0 border-r-0 border-t-primary-200 border-b-primary-200 bg-primary-600"
        >
          <p class="text-primary-100 font-bold">
            Branch Working Hours from {{ branch?.opening_from }} - {{ branch?.opening_to }}
          </p>
        </div>
        <AppTextInput
          type="number"
          label="Reservation Duration (minutes)*"
          placeholder="Enter reservation duration in minutes"
          :validation-rules="'required|numeric|reasonableDuration'"
          validation-name="reservation_duration"
          :step="15"
          :min="15"
          :max="480"
        />

        <!-- Tables Selection -->
        <AppSelectInput
          :options="tableOptions"
          label="Available Tables"
          placeholder="Select tables that accept reservations"
          multiple
          :validation-rules="'tablesSelected'"
          validation-name="enabled_tables"
        />

        <!-- Days Schedule -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
          <p class="text-sm text-gray-600">
            Set available time slots for each day (max 3 slots per day)
          </p>

          <!-- Hidden field for schedules validation -->
          <Field name="schedules" :rules="validateSchedules" v-slot="{ errors }">
            <input type="hidden" :value="JSON.stringify(values.schedules)" />
            <span v-if="errors.length" class="text-red-500 block mb-4 text-sm">
              {{ errors[0] }}
            </span>
          </Field>

          <div v-for="day in weekDays" :key="day" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium text-gray-900 capitalize">{{ day }}</h4>
              <AppButton
                v-if="day === 'saturday'"
                variant="secondary"
                size="small"
                @click="applySaturdayToAll(values, setFieldValue)"
                type="button"
              >
                Apply on all days
              </AppButton>
            </div>

            <div class="space-y-3">
              <TimeSlotInput
                v-for="(slot, index) in getTimeSlotsForDay(day, values)"
                :key="slot.id"
                :start-time="slot.start_time"
                :end-time="slot.end_time"
                :day="day"
                :index="index"
                :can-remove="getTimeSlotsForDay(day, values).length > 1"
                :can-add="getTimeSlotsForDay(day, values).length < 3"
                @add="addTimeSlot(day, values, setFieldValue)"
                @remove="removeTimeSlot(day, index, values, setFieldValue)"
                @update:start-time="
                  handleTimeSlotUpdate(day, index, 'start_time', $event, values, setFieldValue)
                "
                @update:end-time="
                  handleTimeSlotUpdate(day, index, 'end_time', $event, values, setFieldValue)
                "
              />
            </div>

            <AppButton
              v-if="getTimeSlotsForDay(day, values).length < 3"
              variant="text"
              size="small"
              @click="addTimeSlot(day, values, setFieldValue)"
              type="button"
              class="mt-6"
            >
              + Add Time Slot
            </AppButton>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="popup-footer">
          <AppButton variant="secondary" type="button" @click="close" :disabled="veeSubmitting">
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            type="submit"
            :disabled="veeSubmitting || !meta.dirty || !meta.valid"
          >
            Save Changes
          </AppButton>
        </div>
      </div>
    </FormWrapper>
  </AppModal>
</template>

<script setup lang="ts">
import { generateId } from '@/utils'
import { Field } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import type { Branch, ReservationSettings, TimeSlot, WeekDay } from '../types'
import TimeSlotInput from './TimeSlotInput.vue'
import AppButton from './ui/AppButton.vue'
import AppModal from './ui/AppModal.vue'
import AppSelectInput from './ui/AppSelectInput.vue'
import AppTextInput from './ui/AppTextInput.vue'

interface Props {
  modelValue?: boolean
  branch?: Branch | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', settings: ReservationSettings): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  branch: null,
})

const emit = defineEmits<Emits>()

// Use computed property for isOpen to sync with modelValue
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

// Week days in order
const weekDays: WeekDay[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]

// Form key to force re-initialization when branch changes
const formKey = ref(0)

// Initial form values computed from branch data
const initialFormValues = computed(() => {
  if (!props.branch) {
    return getDefaultFormValues()
  }

  console.log('Computing initial form values from branch:', props.branch)

  // Convert API format to form format
  const schedules = weekDays.map((day) => {
    const daySlots = props.branch?.reservation_times?.[day] || []
    const validSlots = Array.isArray(daySlots)
      ? daySlots.filter(
          (slot) =>
            Array.isArray(slot) &&
            slot.length === 2 &&
            typeof slot[0] === 'string' &&
            typeof slot[1] === 'string' &&
            /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(slot[0]) &&
            /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(slot[1]),
        )
      : []

    const timeSlots: TimeSlot[] = validSlots.map((slot, index) => ({
      id: `slot-${day}-${index}`,
      start_time: slot[0],
      end_time: slot[1],
    }))

    // Ensure at least one time slot per day
    if (timeSlots.length === 0) {
      timeSlots.push({
        id: `slot-${day}-0`,
        start_time: '09:00',
        end_time: '17:00',
      })
    }

    return {
      day,
      time_slots: timeSlots,
    }
  })

  // Get enabled tables
  const enabledTables: string[] = []

  if (props.branch.sections && Array.isArray(props.branch.sections)) {
    props.branch.sections.forEach((section) => {
      if (section.tables && Array.isArray(section.tables)) {
        section.tables.forEach((table) => {
          if (table.accepts_reservations === true && table.id) {
            enabledTables.push(table.id)
          }
        })
      }
    })
  }

  const formValues = {
    reservation_duration: props.branch.reservation_duration,
    enabled_tables: enabledTables,
    schedules,
  }

  console.log('Computed form values:', formValues)
  return formValues
})

// Default form values
function getDefaultFormValues() {
  return {
    reservation_duration: 60,
    enabled_tables: [],
    schedules: weekDays.map((day) => ({
      day,
      time_slots: [
        {
          id: `slot-${day}-0`,
          start_time: '09:00',
          end_time: '17:00',
        },
      ],
    })),
  }
}

// Table options for dropdown
const tableOptions = computed(() => {
  if (!props.branch) return []
  const options: Array<{ value: string; label: string }> = []

  if (props.branch.sections && Array.isArray(props.branch.sections)) {
    props.branch.sections.forEach((section) => {
      if (section.tables && Array.isArray(section.tables)) {
        section.tables.forEach((table) => {
          if (table.id && section.name && table.name) {
            options.push({
              value: table.id,
              label: `${section.name} - ${table.name}`,
            })
          }
        })
      }
    })
  }
  return options
})

// Watch for branch changes and reset form
watch(
  () => props.branch,
  (newBranch) => {
    console.log('Branch changed:', newBranch)
    // Increment formKey to force FormWrapper re-initialization
    formKey.value++
  },
)

// Validation function for schedules
const validateSchedules = (schedules: any, context: any) => {
  if (!schedules || !Array.isArray(schedules)) {
    return 'Invalid schedule data'
  }

  for (const schedule of schedules) {
    if (!schedule.time_slots || schedule.time_slots.length === 0) {
      return `${schedule.day} must have at least one time slot`
    }
    if (schedule.time_slots.length > 3) {
      return `${schedule.day} cannot have more than 3 time slots`
    }

    for (let i = 0; i < schedule.time_slots.length; i++) {
      const slot = schedule.time_slots[i]
      if (!slot || typeof slot.start_time !== 'string' || typeof slot.end_time !== 'string') {
        return `Invalid time slot data for ${schedule.day} slot ${i + 1}`
      }
      // Validate time format
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
      if (!timeRegex.test(slot.start_time)) {
        return `Invalid start time format for ${schedule.day} slot ${i + 1}`
      }
      if (!timeRegex.test(slot.end_time)) {
        return `Invalid end time format for ${schedule.day} slot ${i + 1}`
      }

      // Validate start time is before end time
      const [startHours, startMinutes] = slot.start_time.split(':').map(Number)
      const [endHours, endMinutes] = slot.end_time.split(':').map(Number)
      const startMinutesTotal = startHours * 60 + startMinutes
      const endMinutesTotal = endHours * 60 + endMinutes
      const reservationDuration = context?.form?.reservation_duration
      const slotDurationMinutes = endMinutesTotal - startMinutesTotal

      if (startMinutesTotal >= endMinutesTotal) {
        return `Start time must be before end time for ${schedule.day} slot ${i + 1}`
      }
      if (slotDurationMinutes < reservationDuration) {
        return `Time slot must be at least ${reservationDuration} minutes long`
      }

      // Check for overlapping slots
      for (let j = i + 1; j < schedule.time_slots.length; j++) {
        const otherSlot = schedule.time_slots[j]
        if (
          !otherSlot ||
          typeof otherSlot.start_time !== 'string' ||
          typeof otherSlot.end_time !== 'string'
        ) {
          continue
        }
        const [otherStartHours, otherStartMinutes] = otherSlot.start_time.split(':').map(Number)
        const [otherEndHours, otherEndMinutes] = otherSlot.end_time.split(':').map(Number)
        const otherStartMinutesTotal = otherStartHours * 60 + otherStartMinutes
        const otherEndMinutesTotal = otherEndHours * 60 + otherEndMinutes

        // Check if slots overlap
        if (startMinutesTotal < otherEndMinutesTotal && endMinutesTotal > otherStartMinutesTotal) {
          return `Time slots overlap on ${schedule.day}`
        }
      }
    }
  }

  return true
}

// Get time slots for a specific day from form values
const getTimeSlotsForDay = (day: WeekDay, values: any) => {
  const daySchedule = values.schedules?.find((schedule: any) => schedule.day === day)
  return daySchedule ? daySchedule.time_slots : []
}

// Handle time slot updates using setFieldValue
const handleTimeSlotUpdate = (
  day: WeekDay,
  index: number,
  field: 'start_time' | 'end_time',
  value: string,
  values: any,
  setFieldValue: (field: string, value: any) => void,
) => {
  const dayIndex = values.schedules.findIndex((schedule: any) => schedule.day === day)
  if (dayIndex !== -1 && values.schedules[dayIndex].time_slots[index]) {
    const updatedSchedules = [...values.schedules]
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      time_slots: updatedSchedules[dayIndex].time_slots.map((slot: any, i: number) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }
    setFieldValue('schedules', updatedSchedules)
  }
}

// Add time slot to a day
const addTimeSlot = (
  day: WeekDay,
  values: any,
  setFieldValue: (field: string, value: any) => void,
) => {
  const dayIndex = values.schedules.findIndex((schedule: any) => schedule.day === day)
  if (dayIndex !== -1 && values.schedules[dayIndex].time_slots.length < 3) {
    const updatedSchedules = [...values.schedules]
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      time_slots: [
        ...updatedSchedules[dayIndex].time_slots,
        {
          id: generateId(),
          start_time: '09:00',
          end_time: '17:00',
        },
      ],
    }
    setFieldValue('schedules', updatedSchedules)
  }
}

// Remove time slot from a day
const removeTimeSlot = (
  day: WeekDay,
  index: number,
  values: any,
  setFieldValue: (field: string, value: any) => void,
) => {
  const dayIndex = values.schedules.findIndex((schedule: any) => schedule.day === day)
  if (dayIndex !== -1 && values.schedules[dayIndex].time_slots.length > 1) {
    const updatedSchedules = [...values.schedules]
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      time_slots: updatedSchedules[dayIndex].time_slots.filter((_: any, i: number) => i !== index),
    }
    setFieldValue('schedules', updatedSchedules)
  }
}

// Apply Saturday's time slots to all days
const applySaturdayToAll = (values: any, setFieldValue: (field: string, value: any) => void) => {
  const saturdaySchedule = values.schedules.find((schedule: any) => schedule.day === 'saturday')
  if (saturdaySchedule) {
    const updatedSchedules = values.schedules.map((schedule: any) => ({
      ...schedule,
      time_slots: saturdaySchedule.time_slots.map((slot: any) => ({
        ...slot,
        id: generateId(),
      })),
    }))
    setFieldValue('schedules', updatedSchedules)
  }
}

// Handle form submission
const handleSubmit = async (values: any) => {
  try {
    console.log('Submitting form with values:', values)

    // Convert schedules array to reservation_times object
    const reservation_times: Record<string, [string, string][]> = {}

    if (values.schedules && Array.isArray(values.schedules)) {
      values.schedules.forEach((schedule: any) => {
        if (schedule.day && schedule.time_slots && Array.isArray(schedule.time_slots)) {
          reservation_times[schedule.day] = schedule.time_slots.map((slot: any) => [
            slot.start_time,
            slot.end_time,
          ])
        }
      })
    }

    const apiData: ReservationSettings = {
      reservation_duration: values.reservation_duration,
      enabled_tables: values.enabled_tables || [],
      schedules: values.schedules, // Keep for internal use
    }

    // Add the API-formatted reservation_times
    const apiDataWithTimes = {
      ...apiData,
      reservation_times, // ✅ Correct API format!
    }

    emit('save', apiDataWithTimes)
    close()
  } catch (error) {
    console.error('Error saving reservation settings:', error)
  }
}

// Close modal
const close = () => {
  isOpen.value = false
}

// Handle modal close
const handleClose = () => {
  close()
}
</script>

<style scoped>
.popup-footer {
  @apply flex justify-end gap-3 pt-6 border-t border-gray-200;
}
</style>
