import axios from 'axios';

const ip = "http://localhost:5000"

const api = axios.create({
  baseURL:  ip,
  // withCredentials: true, // optional, needed if you're using cookies
});

export const status = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error("Status check failed:", error.response?.data || error.message);
    return { success: false, message: "Server is down" };
  }
};

export const login = async (email, password) => {
  try {
    console.log("Logging in with email:", email);
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    // save token or user data
    const { token, user } = response.data;
    localStorage.setItem('token', token);

    return { success: true, user };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const register = async (formData) => {
  try {
    console.log("Registering user with data:", formData);
    const response = await api.post('/api/auth/register', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};