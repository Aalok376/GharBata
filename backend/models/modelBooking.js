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
  paymentMethod: {
    type: String,
    required: true,
  },
  refunded: {
    type: Boolean,
    default: false,
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
  scheduled_StartTime: {
    type: String,
    required: true,
  },
  scheduled_EndTime: {
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
      values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      message: 'Invalid booking status'
    },
    default: 'pending'
  },

  // Enhanced cancellation tracking
  cancelled_at: {
    type: Date
  },
  cancelled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellation_reason: {
    type: String,
    trim: true
  },

  // Track previous status before cancellation
  previous_status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
  },

  // Complete status history tracking
  status_history: [{
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changed_at: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      trim: true
    }
  }],

  // Issue reporting system
  issues: [{
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issue_type: {
      type: String,
      required: true,
      enum: [
        'technician_cancelled_after_acceptance',
        'last_minute_cancellation',
        'unprofessional_behavior',
        'no_show',
        'poor_communication',
        'other'
      ]
    },
    issue_description: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    reported_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending'
    },
    admin_notes: {
      type: String,
      trim: true
    },
    resolved_at: {
      type: Date
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

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
bookingSchema.index({ 'issues.status': 1 })
bookingSchema.index({ 'status_history.status': 1 })

// Pre-save middleware to update the updated_at field (removed status tracking from here)
bookingSchema.pre('save', function (next) {
  this.updated_at = new Date()
  next()
})

// Virtual for full address
bookingSchema.virtual('fullAddress').get(function () {
  let address = this.streetAddress
  if (this.apartMent) {
    address += `, ${this.apartMent}`
  }
  address += `, ${this.cityAddress}`
  return address
})

// Virtual for full customer name
bookingSchema.virtual('customerName').get(function () {
  return `${this.fname} ${this.lname}`
})

// Virtual for total service duration
bookingSchema.virtual('serviceDuration').get(function () {
  if (this.started_at && this.completed_at) {
    return Math.floor((this.completed_at - this.started_at) / (1000 * 60)) // in minutes
  }
  return null
})

// FIXED: Virtual to check if booking was accepted then cancelled
bookingSchema.virtual('wasAcceptedThenCancelled').get(function () {
  if (this.booking_status !== 'cancelled') return false

  // Check if previous status was confirmed
  if (this.previous_status && ['confirmed'].includes(this.previous_status)) {
    return true
  }

  // Also check status history for confirmed status
  const hasConfirmedStatus = this.status_history.some(entry =>
    ['confirmed'].includes(entry.status)
  )

  return hasConfirmedStatus
})

// Virtual to check if there are pending issues
bookingSchema.virtual('hasPendingIssues').get(function () {
  return this.issues.some(issue => issue.status === 'pending')
})

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
  return !['completed', 'cancelled'].includes(this.booking_status)
}

// FIXED: Method to check if client can raise an issue
bookingSchema.methods.canRaiseIssue = function (clientId) {
  // Only if booking is cancelled
  if (this.booking_status !== 'cancelled') return false

  // Cannot raise issue if client cancelled it themselves
  if (this.cancelled_by && this.cancelled_by.toString() === clientId.toString()) return false

  // Check if it was previously confirmed (accepted by technician)
  const wasConfirmed = this.status_history.some(entry => entry.status === 'confirmed')

  // Also check previous_status field
  const hadConfirmedStatus = this.previous_status === 'confirmed'

  return wasConfirmed || hadConfirmedStatus
}

// Method to add an issue
bookingSchema.methods.addIssue = function (issueData) {
  this.issues.push({
    reported_by: issueData.reported_by,
    issue_type: issueData.issue_type,
    issue_description: issueData.issue_description,
    severity: issueData.severity || 'medium'
  })
  return this.save()
}

// FIXED: Method to update booking status with proper history tracking
bookingSchema.methods.updateStatus = function (newStatus, changedBy, reason) {
  // Store previous status if changing to cancelled
  if (newStatus === 'cancelled' && this.booking_status !== 'cancelled') {
    this.previous_status = this.booking_status
  }

  // Update the booking status
  this.booking_status = newStatus

  // Add to status history
  this.status_history.push({
    status: newStatus,
    changed_by: changedBy,
    changed_at: new Date(),
    reason: reason
  })

  return this.save()
}

// Static method to find available time slots for a technician
bookingSchema.statics.findAvailableSlots = async function (technician_id, date) {
  const bookedSlots = await this.find({
    technician_id,
    scheduled_date: new Date(date),
    booking_status: { $in: ['pending', 'confirmed', 'in_progress'] }
  }).select('scheduled_time')

  return bookedSlots.map(booking => booking.scheduled_time)
}

// Static method to find bookings with pending issues
bookingSchema.statics.findBookingsWithPendingIssues = async function () {
  return this.find({
    'issues.status': 'pending'
  }).populate('client_id technician_id issues.reported_by')
}

// ADDED: Static method to find bookings that were accepted then cancelled by technician
bookingSchema.statics.findAcceptedThenCancelledBookings = async function (filters = {}) {
  return this.find({
    booking_status: 'cancelled',
    'status_history.status': 'confirmed', // Was confirmed at some point
    ...filters
  }).populate('client_id technician_id cancelled_by status_history.changed_by')
}

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true })
bookingSchema.set('toObject', { virtuals: true })

export default mongoose.model('Booking', bookingSchema)