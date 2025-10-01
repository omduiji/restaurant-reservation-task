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
      :key="`Edit-${branch?.id}`"
      :initial-values="initialFormValues"
      @submit="handleSubmit"
      v-slot="{ meta, isSubmitting: veeSubmitting, values, setFieldValue, validateField }"
    >
      <div class="space-y-6">
        <div
          class="mx-auto p-3 border border-l-0 border-r-0 border-t-primary-200 border-b-primary-200 bg-primary-600"
        >
          <p class="text-primary-100 font-bold">
            Branch Working Hours from {{ branch?.opening_from ?? 'N/A' }} -
            {{ branch?.opening_to ?? 'N/A' }}
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
          @change="() => validateField('schedules')"
        />

        <AppSelectInput
          :options="tableOptions"
          label="Available Tables"
          placeholder="Select tables that accept reservations"
          multiple
          :validation-rules="'tablesSelected'"
          validation-name="enabled_tables"
        />

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
          <p class="text-sm text-gray-600">
            Set available time slots for each day (max 3 slots per day)
          </p>
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
    <AppConfirmationModal
      v-model="confirmationState.show"
      :title="confirmationState.modalTitle"
      :message="confirmationState.modalMessage"
      :confirm-text="confirmationState.confirmText"
      :cancel-text="confirmationState.cancelText"
      :variant="confirmationState.variant"
      :loading="confirmationState.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </AppModal>
</template>

<script setup lang="ts">
import { useConfirmationModal } from '@/composables/useConfirmationModal'
import { generateId } from '@/utils'
import { Field } from 'vee-validate'
import { computed } from 'vue'
import type { Branch, DaySchedule, ReservationSettings, TimeSlot, WeekDay } from '../types'
import AppConfirmationModal from './AppConfirmationModal.vue'
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
  (
    e: 'save',
    settings: Omit<ReservationSettings, 'schedules'> & {
      reservation_times: Record<WeekDay, [string, string][]>
    },
  ): void
}

interface FormValues {
  reservation_duration: number
  enabled_tables: string[]
  schedules: DaySchedule[]
}

interface ValidationContext {
  form?: {
    reservation_duration?: number
    enabled_tables?: string[]
    schedules?: DaySchedule[]
  }
}

interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  branch: null,
})

const emit = defineEmits<Emits>()

const {
  confirmationState,
  registerConfirmation,
  openConfirmation,
  handleConfirm,
  handleCancel,
  showResult,
} = useConfirmationModal()

