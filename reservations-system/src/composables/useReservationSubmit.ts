import type { WeekDay } from '../types'
import type { FormValues } from './useReservationForm'

export function useReservationSubmit() {
  const transformFormData = (values: FormValues) => {
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

    return {
      reservation_duration: values.reservation_duration,
      enabled_tables: values.enabled_tables || [],
      reservation_times,
    }
  }

  return { transformFormData }
}
