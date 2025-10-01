import { computed, type Ref } from 'vue'
import type { Branch, DaySchedule, TimeSlot, WeekDay } from '../types'

export interface FormValues {
  reservation_duration: number
  enabled_tables: string[]
  schedules: DaySchedule[]
}

interface UseReservationFormOptions {
  branch: Ref<Branch | null | undefined>
}

const WEEK_DAYS: WeekDay[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]

export function useReservationForm(options: UseReservationFormOptions) {
  const { branch } = options

  const weekDays = WEEK_DAYS

  const initialFormValues = computed<FormValues>(() => {
    if (!branch.value) {
      return getDefaultFormValues()
    }

    const schedules: DaySchedule[] = weekDays.map((day) => {
      const daySlots = branch.value?.reservation_times?.[day]
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

      const timeSlots: TimeSlot[] =
        validSlots.length > 0
          ? validSlots.map((slot, index) => ({
              id: `slot-${day}-${index}`,
              start_time: slot[0],
              end_time: slot[1],
            }))
          : [{ id: `slot-${day}-0`, start_time: '09:00', end_time: '17:00' }]

      return { day, time_slots: timeSlots }
    })

    const enabledTables: string[] = []
    if (branch.value.sections && Array.isArray(branch.value.sections)) {
      branch.value.sections.forEach((section) => {
        if (section.tables && Array.isArray(section.tables)) {
          section.tables.forEach((table) => {
            if (table.accepts_reservations === true && table.id) {
              enabledTables.push(table.id)
            }
          })
        }
      })
    }

    return {
      reservation_duration: branch.value.reservation_duration,
      enabled_tables: enabledTables,
      schedules,
    }
  })

  const tableOptions = computed(() => {
    if (!branch.value) return []

    const options: Array<{ value: string; label: string }> = []
    if (branch.value.sections && Array.isArray(branch.value.sections)) {
      branch.value.sections.forEach((section) => {
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

  function getDefaultFormValues(): FormValues {
    return {
      reservation_duration: 60,
      enabled_tables: [],
      schedules: weekDays.map((day) => ({
        day,
        time_slots: [{ id: `slot-${day}-0`, start_time: '09:00', end_time: '17:00' }],
      })),
    }
  }

  return {
    weekDays,
    initialFormValues,
    tableOptions,
  }
}
