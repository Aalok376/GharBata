import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import connectDB from './utils/db.js';// Import MongoDB connection
import { initializeSocket } from './utils/chat.js'; // Import Socket.io utilities


dotenv.config(); // Load environment variables from .env file

// Create Express app
const app = express();
// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Basic health check route
app.get('/', (req, res) => {
  res.send('GharBata backend server is running.');
});

// --- Create HTTP server
const server = http.createServer(app);

// --- MongoDB Connection ---
connectDB();

// --- Chat Features ---
initializeSocket(server); // Initialize Socket.io for chat features


// --- Placeholder for API routes ---
app.use('/api/auth', authRoutes);
// Add routes as project grows

// --- Start Server ---
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`GharBata backend server listening on port ${PORT}`);
});
