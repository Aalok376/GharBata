import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profession: {
    type: String,
    required: true,
  },
  serviceStatus: {
    type: String,
    default: 'active',
  },
  serviceLocation: {
    type: String,
  },
  availability: {
    type: String,
  },
  currentLocation: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // ➕ New fields based on frontend requirements
  specialties: {
    type: [String], // Array of strings
    default: [],
  },
  experience: {
    type: String, // Could also be Number (e.g. years of experience)
    default: '0 years',
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: String,
    default: 'Not specified',
  },
  reviews: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String, // URL to profile image (can be stored in User alternatively)
    default: '',  // Optional default fallback avatar URL
  },

}, {
  timestamps: true,
});

export default mongoose.model('Technician', technicianSchema);
