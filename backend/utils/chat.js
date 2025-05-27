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