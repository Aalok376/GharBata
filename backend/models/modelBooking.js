import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
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
  },

  // Additional fields for enhanced functionality
  confirmed_at: {
    type: Date
  },
  started_at: {
    type: Date
  },
  completed_at: {
    type: Date
  },
  completion_notes: {
    type: String,
    trim: true
  },
  rejection_reason: {
    type: String,
    trim: true
  },
  cancellation_reason: {
    type: String,
    trim: true
  },
  
  // Reschedule history tracking
  schedule_history: [{
    old_date: Date,
    old_time: String,
    new_date: Date,
    new_time: String,
    rescheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduled_at: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],

  // Service rating and feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
  feedback_date: {
    type: Date
  }
})

// Indexes for better query performance
bookingSchema.index({ client_id: 1, booking_status: 1 })
bookingSchema.index({ technician_id: 1, scheduled_date: 1, scheduled_time: 1 })
bookingSchema.index({ booking_status: 1 })
bookingSchema.index({ scheduled_date: 1 })
bookingSchema.index({ created_at: -1 })

// Pre-save middleware to update the updated_at field
bookingSchema.pre('save', function(next) {
  this.updated_at = new Date()
  next()
})

// Virtual for full address
bookingSchema.virtual('fullAddress').get(function() {
  let address = this.streetAddress
  if (this.apartMent) {
    address += `, ${this.apartMent}`
  }
  address += `, ${this.cityAddress}`
  return address
})

// Virtual for full customer name
bookingSchema.virtual('customerName').get(function() {
  return `${this.fname} ${this.lname}`
})

// Virtual for total service duration
bookingSchema.virtual('serviceDuration').get(function() {
  if (this.started_at && this.completed_at) {
    return Math.floor((this.completed_at - this.started_at) / (1000 * 60)) // in minutes
  }
  return null
})

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return !['completed', 'cancelled'].includes(this.booking_status)
}

// Method to check if booking can be rescheduled
bookingSchema.methods.canBeRescheduled = function() {
  return !['completed', 'cancelled', 'in_progress'].includes(this.booking_status)
}

// Static method to find available time slots for a technician
bookingSchema.statics.findAvailableSlots = async function(technician_id, date) {
  const bookedSlots = await this.find({
    technician_id,
    scheduled_date: new Date(date),
    booking_status: { $in: ['pending', 'confirmed', 'in_progress'] }
  }).select('scheduled_time')
  
  return bookedSlots.map(booking => booking.scheduled_time)
}

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true })
bookingSchema.set('toObject', { virtuals: true })

export default mongoose.model('Booking', bookingSchema)