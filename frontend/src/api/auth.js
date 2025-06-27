import api from '../utils/api';

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
    const response = await api.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const register = async (formData) => {
  try {
    const response = await api.post('/api/auth/register', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};
