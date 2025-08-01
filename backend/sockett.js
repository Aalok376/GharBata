import { Server } from "socket.io"
import cookie from "cookie"
import { SocketModel } from "./models/sockets.js"

let io

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        },
    })

    io.on('connection', async (socket) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "")
        const UserId = cookies.UserId || socket.handshake.auth.token

        if (!UserId) {
            console.log('User ID missing, rejecting connection:', socket.id)
            socket.disconnect()
            return
        }

        console.log('A user connected:', socket.id)
        
        // Clean up any existing socket records for this user first
        await SocketModel.deleteMany({ userId: UserId })
        
        const newSocket = new SocketModel({
            userId: UserId,
            socketId: socket.id,
        })
        await newSocket.save()

        socket.on('disconnect', async () => {
            console.log('A user disconnected:', socket.id)
            await SocketModel.deleteOne({ socketId: socket.id }).then(() => {
                console.log('Socket ID removed')
            })
        })
    })
}

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO is not initialized! Call initializeSocket(server) first.")
    }
    return io
}