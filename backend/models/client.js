import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  address: String,
  servicePreferences: [String]
});

module.exports = mongoose.model('Client', clientSchema);