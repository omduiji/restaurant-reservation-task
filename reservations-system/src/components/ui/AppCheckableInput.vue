<template>
  <div class="mb-4">
    <div class="flex items-center" :class="containerClass">
      <Field
        :name="fieldName"
        :value="inputValue"
        :rules="validationRules"
        v-slot="{ field, errors }"
        :type="type"
      >
        <input
          v-bind="field"
          :id="id"
          :checked="isChecked"
          :type="type"
          :disabled="disabled"
          :class="[inputClass, errors.length ? 'border-red-500' : '']"
          @change="handleFieldChange($event, field.onChange)"
        />
      </Field>

      <label v-if="label" :for="id" class="cursor-pointer ml-2" :class="labelClass">
        {{ label }}
      </label>
    </div>

    <ErrorMessage :name="fieldName" class="text-red-500 block mt-1 text-sm" />
  </div>
</template>

<script setup lang="ts">
import { ErrorMessage, Field } from 'vee-validate'
import { computed } from 'vue'

interface Props {
  modelValue?: boolean | string | number | Array<string | number>
  type?: 'checkbox' | 'radio'
  label?: string
  disabled?: boolean
  value?: string | number
  validationName?: string
  validationRules?: string
  vid?: string
  labelClass?: string
  inputClass?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'checkbox',
  inputClass: 'accent-primary-100 h-6 w-6',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number | Array<string | number> | undefined]
  change: [value: boolean | string | number | Array<string | number> | undefined]
}>()

const id = computed(() => `checkable-input-${Math.random().toString(36).substr(2, 9)}`)

const fieldName = computed(() => {
  return props.validationName || props.label || id.value
})

const isChecked = computed(() => {
  if (props.type === 'radio') {
    return props.modelValue === props.value
  }

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value!)
  }

  return !!props.modelValue
})

const inputValue = computed(() => props.value)

const handleFieldChange = (event: Event, fieldOnChange?: (e: Event) => void) => {
  const target = event.target as HTMLInputElement

  if (fieldOnChange) {
    fieldOnChange(event)
  }

  if (props.type === 'radio') {
    emit('update:modelValue', props.value)
    emit('change', props.value)
  } else if (Array.isArray(props.modelValue)) {
    const currentValue = props.modelValue as Array<string | number>
    const newValue = currentValue.includes(props.value!)
      ? currentValue.filter((item) => item !== props.value)
      : [...currentValue, props.value!]
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', target.checked)
    emit('change', target.checked)
  }
}
</script>
