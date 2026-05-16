const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', default: null },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // You'll create Product.js later
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    addressLine: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },
  
  status: { 
    type: String, 
    enum: [
      'Pending',        
      'Accepted',       
      'Assigning',      
      'PickedUp',       
      'OutForDelivery', 
      'Delivered',      
      'Cancelled'
    ], 
    default: 'Pending' 
  },
  
  timestamps: {
    placedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);