import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'; 
import connectDB from './config/db.js';// Import MongoDB connection
import { initializeSocket } from './utils/socket.js'; // Import Socket.io utilities

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create Express app
const PORT = process.env.PORT;
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  // credentials: true, 
})); // Allow credentials for cookies, authorization headers, etc.
app.use(express.json()); // Parse JSON bodies

// Basic health check route
app.get('/', (req, res) => {
  res.send('GharBata backend server is running.');
});


connectDB(); // MongoDB Connection

// --- Chat Features ---
initializeSocket(server); // Initialize Socket.io for chat features

// --- Placeholder for API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/bookings', bookingRoutes); 
// Add routes as project grows

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`GharBata backend server listening on port ${PORT}`);
});
