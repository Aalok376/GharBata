import mongoose from 'mongoose';

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected to: ', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process if DB fails to connect
  }
};

export default connectDB; 