import { generateId } from '@/utils'
import type { TimeSlot, WeekDay } from '../types'
import type { FormValues } from './useReservationForm'

export function useTimeSlotManagement() {
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
          { id: generateId(), start_time: '09:00', end_time: '17:00' },
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

  return {
    getTimeSlotsForDay,
    handleTimeSlotUpdate,
    addTimeSlot,
    removeTimeSlot,
    applySaturdaySchedule,
  }
}
