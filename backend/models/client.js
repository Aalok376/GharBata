import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  address: {
    type: String,
    trim: true
  },
  profilePic: {
    type: String,
    default: null
  },
  contactNumber: {
    type: String,
    default: null
  },
  khaltiNumber: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
})
export default mongoose.model('Client', clientSchema)

