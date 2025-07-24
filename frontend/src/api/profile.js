import api from '../utils/api'

const profileAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/technicians/')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' }
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(`/api/technicians/update`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData()
      formData.append('profileImage', imageFile)

      const response = await api.post('/api/technicians/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload profile image' }
    }
  }
}

export default profileAPI