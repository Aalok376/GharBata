import http from 'http'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { initializeSocket } from './utils/socket.js' 
import app from './app.js'

dotenv.config() 

const PORT = process.env.PORT
const server = http.createServer(app) 

initializeSocket(server)

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log("Error connecting to DB", err))

server.listen(PORT, () => {
  console.log(`GharBata backend server listening on port ${PORT}`)
})
