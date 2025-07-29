import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Technician',
    required: true
  },

  fname: {
    type: String,
    required: true,
    trim: true,
  },
  lname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true,
  },
  apartMent: {
    type: String,
    trim: true,
  },
  cityAddress: {
    type: String,
    required: true,
    trim: true,
  },
  service: {
    type: String,
    required: true
  },
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    trim: true
  },
  scheduled_date: {
    type: Date,
    required: true
  },
  scheduled_time: {
    type: String,
    required: true,
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  contactPreference: {
    type: String,
    trim: true,
    enum: ['phone', 'email', 'text']
  },
  latitude: {
    type: String,
    required: true,
    trim: true,
  },
  longitude: {
    type: String,
    required: true,
    trim: true,
  },
  final_price: {
    type: Number,
    required: true,
    min: [0, 'Final price cannot be negative']
  },
  booking_status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
      message: 'Invalid booking status'
    },
    default: 'pending'
  },
  cancelled_at: {
    type: Date
  },
  cancelled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})
export default mongoose.model('Booking', bookingSchema)
