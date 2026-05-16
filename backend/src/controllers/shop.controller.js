const Shop = require('../models/Shop');

// ==========================================
// Get Nearby Shops (For User App)
// ==========================================
exports.getNearbyShops = async (req, res) => {
  try {
    // Extract coordinates and radius from the query string
    // Example: /api/shops/nearby?lng=88.3639&lat=22.5726&radius=5
    const { lng, lat, radius = 5 } = req.query; // Default radius is 5 km

    if (!lng || !lat) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide longitude and latitude.' 
      });
    }

    // Convert radius from kilometers to meters (MongoDB $near uses meters for GeoJSON)
    const radiusInMeters = parseInt(radius) * 1000;

    // Find shops using MongoDB geospatial query
    const shops = await Shop.find({
      isApproved: true, // Only show shops approved by admin
      isActive: true,   // Only show shops currently accepting orders
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    });

    res.status(200).json({
      success: true,
      count: shops.length,
      message: `Found ${shops.length} shops within ${radius}km`,
      data: shops
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// ==========================================
// Get Shop Dashboard (Shop details by ID)
// ==========================================
exports.getShopDashboard = async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'Shop ID is required.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// Update Inventory (placeholder)
// ==========================================
exports.updateInventory = async (req, res) => {
  try {
    // Placeholder: real implementation should update inventory items for the authenticated shop
    res.status(200).json({ success: true, message: 'Inventory updated (placeholder).' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};