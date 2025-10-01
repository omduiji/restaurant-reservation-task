import type { ApiResponse, Branch } from '../types'

const API_BASE_URL = '/api/v5'
const BEARER_TOKEN = import.meta.env.VITE_FOODICS_API_TOKEN

if (!BEARER_TOKEN) {
  throw new Error('VITE_FOODICS_API_TOKEN is not defined in environment variables')
}

// Base request function
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// API functions
export const getBranches = (): Promise<ApiResponse<Branch[]>> =>
  request<ApiResponse<Branch[]>>('/branches?include=sections.tables')

export const getBranch = (id: string): Promise<ApiResponse<Branch>> =>
  request<ApiResponse<Branch>>(`/branches/${id}?include=sections.tables`)

export const updateBranch = (id: string, data: Partial<Branch>): Promise<ApiResponse<Branch>> =>
  request<ApiResponse<Branch>>(`/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const enableReservations = (id: string): Promise<ApiResponse<Branch>> =>
  updateBranch(id, { accepts_reservations: true })

export const disableReservations = (id: string): Promise<ApiResponse<Branch>> =>
  updateBranch(id, { accepts_reservations: false })

export const disableAllReservations = async (branchIds: string[]): Promise<void> => {
  await Promise.all(branchIds.map((id) => disableReservations(id)))
}
