import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  address: String,
  servicePreferences: [String]
});

export default mongoose.model('Client', clientSchema);