import api from '../utils/api';

export const getChat = async (bookingId) => {
  try {
    const response = await api.get(`/api/chats/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Get chat failed:", error.response?.data || error.message);
    return { messages: [] };
  }
};

export const createChat = async (bookingId, participants) => {
  try {
    const response = await api.post('/api/chats', { bookingId, participants });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Create chat failed' };
  }
};

export const sendMessage = async (bookingId, senderId, message) => {
  try {
    const response = await api.post(`/api/chats/${bookingId}/message`, {
      senderId,
      message
    });
    return response.data;
  } catch (error) {
    console.error("Send message failed:", error.response?.data || error.message);
    return { success: false, message: 'Failed to send message' };
  }
};