registerConfirmation('applySaturdayToAll', {
  modalTitle: 'Apply Saturday Schedule to All Days',
  modalMessage:
    'This will override all existing time slots for all days with the Saturday schedule. This action cannot be undone.',
  confirmText: 'Apply to All Days',
  cancelText: 'Cancel',
  variant: 'warning',
  onConfirm: async (data: {
    values: FormValues
    setFieldValue: (field: string, value: unknown) => void
  }) => {
    try {
      applySaturdaySchedule(data.values, data.setFieldValue)
      setTimeout(() => {
        showResult(
          'Success!',
          'Saturday schedule has been applied to all days successfully.',
          'success',
        )
      }, 100)
    } catch (error) {
      setTimeout(() => {
        showResult(
          'Error',
          String(error) || 'Failed to apply Saturday schedule. Please try again.',
          'danger',
        )
      }, 100)
    }
  },
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const weekDays: WeekDay[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]

const initialFormValues = computed<FormValues>(() => {
  if (!props.branch) {
    return getDefaultFormValues()
  }

  const schedules: DaySchedule[] = weekDays.map((day) => {
    const daySlots = props.branch?.reservation_times?.[day]

    const validSlots = Array.isArray(daySlots)
      ? daySlots.filter(
          (slot): slot is [string, string] =>
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

  const formValues: FormValues = {
    reservation_duration: props.branch.reservation_duration,
    enabled_tables: enabledTables,
    schedules,
  }

  return formValues
})

function getDefaultFormValues(): FormValues {
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

const tableOptions = computed<SelectOption[]>(() => {
  if (!props.branch) return []

  const options: SelectOption[] = []

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

const validateSchedules = (schedules: unknown, context?: ValidationContext): string | boolean => {
  if (!schedules || !Array.isArray(schedules)) {
    return 'Invalid schedule data'
  }
  const typedSchedules = schedules as DaySchedule[]
  const reservationDuration = context?.form?.reservation_duration ?? 60

  for (const schedule of typedSchedules) {
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

      if (startMinutesTotal >= endMinutesTotal) {
        return `Start time must be before end time for ${schedule.day} slot ${i + 1}. Time slots cannot cross midnight.`
      }

      // Validate minimum slot duration
      const slotDurationMinutes = endMinutesTotal - startMinutesTotal
      if (slotDurationMinutes < reservationDuration) {
        return `Time slot on ${schedule.day} (slot ${i + 1}) must be at least ${reservationDuration} minutes long (current reservation duration)`
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

        // Check if slots overlap (back-to-back allowed)
        if (startMinutesTotal < otherEndMinutesTotal && endMinutesTotal > otherStartMinutesTotal) {
          return `Time slots overlap on ${schedule.day}`
        }
      }
    }
  }

  return true
}

const getTimeSlotsForDay = (day: WeekDay, values: FormValues): TimeSlot[] => {
  const daySchedule = values.schedules?.find((schedule) => schedule.day === day)
  return daySchedule ? daySchedule.time_slots : []
}

const handleTimeSlotUpdate = (
  day: WeekDay,
  index: number,
  field: 'start_time' | 'end_time',
  value: string,
  values: FormValues,
  setFieldValue: (field: string, value: unknown) => void,
): void => {
  const dayIndex = values.schedules.findIndex((schedule) => schedule.day === day)
  if (dayIndex !== -1 && values.schedules[dayIndex].time_slots[index]) {
    const updatedSchedules = [...values.schedules]
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      time_slots: updatedSchedules[dayIndex].time_slots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }
    setFieldValue('schedules', updatedSchedules)
  }
}

const addTimeSlot = (
  day: WeekDay,
  values: FormValues,
  setFieldValue: (field: string, value: unknown) => void,
): void => {
  const dayIndex = values.schedules.findIndex((schedule) => schedule.day === day)
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

const removeTimeSlot = (
  day: WeekDay,
  index: number,
  values: FormValues,
  setFieldValue: (field: string, value: unknown) => void,
): void => {
  const dayIndex = values.schedules.findIndex((schedule) => schedule.day === day)
  if (dayIndex !== -1 && values.schedules[dayIndex].time_slots.length > 1) {
    const updatedSchedules = [...values.schedules]
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      time_slots: updatedSchedules[dayIndex].time_slots.filter((_, i) => i !== index),
    }
    setFieldValue('schedules', updatedSchedules)
  }
}

const applySaturdayToAll = (
  values: FormValues,
  setFieldValue: (field: string, value: unknown) => void,
): void => {
  openConfirmation('applySaturdayToAll', { values, setFieldValue })
}
const applySaturdaySchedule = (
  values: FormValues,
  setFieldValue: (field: string, value: unknown) => void,
): void => {
  const saturdaySchedule = values.schedules.find((schedule) => schedule.day === 'saturday')
  if (saturdaySchedule) {
    const updatedSchedules = values.schedules.map((schedule) => ({
      ...schedule,
      time_slots: saturdaySchedule.time_slots.map((slot) => ({
        ...slot,
        id: generateId(),
      })),
    }))
    setFieldValue('schedules', updatedSchedules)
  }
}
const handleSubmit = async (values: FormValues): Promise<void> => {
  try {
    const reservation_times: Record<WeekDay, [string, string][]> = {} as Record<
      WeekDay,
      [string, string][]
    >

    if (values.schedules && Array.isArray(values.schedules)) {
      values.schedules.forEach((schedule) => {
        if (schedule.day && schedule.time_slots && Array.isArray(schedule.time_slots)) {
          reservation_times[schedule.day] = schedule.time_slots.map((slot) => [
            slot.start_time,
            slot.end_time,
          ])
        }
      })
    }

    const apiData = {
      reservation_duration: values.reservation_duration,
      enabled_tables: values.enabled_tables || [],
      // schedules: values.schedules,
      reservation_times,
    }

    emit('save', apiData)
    close()
  } catch (error) {
    console.error('Error saving reservation settings:', error)
  }
}

const close = (): void => {
  isOpen.value = false
}

const handleClose = (): void => {
  close()
}
</script>

<style scoped>
.popup-footer {
  @apply flex justify-end gap-3 pt-6 border-t border-gray-200;
}
</style>
