// Example: src/routes/shop.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getShopDashboard, updateInventory, getNearbyShops } = require('../controllers/shop.controller');

// 1. Nearby shops should be defined before the dynamic '/:id' route
router.get('/nearby', protect, authorize('user'), getNearbyShops);

// 2. Any logged-in user can view a shop
router.get('/:id', protect, getShopDashboard);

// 3. ONLY a logged-in user with the 'shop' role can update inventory
router.put('/inventory', protect, authorize('shop'), updateInventory);

// 4. You can even allow multiple roles (e.g., Shop owner OR Admin) - placeholder
router.delete('/delete-product', protect, authorize('shop', 'admin'), updateInventory);



module.exports = router;