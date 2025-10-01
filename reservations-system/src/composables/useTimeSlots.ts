import { generateId } from '@/utils'
import { ref } from 'vue'
import type { DaySchedule, TimeSlot, WeekDay } from '../types'

export function useTimeSlots(initialSchedules: DaySchedule[] = []) {
  const timeSlots = ref<Map<WeekDay, TimeSlot[]>>(new Map())

  // Initialize time slots from schedules
  const initializeTimeSlots = (schedules: DaySchedule[]) => {
    timeSlots.value.clear()
    schedules.forEach((schedule) => {
      timeSlots.value.set(schedule.day, [...schedule.time_slots])
    })
  }

  // Add time slot to a specific day
  const addTimeSlot = (
    day: WeekDay,
    slot: Omit<TimeSlot, 'id'> = { start_time: '09:00', end_time: '17:00' },
  ) => {
    const currentSlots = timeSlots.value.get(day) || []
    if (currentSlots.length < 3) {
      const newSlot: TimeSlot = {
        id: generateId(),
        ...slot,
      }
      currentSlots.push(newSlot)
      timeSlots.value.set(day, currentSlots)
    }
  }

  // Remove time slot from a specific day
  const removeTimeSlot = (day: WeekDay, index: number) => {
    const currentSlots = timeSlots.value.get(day) || []
    if (currentSlots.length > 1) {
      currentSlots.splice(index, 1)
      timeSlots.value.set(day, currentSlots)
    }
  }

  // Update time slot
  const updateTimeSlot = (day: WeekDay, index: number, updates: Partial<TimeSlot>) => {
    const currentSlots = timeSlots.value.get(day) || []
    if (currentSlots[index]) {
      currentSlots[index] = { ...currentSlots[index], ...updates }
      timeSlots.value.set(day, currentSlots)
    }
  }

  // Apply time slots from one day to all days
  const applyToAllDays = (sourceDay: WeekDay) => {
    const sourceSlots = timeSlots.value.get(sourceDay) || []
    const weekDays: WeekDay[] = [
      'saturday',
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ]

    weekDays.forEach((day) => {
      if (day !== sourceDay) {
        timeSlots.value.set(
          day,
          sourceSlots.map((slot) => ({
            ...slot,
            id: generateId(), // New IDs to avoid conflicts
          })),
        )
      }
    })
  }

  // Get time slots for a specific day
  const getTimeSlotsForDay = (day: WeekDay): TimeSlot[] => {
    return timeSlots.value.get(day) || []
  }

  // Check if a day has maximum slots
  const hasMaxSlots = (day: WeekDay): boolean => {
    return getTimeSlotsForDay(day).length >= 3
  }

  // Convert time slots back to schedules format
  const toSchedules = (): DaySchedule[] => {
    const schedules: DaySchedule[] = []
    timeSlots.value.forEach((slots, day) => {
      schedules.push({
        day: day as WeekDay,
        time_slots: slots,
      })
    })
    return schedules
  }

  // Generate unique ID

  // Initialize with provided schedules
  if (initialSchedules.length > 0) {
    initializeTimeSlots(initialSchedules)
  }

  return {
    timeSlots,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    applyToAllDays,
    getTimeSlotsForDay,
    hasMaxSlots,
    toSchedules,
    initializeTimeSlots,
  }
}
