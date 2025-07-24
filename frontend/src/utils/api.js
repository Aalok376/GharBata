import axios from 'axios'

const BASE_URL = "http://localhost:5000"

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page if unauthorized
      console.error("Unauthorized access - redirecting to login");
      window.location.href = '/client_login'
    }
    return Promise.reject(error)
  }
)

export default api;