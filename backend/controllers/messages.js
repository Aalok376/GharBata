import Conversation from '../models/message.js'
import Technician from '../models/technician.js'
import Client from '../models/client.js'
import { SocketModel } from '../models/sockets.js'

import { getIo } from '../sockett.js'

const getSocketIdByUserId = async (userId) => {
    try {
        const userSocket = await SocketModel.findOne({ userId })
        return userSocket ? userSocket.socketId : null
    } catch (error) {
        console.error("Error fetching socket ID:", error)
        return null
    }
}

export const getConversatons = async (req, res) => {
    try {
        const userId = req.user.id

        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
            .populate('participants', 'fname lname userType')
            .sort({ updatedAt: -1 })

        const formattedConversations = await Promise.all(conversations.map(async convo => {
            const otherParticipant = convo.participants.find(p => p._id.toString() !== userId)
            let profilePic = null

            if (otherParticipant.userType === 'client') {
                const clientProfile = await Client.findOne({ client_id: otherParticipant._id })
                profilePic = clientProfile?.profilePic || null
            } else if (otherParticipant.userType === 'technician') {
                const technicianProfile = await Technician.findOne({ user: otherParticipant._id })
                profilePic = technicianProfile?.profilePic || null
            }

            return {
                _id: convo._id,
                otherParticipant: {
                    _id: otherParticipant._id,
                    fname: otherParticipant.fname,
                    lname: otherParticipant.lname,
                    profilePic
                },
                updatedAt: convo.updatedAt
            }
        }))

        if (!formattedConversations.length) {
            return res.status(404).json({ message: "No conversations found" })
        }

        res.status(200).json(formattedConversations)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: "Failed to fetch conversation" })
    }
}

export const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body
        const senderId = req.user.id

        let existingConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                msg: 'Conversation already exists'
            })
        }

        const conversation = new Conversation({ participants: [senderId, receiverId], messages: [] })

        await conversation.save()

        res.status(200).json({ success: true, msg: 'Conversation created successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: "Failed to create conversation" })
    }
}

export const CreateMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body

        const senderId = req.user.id

        let MessageStatus = 'sent'

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = new Conversation({ participants: [senderId, receiverId], messages: [] })
        }

        const newMessage = { senderId, receiverId, message }
        conversation.messages.push(newMessage)
        await conversation.save()

        const socketId = await getSocketIdByUserId(receiverId)

        const messageId = conversation.messages[conversation.messages.length - 1]._id

        if (socketId) {
            getIo().to(socketId).emit("textMessage", {
                newMessage,
                messageId,
                conversationId: conversation._id,
                socketId
            })
            console.log(`Message sent to user ${receiverId} with socket ${socketId}`)

            MessageStatus = 'delivered'
        } else {
            console.log(`User ${receiverId} is offline. Message not sent via socket.`)
        }

        const messageIndex = conversation.messages.findIndex(msg => msg._id.toString() === messageId.toString())
        if (messageIndex !== -1) {
            conversation.messages[messageIndex].status = MessageStatus
            await conversation.save()
        }

        res.status(200).json({ success: true, newMessage, messageId, MessageStatus })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to send message" })
    }
}

export const GetMessage = async (req, res) => {
    try {
        const { conversationId } = req.params
        const userId = req.user.id

        const conversation = await Conversation.findById(conversationId)
            .populate('participants', 'fname lname')
            .lean()

        if (!conversation) {
            return res.status(200).json([])
        }

        const participantsWithProfilePic = await Promise.all(conversation.participants.map(async (participant) => {
            let profilePic = null

            const client = await Client.findOne({ client_id: participant._id }).lean()
            if (client?.profilePic) {
                profilePic = client.profilePic
            } else {
                const technician = await Technician.findOne({ user: participant._id }).lean()
                if (technician?.profilePic) {
                    profilePic = technician.profilePic
                }
            }

            return {
                ...participant,
                profilePic
            }
        }))

        conversation.participants = participantsWithProfilePic

        let updated = false
        conversation.messages.forEach(message => {
            if (message.receiverId.toString() === userId && message.status !== "read") {
                message.status = "read"
                updated = true
            }
        })

        if (updated) {
            await Conversation.findByIdAndUpdate(conversationId, { messages: conversation.messages })
        }

        res.status(200).json({ conversation, userId })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch messages" })
    }
}

export const removeMessage = async (req, res) => {
    try {
        const { conversationId, messageId } = req.params

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        const messageIndex = conversation.messages.findIndex(msg => msg._id.toString() === messageId)
        if (messageIndex === -1) {
            return res.status(404).json({ error: "Message not found" })
        }

        const { receiverId } = conversation.messages[messageIndex]

        conversation.messages = conversation.messages.filter(msg => msg._id.toString() !== messageId)
        await conversation.save()

        const socketId = await getSocketIdByUserId(receiverId)
        if (socketId) {
            getIo().to(socketId).emit("detetedMessage", {
                messageId,
                conversationId,
                message: 'removed'
            })
            console.log(`Message sent to user ${receiverId} with socket ${socketId}`)
        } else {
            console.log(`User ${receiverId} is offline. Message not sent via socket.`)
        }

        res.status(200).json({ success: true, message: "Message deleted" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete message" })
    }
}

export const editMessage = async (req, res) => {
    try {
        const { conversationId, messageId, newMessageText } = req.body

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        const messageIndex = conversation.messages.findIndex(msg => msg._id.toString() === messageId)
        if (messageIndex === -1) {
            return res.status(404).json({ error: "Message not found" })
        }

        const { receiverId } = conversation.messages[messageIndex]

        conversation.messages[messageIndex].message = newMessageText
        await conversation.save()

        const socketId = await getSocketIdByUserId(receiverId)
        if (socketId) {
            getIo().to(socketId).emit("editedMessage", {
                messageId,
                conversationId,
                newMessageText,
                message: 'editedMessage'
            })
            console.log(`Message sent to user ${receiverId} with socket ${socketId}`)
        } else {
            console.log(`User ${receiverId} is offline. Message not sent via socket.`)
        }

        res.status(200).json({ success: true, message: "Message updated" })
    } catch (error) {
        res.status(500).json({ error: "Failed to edit message" })
    }

}
