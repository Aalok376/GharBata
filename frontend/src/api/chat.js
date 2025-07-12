import api from '../utils/api'

export const getChat = async (bookingId) => {
  try {
    const response = await api.get(`/api/chats/${bookingId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch chat')
  }
}

export const createChat = async (bookingId, participants) => {
  try {
    const response = await api.post('/api/chats', { bookingId, participants })
    return response.data
  } catch (error) {
    throw error.response?.data || new Error('Failed to send message')
  }
}

export const sendMessage = async (bookingId, senderId, message) => {
  try {
    const response = await api.post(`/api/chats/${bookingId}/message`, {
      senderId,
      message
    })
    return response.data
  } catch (error) {
    throw error.response?.data || new Error('Failed to send message');
  }
}

const chatService = {
  getChat,
  createChat,
  sendMessage,
}

export default chatService