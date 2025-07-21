import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permission: String,
  lastLogin: Date
})

export default mongoose.model('Admin', adminSchema)