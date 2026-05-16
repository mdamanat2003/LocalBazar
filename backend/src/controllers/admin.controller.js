const Shop = require('../models/Shop');
const User = require('../models/User');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');

// ==========================================
// 1. Get All Shops (With optional filtering)
// ==========================================
exports.getAllShops = async (req, res) => {
  try {
    // If admin requests ?status=pending, only show unapproved shops
    const { status } = req.query;
    let query = {};
    
    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }

    const shops = await Shop.find(query).select('-password'); // Exclude passwords

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. Approve or Reject a Shop
// ==========================================
exports.approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isApproved must be a boolean (true/false)' });
    }

    const shop = await Shop.findByIdAndUpdate(
      id,
      { 
        isApproved, 
        isActive: isApproved // Automatically make the shop active if approved
      },
      { new: true } // Return the updated document
    ).select('-password');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    res.status(200).json({
      success: true,
      message: isApproved ? 'Shop approved successfully' : 'Shop approval revoked',
      data: shop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 3. System Metrics & Revenue Dashboard
// ==========================================
exports.getSystemMetrics = async (req, res) => {
  try {
    // 1. Count Total Users, Shops, and Delivery Partners
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalRiders = await Delivery.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 2. Calculate Total Revenue (Only from 'Delivered' orders) using MongoDB Aggregation
    const revenueData = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalShops,
        totalRiders,
        totalOrders,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};