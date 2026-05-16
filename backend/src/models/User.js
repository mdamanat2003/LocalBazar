const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    unique: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'] },
  savedAddresses: [{
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Other' },
    addressLine: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } 
    }
  }],
  isVerified: { type: Boolean, default: false }, 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);