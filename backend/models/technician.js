import mongoose from "mongoose"

const availabilitySchema = new mongoose.Schema({
  available: Boolean,
  startTime: String,
  endTime: String
}, { _id: false })

const banHistorySchema = new mongoose.Schema({
  banned_at: { type: Date, required: true },
  banned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  related_issue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  ban_end_date: { type: Date },
  severity: { 
    type: String, 
    enum: ['temporary', 'permanent'], 
    default: 'permanent' 
  }
}, { _id: true })

const warningHistorySchema = new mongoose.Schema({
  warned_at: { type: Date, required: true },
  warned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  warning_message: { type: String, required: true },
  related_issue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { _id: true })

const technicianSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  professions: [String],
  serviceLocation: String,
  availability: {
    monday: availabilitySchema,
    tuesday: availabilitySchema,
    wednesday: availabilitySchema,
    thursday: availabilitySchema,
    friday: availabilitySchema,
    saturday: availabilitySchema,
    sunday: availabilitySchema
  },
  currentLocation: String,
  specialties: [String],
  experience: String,
  hourlyRate: {
    type: Map,
    of: Number,
    default: {}
  },
  responseTime: String,
  profilePic: { type: String, default: null },
  
  // Ban-related fields
  is_banned: { type: Boolean, default: false },
  ban_reason: { type: String },
  banned_at: { type: Date },
  banned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ban_end_date: { type: Date },
  ban_severity: { 
    type: String, 
    enum: ['temporary', 'permanent'], 
    default: 'permanent' 
  },
  unbanned_at: { type: Date },
  unbanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unban_reason: { type: String },
  ban_history: [banHistorySchema],

  warning_history: [warningHistorySchema]
})

export default mongoose.model('Technician', technicianSchema)