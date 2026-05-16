const express = require('express');
const router = express.Router();
const { addProduct, getShopProducts } = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Route for Shop: Add a product (Requires Shop JWT)
router.post('/add', protect, authorize('shop'), addProduct);

// Route for User: Get products for a shop (Public or requires User JWT)
router.get('/shop/:shopId', protect, getShopProducts);

module.exports = router;