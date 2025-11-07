import axios from 'axios'

const baseURL = (() => {
  const url = import.meta?.env?.VITE_API_URL
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url.trim().replace(/\/$/, '')
  }
  return '/api'
})()

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
