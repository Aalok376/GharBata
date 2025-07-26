import mongoose from "mongoose"

const availabilitySchema = new mongoose.Schema({
  available: Boolean,
  startTime: String,
  endTime: String
}, { _id: false })

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
  rating: {
    type: Map,
    of: new mongoose.Schema({
      average: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      sumRatings: { type: Number, default: 0 }
    }, { _id: false }),
    default: {}
  },
  tasksCompleted: { type: Number, default: 0 },
  reviews: {
  type: Map,
  of: [
    new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      profession: String,
      reviewText: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }, { _id: false })
  ],
  default: {}
}
})

export default mongoose.model('Technician', technicianSchema)