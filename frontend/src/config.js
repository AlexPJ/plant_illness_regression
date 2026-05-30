// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  predict: `${API_BASE_URL}/predict`
}
