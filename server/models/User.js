const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: String,
  shopLocation: String,
  currency: { type: String, default: 'TZS' },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
