import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*', // Change to frontend URL in production
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join chat room (by booking ID)
        socket.on('join_room', (bookingId) => {
            socket.join(bookingId);
            console.log(`User joined room: ${bookingId}`);
        });

        // Receive message from frontend
        socket.on('send_message', async ({ bookingId, senderId, message }) => {
            const newMessage = {
                senderId,
                message,
                timestamp: new Date(),
            };

            // Save to DB
            const chat = await Chat.findOneAndUpdate(
                { bookingId },
                { $push: { messages: newMessage } },
                { new: true, upsert: true } // create if doesn't exist
            );
            
            // Emit message to all clients in the room
            io.to(bookingId).emit('receive_message', newMessage);
        });
        // Add event listeners here

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

// A lot of the chat functionality will be added here later
// For now, this is just a placeholder to initialize Socket.io
// and handle basic connection events.