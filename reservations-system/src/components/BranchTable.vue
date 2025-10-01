<template>
  <div class="table-container">
    <!-- Mobile View -->
    <div class="mobile-table md:hidden">
      <div
        v-for="(item, index) in props.data"
        :key="getKey(item, index)"
        class="mobile-row border-b border-gray-200 py-4"
        :class="props.rowClass?.(item)"
        @click="handleRowClick(item, $event)"
      >
        <div class="flex flex-col gap-2">
          <div
            v-for="column in props.columns"
            :key="column.key"
            class="flex justify-between items-start"
          >
            <span class="font-medium text-gray-600 text-sm"> {{ column.label }}: </span>
            <div class="text-right flex-1 ml-2">
              <slot
                :name="`mobile-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
              >
                <span class="text-gray-900">
                  {{ getNestedValue(item, column.key) }}
                </span>
              </slot>
            </div>
          </div>

          <div
            v-if="props.actions && props.actions.length > 0"
            class="flex gap-2 pt-2 mt-2 border-t border-gray-100"
          >
            <button
              v-for="action in props.actions"
              :key="action.label"
              :class="action.class"
              type="button"
              class="px-3 py-1 text-sm rounded-lg transition-colors"
              @click.stop="handleActionClick(action, item, $event)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="desktop-table hidden md:block overflow-x-auto">
      <table class="w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th
              v-for="column in props.columns"
              :key="column.key"
              class="px-6 py-4 text-left text-sm font-semibold text-gray-900"
              :class="column.headerClass"
            >
              {{ column.label }}
            </th>
            <th
              v-if="props.actions && props.actions.length > 0"
              class="px-6 py-4 text-right text-sm font-semibold text-gray-900"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in props.data"
            :key="getKey(item, index)"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="props.rowClass?.(item)"
            @click="handleRowClick(item, $event)"
          >
            <td
              v-for="column in props.columns"
              :key="column.key"
              class="px-6 py-4 text-sm text-gray-900"
              :class="column.cellClass"
            >
              <slot :name="column.key" :item="item" :value="getNestedValue(item, column.key)">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td
              v-if="props.actions && props.actions.length > 0"
              class="px-6 py-4 text-right space-x-2"
            >
              <button
                v-for="action in props.actions"
                :key="action.label"
                :class="action.class"
                type="button"
                class="px-4 py-2 rounded-lg text-sm transition-colors"
                @click.stop="handleActionClick(action, item, $event)"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="props.data.length === 0" class="text-center py-12 text-gray-500">
      <slot name="empty"> No data available </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BaseItem extends Record<string, unknown> {
  id?: string | number
}

export interface TableColumn {
  key: string
  label: string
  headerClass?: string
  cellClass?: string
}

export interface TableAction<T = BaseItem> {
  label: string
  class: string
  handler: (item: T, event?: Event) => void | Promise<void>
}

export interface TableProps<T = BaseItem> {
  data: T[]
  columns: TableColumn[]
  actions?: TableAction<T>[]
  rowClass?: (item: T) => string
  rowClick?: (item: T, event?: Event) => void
  keyField?: string
}

const props = defineProps<TableProps>()
console.log(props)

const emit = defineEmits<{
  rowClick: [item: BaseItem]
  actionClick: [action: TableAction<BaseItem>, item: BaseItem]
}>()

const getKey = (item: BaseItem, index: number): string | number => {
  const key = props.keyField && props.keyField in item ? item[props.keyField] : undefined
  const keyValue = key as string | number | undefined

  if (keyValue !== undefined && keyValue !== null) {
    return keyValue
  }
  return index
}

const getNestedValue = (obj: BaseItem, path: string): unknown => {
  if (typeof obj !== 'object' || obj === null) return ''

  return path.split('.').reduce((current: unknown, key: string) => {
    if (
      typeof current === 'object' &&
      current !== null &&
      key in (current as Record<string, unknown>)
    ) {
      return (current as Record<string, unknown>)[key]
    }
    return ''
  }, obj)
}

const handleRowClick = (item: BaseItem, event: Event): void => {
  event.stopPropagation()
  event.preventDefault()

  if (props.rowClick) {
    props.rowClick(item, event)
  }
  emit('rowClick', item)
}

const handleActionClick = (action: TableAction<BaseItem>, item: BaseItem, event: Event): void => {
  event.stopPropagation()
  event.preventDefault()

  action.handler(item, event)
  emit('actionClick', action, item)
}
</script>

<style scoped>
.table-container {
  @apply w-full;
}

.mobile-row {
  @apply bg-white px-4;
}

.desktop-table table {
  @apply min-w-full border-collapse;
}

.desktop-table {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.desktop-table::-webkit-scrollbar {
  height: 6px;
}

.desktop-table::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.desktop-table::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded hover:bg-gray-400;
}
</style>
