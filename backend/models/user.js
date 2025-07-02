import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: [true, 'Email is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  userType: { type: String, enum: ['client', 'technician', 'admin'], required: [true, 'User type is required'] },
  fullName: { type: String, required: [true, 'Full name is required'] },
  phoneNumber: { type: String, required: [true, 'Phone number is required'] },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  isActive: { type: Boolean, default: true }
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: Date
},{ timestamps: true });

// Hashing password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);