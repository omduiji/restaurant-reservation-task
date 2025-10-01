<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block mb-2 text-left font-bold" :class="labelClass">
      {{ label }}
    </label>

    <Field
      :name="fieldName"
      :rules="validationRules"
      v-slot="{ field, errors, meta, handleChange, handleBlur }"
    >
      <input
        v-if="type !== 'textarea'"
        v-bind="field"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :step="step"
        :min="min"
        :max="max"
        :class="inputClasses(meta.valid, errors)"
        @input="(e) => handleInput(e, handleChange)"
        @blur="(e) => handleBlurEvent(e, handleBlur)"
      />

      <textarea
        v-else
        v-bind="field"
        :id="id"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :class="inputClasses(meta.valid, errors)"
        @input="(e) => handleInput(e, handleChange)"
        @blur="(e) => handleBlurEvent(e, handleBlur)"
      />

      <span v-if="errors.length" class="text-red-500 block mt-1 text-sm">
        {{ errors[0] }}
      </span>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'number' | 'email' | 'password' | 'time' | 'textarea'
  label?: string
  placeholder?: string
  disabled?: boolean

  validationName?: string
  validationRules?: string
  vid?: string

  rows?: number

  step?: number
  min?: number
  max?: number

  labelClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  validationRules: '',
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  change: [value: string | number | undefined]
  blur: [event: Event]
  input: [event: Event]
}>()

const id = computed(() => `text-input-${Math.random().toString(36).substr(2, 9)}`)

const fieldName = computed(() => {
  return props.validationName || props.label || id.value
})

// Handle input events
const handleInput = (event: Event, veeValidateHandleChange: (e: Event) => void) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const value = props?.type === 'number' && target.value ? Number(target.value) : target.value

  // Call vee-validate's handleChange first
  veeValidateHandleChange(event)

  // Then emit our events
  emit('update:modelValue', value)
  emit('change', value)
  emit('input', event)
}

// Handle blur events
const handleBlurEvent = (event: Event, veeValidateHandleBlur: (e: Event) => void) => {
  veeValidateHandleBlur(event)
  emit('blur', event)
}

const inputClasses = (valid: boolean, errors: string[]) => {
  const baseClasses =
    'border p-2 w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg'
  const stateClasses = errors.length
    ? 'border-red-500 focus:ring-red-500'
    : valid
      ? 'border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:ring-primary-500'

  return [
    baseClasses,
    stateClasses,
    props.inputClass,
    props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white',
  ].join(' ')
}
</script>
