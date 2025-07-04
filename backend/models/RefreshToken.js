const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  RefreshToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires:7*86400,
  },
})

export default mongoose.model('TokenStore',tokenSchema)