import { Server } from 'socket.io'
import Chat from '../models/chat.js'

// Store connected users
const connectedUsers = new Map()

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        },
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Handle user authentication and store connection
        socket.on('authenticate', (userId) => {
            connectedUsers.set(userId, {
                socketId: socket.id,
                lastSeen: new Date(),
                isOnline: true
            })

            // Notify others about online status
            socket.broadcast.emit('user_online', userId)
            console.log(`User ${userId} authenticated and online`)
        })

        // Join booking room
        socket.on('join_room', (bookingId) => {
            socket.join(bookingId)
            console.log(`User ${socket.id} joined room: ${bookingId}`)
        })

        // Handle sending messages
        socket.on('send_message', async ({ bookingId, senderId, message }) => {
            try {
                const newMessage = {
                    senderId,
                    message,
                    timestamp: new Date(),
                }

                // Find existing chat
                let chat = await Chat.findOne({ bookingId })

                if (!chat) {
                    console.log(`Chat not found for booking: ${bookingId}`)
                    socket.emit('error', { message: 'Chat not found' })
                    return
                }

                // Add message to chat
                chat.messages.push(newMessage)
                await chat.save()

                // Get the populated message
                const populatedChat = await Chat.findById(chat._id)
                    .populate('messages.senderId', 'username fname lname')

                const populatedMessage = populatedChat.messages[populatedChat.messages.length - 1]

                // Emit to all users in the room
                io.to(bookingId).emit('receive_message', populatedMessage)

                // Update last activity
                if (connectedUsers.has(senderId)) {
                    connectedUsers.get(senderId).lastSeen = new Date()
                }

            } catch (error) {
                console.error('Error sending message:', error)
                socket.emit('error', { message: 'Failed to send message' })
            }
        })

        // Handle typing indicators
        socket.on('typing_start', ({ bookingId, userId }) => {
            socket.to(bookingId).emit('user_typing', { userId, isTyping: true })
        })

        socket.on('typing_stop', ({ bookingId, userId }) => {
            socket.to(bookingId).emit('user_typing', { userId, isTyping: false })
        })

        // Get online users
        socket.on('get_online_users', () => {
            const onlineUsers = Array.from(connectedUsers.entries())
                .filter(([userId, data]) => data.isOnline)
                .map(([userId, data]) => userId)

            socket.emit('online_users', onlineUsers)
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)

            // Find and update user status
            let disconnectedUserId = null
            for (const [userId, userData] of connectedUsers.entries()) {
                if (userData.socketId === socket.id) {
                    userData.isOnline = false
                    userData.lastSeen = new Date()
                    disconnectedUserId = userId
                    break
                }
            }

            if (disconnectedUserId) {
                // Notify others about offline status
                socket.broadcast.emit('user_offline', disconnectedUserId)
            }
        })

        // Clean up old connections periodically
        setInterval(() => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            for (const [userId, userData] of connectedUsers.entries()) {
                if (!userData.isOnline && userData.lastSeen < fiveMinutesAgo) {
                    connectedUsers.delete(userId)
                }
            }
        }, 60000) // Check every minute
    })

    return io
}

// Helper function to check if user is online
export const isUserOnline = (userId) => {
    const userData = connectedUsers.get(userId)
    return userData && userData.isOnline
}

// Helper function to get user's last seen
export const getUserLastSeen = (userId) => {
    const userData = connectedUsers.get(userId)
    return userData ? userData.lastSeen : null
}