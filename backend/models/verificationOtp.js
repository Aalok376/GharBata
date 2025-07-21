import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires:120,
  },
})

export default mongoose.model('OtpStore',otpSchema)
