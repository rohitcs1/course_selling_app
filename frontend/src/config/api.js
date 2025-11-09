// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  CREATE_ORDER: `${API_BASE_URL}/api/create-order`,
  VERIFY_PAYMENT: `${API_BASE_URL}/api/verify-payment`,
  GET_COURSES: `${API_BASE_URL}/api/courses`,
  HEALTH: `${API_BASE_URL}/api/health`
}

export default API_BASE_URL

