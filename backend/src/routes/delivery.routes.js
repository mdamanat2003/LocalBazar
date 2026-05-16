const express = require('express');
const router = express.Router();
const { toggleAvailability, acceptOrder, getDashboard } = require('../controllers/delivery.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Apply protection to all routes below
router.use(protect);
router.use(authorize('delivery'));

// Rider Dashboard & Profile Actions
router.get('/dashboard', getDashboard);
router.patch('/availability', toggleAvailability);

// Order Actions
router.patch('/order/:orderId/accept', acceptOrder);

module.exports = router;