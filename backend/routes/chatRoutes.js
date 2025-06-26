import express from 'express';
import Chat from '../models/chat.js';

const router = express.Router();

// Get chat by bookingId
router.get('/:bookingId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ bookingId: req.params.bookingId })
            .populate('participants', 'username')
            .populate('messages.senderId', 'username');
        res.json(chat || { messages: [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

export default router;
