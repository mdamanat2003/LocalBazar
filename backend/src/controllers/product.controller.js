const Product = require('../models/Product');
const Shop = require('../models/Shop');

// ==========================================
// 1. Add a New Product (For Shop Owners)
// ==========================================
exports.addProduct = async (req, res) => {
  try {
    // req.user.id comes from the JWT protect middleware!
    const shopId = req.user.id; 
    
    // We inject the shopId securely from the token, not from the request body
    const productData = { ...req.body, shopId };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. Get All Products for a Specific Shop (For Users)
// ==========================================
exports.getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Optional: You can filter by category if the user clicks "Snacks"
    const { category } = req.query;
    let query = { shopId, isActive: true };
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};