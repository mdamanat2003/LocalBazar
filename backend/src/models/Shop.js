const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: [true, 'Shop name is required'], trim: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String }, // URL to shop image
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: false }, // Shop can turn off receiving orders
  isApproved: { type: Boolean, default: false }, // Admin must approve before they go live
}, { timestamps: true });

// Crucial for geo-spatial queries (finding nearest shops)
shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);