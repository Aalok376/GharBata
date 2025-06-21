import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  booking_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  technician_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  service_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  scheduled_date: { 
    type: Date, 
    required: true 
  },
  scheduled_time: { 
    type: String, 
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  booking_service_price: { 
    type: Number, 
    required: true, 
    min: [0, 'Booking service price cannot be negative'] 
  },
  negotiated_price: { 
    type: Number, 
    min: [0, 'Negotiated price cannot be negative'],
    default: null
  },
  final_price: { 
    type: Number, 
    required: true, 
    min: [0, 'Final price cannot be negative'] 
  },
  booking_status: { 
    type: String, 
    required: true,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
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
}, {
  timestamps: true
});
export default mongoose.model('Booking',bookingSchema);
