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
    data: Buffer,
    contentType: String
  },
  contactNumber: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})
export default mongoose.model('Client', clientSchema)

