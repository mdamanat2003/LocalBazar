const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicleDetails: {
    type: { type: String, enum: ['Bike', 'Scooter', 'Bicycle'] }
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // Updates live during delivery
  },
  isAvailable: { type: Boolean, default: false }, // Is the rider online?
  isApproved: { type: Boolean, default: false }, // Admin approval
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

// Crucial for live tracking and nearest rider assignment
deliverySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);