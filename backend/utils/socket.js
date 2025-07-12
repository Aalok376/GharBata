import { Server } from 'socket.io'

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join_room', (bookingId) => {
            socket.join(bookingId)
            console.log(`User joined room: ${bookingId}`)
        })

        socket.on('send_message', async ({ bookingId, senderId, message }) => {
            const newMessage = {
                senderId,
                message,
                timestamp: new Date(),
            }

            const chat = await Chat.findOneAndUpdate(
                { bookingId },
                { $push: { messages: newMessage } },
                { new: true, upsert: true }
            )
            
            io.to(bookingId).emit('receive_message', newMessage)
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

    return io
}