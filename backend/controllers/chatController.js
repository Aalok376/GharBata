import Chat from '../models/chat.js';

// Get chat by bookingId
export const getChatByBookingId = async (req, res) => {
  try {
    const chat = await Chat.findOne({ bookingId: req.params.bookingId })
      .populate('participants', 'username')
      .populate('messages.senderId', 'username');

    res.json(chat || { messages: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

// Create a new chat
export const createChat = async (req, res) => {
  const { bookingId, participants } = req.body;
  try {
    const existing = await Chat.findOne({ bookingId });
    if (existing) return res.status(400).json({ error: 'Chat already exists' });

    const chat = new Chat({ bookingId, participants });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// Add a message to a chat
export const addMessage = async (req, res) => {
  const { senderId, message } = req.body;
  try {
    const chat = await Chat.findOne({ bookingId: req.params.bookingId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push({ senderId, message });
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username')
      .populate('messages.senderId', 'username');

    res.status(200).json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
