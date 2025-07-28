import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['client', 'technician', 'admin'],
    required: [true, 'User type is required'],
  },
  fname: {
    type: String,
    trim: true,
  },
  lname: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    // Required only if not OAuth user
    required: function () { return !this.oauthId },
  },
  oauthId: {
    type: String,
    unique: true,
    sparse: true, // allows null or undefined for local users
  },
  provider: {
    type: String,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

export default mongoose.model('User', UserSchema)
