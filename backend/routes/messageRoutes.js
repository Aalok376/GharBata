import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import { CreateMessage,GetMessage,editMessage,getConversatons,createConversation,removeMessage } from '../controllers/messages.js'


const router = express.Router()


router.post('/sendMessage', verifyToken, CreateMessage)//
router.get('/getMessage/:conversationId', verifyToken, GetMessage)//
router.delete('/removeMessage/:conversationId/:messageId', verifyToken, removeMessage)
router.put('/editMessage', verifyToken, editMessage)
router.get('/getConversations', verifyToken, getConversatons)//
router.post('/createConversations', verifyToken, createConversation)//


export default router