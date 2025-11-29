const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  airtableUserId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenExpiresAt: { type: Date, required: true },
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);