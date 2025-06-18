import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profession: String,
  serviceStatus: String,
  serviceLocation: String,
  availability: String,
  currentLocation: String,
  rating: Number,
  tasksCompleted: Number,
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model('Technician', technicianSchema);