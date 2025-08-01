import mongoose from "mongoose"

const socketSchema = new mongoose.Schema({
    userId: String,
    socketId: String
})

export const SocketModel = mongoose.model('Socket', socketSchema)
