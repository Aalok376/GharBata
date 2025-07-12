import express from 'express'
import {
  getChatByBookingId,
  createChat,
  addMessage
} from '../controllers/chatController.js'

const router = express.Router()

router.get('/:bookingId', getChatByBookingId)
router.post('/', createChat)
router.post('/:bookingId/message', addMessage)

export default router