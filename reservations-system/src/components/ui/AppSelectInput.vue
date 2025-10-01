<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block mb-2 text-left font-bold" :class="labelClass">
      {{ label }}
    </label>

    <Field :name="fieldName" :rules="validationRules" v-slot="{ field, errors, meta }">
      <div
        v-if="multiple && Array.isArray(field.value) && field.value.length > 0"
        class="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div
          v-for="item in getSelectedItems(field.value)"
          :key="getOptionKey(item.value)"
          class="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <span class="text-gray-700">{{ item.label }}</span>
          <button
            type="button"
            @click="removeItem(item.value, field)"
            class="text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
            :disabled="disabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <select
        v-if="!multiple"
        v-bind="field"
        :id="id"
        :disabled="disabled"
        :class="selectClasses(meta.valid, errors)"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option v-for="option in options" :key="getOptionKey(option.value)" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <select
        v-else
        :id="id"
        :disabled="disabled"
        :class="selectClasses(meta.valid, errors)"
        @change="handleMultipleChange($event, field)"
        :value="''"
      >
        <option value="" disabled selected>
          {{ placeholder || 'Select an option...' }}
        </option>
        <option
          v-for="option in getAvailableOptions(field.value)"
          :key="getOptionKey(option.value)"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <span v-if="errors.length" class="text-red-500 block mt-1 text-sm">
        {{ errors[0] }}
      </span>

      <!-- Selected count for multiple select -->
      <div
        v-if="multiple && Array.isArray(field.value) && field.value.length > 0"
        class="text-sm text-gray-600 mt-1"
      >
        {{ field.value.length }} item(s) selected
      </div>
    </Field>
  </div>
</template>
<script setup lang="ts">
import { generateId } from '@/utils'
import { Field } from 'vee-validate'
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number | Array<string | number>
  label?: string
  placeholder?: string
  disabled?: boolean
  multiple?: boolean

  options?: Option[]

  validationName?: string
  validationRules?: string
  vid?: string

  labelClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  options: () => [],
  validationRules: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | Array<string | number> | undefined]
  change: [value: string | number | Array<string | number> | undefined]
}>()

const id = computed(() => `select-input-${generateId()}`)

const fieldName = computed(() => {
  return props.validationName || props.label || id.value
})

const getSelectedItems = (fieldValue: any) => {
  if (!props.multiple || !Array.isArray(fieldValue)) {
    return []
  }

  return fieldValue
    .map((val) => props.options.find((opt) => opt.value.toString() === val.toString()))
    .filter((item): item is Option => item !== undefined)
}

const getAvailableOptions = (fieldValue: any) => {
  if (!props.multiple || !Array.isArray(fieldValue) || fieldValue.length === 0) {
    return props.options
  }

  return props.options.filter(
    (option) => !fieldValue.some((val: any) => val.toString() === option.value.toString()),
  )
}

const selectClasses = (valid: boolean, errors: string[]) => {
  const baseClasses =
    'w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg border'
  const stateClasses = errors.length
    ? 'border-red-500 focus:ring-red-500'
    : valid
      ? 'border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:ring-primary-500'

  const sizeClasses = 'p-2'

  return [
    baseClasses,
    stateClasses,
    sizeClasses,
    props.inputClass,
    props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white',
  ].join(' ')
}

const getOptionKey = (value: string | number): string => {
  return `option-${value.toString()}`
}

const handleMultipleChange = (event: Event, field: any) => {
  const selectElement = event.target as HTMLSelectElement
  const selectedValue = selectElement.value

  if (!selectedValue || selectedValue === '') return

  const originalOption = props.options.find((opt) => opt.value.toString() === selectedValue)
  if (!originalOption) return

  const currentValue = Array.isArray(field.value) ? [...field.value] : []

  if (!currentValue.some((val) => val.toString() === originalOption.value.toString())) {
    currentValue.push(originalOption.value)
  }

  selectElement.value = ''

  field.onChange(currentValue)

  emit('update:modelValue', currentValue)
  emit('change', currentValue)
}

const removeItem = (value: string | number, field: any) => {
  if (!Array.isArray(field.value)) return

  const newValue = field.value.filter((val: any) => val.toString() !== value.toString())

  field.onChange(newValue)

  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>
