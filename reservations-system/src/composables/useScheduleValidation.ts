import type { DaySchedule } from '../types'

interface ValidationContext {
  form?: {
    reservation_duration?: number
    enabled_tables?: string[]
    schedules?: DaySchedule[]
  }
}

export function useScheduleValidation() {
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

        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
        if (!timeRegex.test(slot.start_time) || !timeRegex.test(slot.end_time)) {
          return `Invalid time format for ${schedule.day} slot ${i + 1}`
        }

        const [startHours, startMinutes] = slot.start_time.split(':').map(Number)
        const [endHours, endMinutes] = slot.end_time.split(':').map(Number)
        const startMinutesTotal = startHours * 60 + startMinutes
        const endMinutesTotal = endHours * 60 + endMinutes

        if (startMinutesTotal >= endMinutesTotal) {
          return `Start time must be before end time for ${schedule.day} slot ${i + 1}`
        }

        const slotDurationMinutes = endMinutesTotal - startMinutesTotal
        if (slotDurationMinutes < reservationDuration) {
          return `Time slot on ${schedule.day} (slot ${i + 1}) must be at least ${reservationDuration} minutes long`
        }

        for (let j = i + 1; j < schedule.time_slots.length; j++) {
          const otherSlot = schedule.time_slots[j]
          if (
            !otherSlot ||
            typeof otherSlot.start_time !== 'string' ||
            typeof otherSlot.end_time !== 'string'
          )
            continue

          const [otherStartHours, otherStartMinutes] = otherSlot.start_time.split(':').map(Number)
          const [otherEndHours, otherEndMinutes] = otherSlot.end_time.split(':').map(Number)
          const otherStartMinutesTotal = otherStartHours * 60 + otherStartMinutes
          const otherEndMinutesTotal = otherEndHours * 60 + otherEndMinutes

          if (
            startMinutesTotal < otherEndMinutesTotal &&
            endMinutesTotal > otherStartMinutesTotal
          ) {
            return `Time slots overlap on ${schedule.day}`
          }
        }
      }
    }

    return true
  }

  return { validateSchedules }
}
