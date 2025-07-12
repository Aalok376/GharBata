import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  isActive: { type: Boolean, default: true }
})

export default mongoose.model('Chat', chatSchema)