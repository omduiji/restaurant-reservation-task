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
                @click="openConfirmation('applySaturdayToAll', { values, setFieldValue })"
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
import { useReservationForm } from '@/composables/useReservationForm'
import { useReservationSubmit } from '@/composables/useReservationSubmit'
import { useScheduleValidation } from '@/composables/useScheduleValidation'
import { useTimeSlotManagement } from '@/composables/useTimeSlotManagement'
import { Field } from 'vee-validate'
import { computed, toRef } from 'vue'
import type { Branch, DaySchedule, ReservationSettings, WeekDay } from '../types'
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

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  branch: null,
})

const emit = defineEmits<Emits>()

const { weekDays, initialFormValues, tableOptions } = useReservationForm({
  branch: toRef(props, 'branch'),
})

const { validateSchedules } = useScheduleValidation()

const {
  getTimeSlotsForDay,
  handleTimeSlotUpdate,
  addTimeSlot,
  removeTimeSlot,
  applySaturdaySchedule,
} = useTimeSlotManagement()

const { transformFormData } = useReservationSubmit()

const {
  confirmationState,
  registerConfirmation,
  handleConfirm,
  handleCancel,
  openConfirmation,
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

const handleSubmit = async (values: FormValues): Promise<void> => {
  try {
    const apiData = transformFormData(values)
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
