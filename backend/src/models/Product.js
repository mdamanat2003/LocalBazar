const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Selling price is required'] 
  },
  mrp: { 
    type: Number, 
    // Useful for showing "Discounted" prices (e.g., MRP 100, Price 80)
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: ['Groceries', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Other'],
    default: 'Other'
  },
  stockQuantity: { 
    type: Number, 
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  image: { 
    type: String, // URL to the product image
    default: 'https://via.placeholder.com/150' 
  },
  isActive: { 
    type: Boolean, 
    default: true // Shop can disable a product if it's temporarily unavailable
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);