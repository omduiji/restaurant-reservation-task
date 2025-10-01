export interface Branch {
  id: string
  name: string
  reference: string
  accepts_reservations: boolean
  reservation_duration: number
  sections: Section[]
  reservation_times?: {
    [key in WeekDay]?: string[][]
  }
  opening_to?: string | null | undefined
  opening_from?: string | null | undefined
  number_of_reservable_tables?: number | null | undefined
}

export interface Section {
  id: string
  name: string
  tables: Table[]
}

export interface Table {
  id: string
  name: string
  accepts_reservations: boolean
}

export interface TimeSlot {
  id: string
  start_time: string // Format: "HH:MM"
  end_time: string // Format: "HH:MM"
}

export interface DaySchedule {
  day: WeekDay
  time_slots: TimeSlot[]
}

export type WeekDay =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'

export interface ReservationSettings {
  reservation_duration: number
  enabled_tables: string[] // Table IDs
  schedules: DaySchedule[]
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
