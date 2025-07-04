import axios from 'axios'

const ip = "http://localhost:5000"

const api = axios.create({
  baseURL:  ip,
  withCredentials: true, // optional, needed if you're using cookies
})

export default api