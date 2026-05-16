const express = require('express');
const router = express.Router();
const { getAllShops, approveShop, getSystemMetrics } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Apply protection and strict 'admin' authorization to ALL routes in this file
router.use(protect);
router.use(authorize('admin'));

// Shop Management Routes
router.get('/shops', getAllShops);
router.patch('/shops/:id/approve', approveShop);

// Dashboard Metrics
router.get('/metrics', getSystemMetrics);

module.exports = router;