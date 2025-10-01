// validation/config.ts
import { max, min, numeric, regex, required } from '@vee-validate/rules'
import { configure, defineRule } from 'vee-validate'

// Define default rules
defineRule('required', required)
defineRule('numeric', numeric)
defineRule('min', min)
defineRule('max', max)
defineRule('regex', regex)

// Generic time validation rules
defineRule('timeFormat', (value: string) => {
  if (!value) return true
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(value) || 'Time must be in HH:MM format (00:00 - 23:59)'
})

defineRule('timeOrder', (value: string, [otherTime, fieldType]: [string, string]) => {
  if (!value || !otherTime) return true

  const [hours1, minutes1] = value.split(':').map(Number)
  const [hours2, minutes2] = otherTime.split(':').map(Number)

  const total1 = hours1 * 60 + minutes1
  const total2 = hours2 * 60 + minutes2

  if (fieldType === 'end') {
    return total1 > total2 || 'End time must be after start time'
  } else {
    return total1 < total2 || 'Start time must be before end time'
  }
})

// Custom rules
defineRule('reasonableDuration', (value: number) => {
  if (!value) return true
  return (value >= 15 && value <= 480) || 'Duration must be between 15 and 480 minutes (8 hours)'
})

// defineRule('tablesSelected', (value: any[]) => {
//   return (value && value.length > 0) || 'At least one table must be selected'
// })

defineRule('maxSlots', (value: any[]) => {
  return (value && value.length <= 3) || 'Maximum 3 time slots per day'
})
defineRule('tablesSelected', (value: any) => {
  // Point 9: Tables field is optional - it's valid to have no tables selected
  // This allows branches to disable all table reservations if needed
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return true // Valid: No tables selected is allowed
  }

  // If there are tables selected, ensure it's a valid array
  if (!Array.isArray(value)) {
    return 'Invalid table selection format'
  }

  // Ensure all values are valid strings (table IDs)
  const allValid = value.every((id) => typeof id === 'string' && id.length > 0)
  if (!allValid) {
    return 'One or more table selections are invalid'
  }

  return true
})
// defineRule('reasonableDuration', (value: any) => {
//   const numValue = Number(value)

//   if (isNaN(numValue)) {
//     return 'Reservation duration must be a number'
//   }

//   if (numValue < 15) {
//     return 'Reservation duration must be at least 15 minutes'
//   }

//   if (numValue > 480) {
//     return 'Reservation duration cannot exceed 480 minutes (8 hours)'
//   }

//   // Should be in 15-minute increments
//   if (numValue % 15 !== 0) {
//     return 'Reservation duration must be in 15-minute increments'
//   }

//   return true
// })

// Custom field names for better error messages
const customFieldNames: Record<string, string> = {
  reservationDuration: 'Reservation duration',
  tables: 'Tables selection',
}

// Configuration
configure({
  generateMessage: (context) => {
    const { field, rule } = context

    // Use custom field names if available
    const fieldName = customFieldNames[field] || field

    const messages: Record<string, string> = {
      required: `${fieldName} is required`,
      numeric: `${fieldName} must be a number`,
      regex: `${fieldName} format is invalid`,
      timeFormat: `${fieldName} must be in HH:MM format`,
      timeOrder: `Start time must be before end time`,
      reasonableDuration: `${fieldName} must be between 15 and 480 minutes`,
      tablesSelected: `${fieldName} is required`,
      maxSlots: `${fieldName} cannot exceed 3 slots per day`,
    }

    return messages[rule!.name] || `${fieldName} is invalid`
  },
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: false,
  validateOnModelUpdate: true,
})
