const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust paths if necessary
const Shop = require('../models/Shop');
const Delivery = require('../models/Delivery');
const Admin = require('../models/Admin');

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token valid for 30 days
  });
};

// ==========================================
// 1. REGISTER CUSTOMER (USER)
// ==========================================
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Validation: Check for empty fields
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone, and password' });
    }

    // Validation: Check phone number format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be 10 digits.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id, 'user'),
      data: { id: user._id, name: user.name, phone: user.phone }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. REGISTER SHOP (VENDOR)
// ==========================================
exports.registerShop = async (req, res) => {
  try {
    const { shopName, ownerName, phone, password, address, longitude, latitude } = req.body;

    // Validation
    if (!shopName || !ownerName || !phone || !password || !address || !longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Please provide all required shop details, including location coordinates.' });
    }

    // Check if shop phone already exists
    const shopExists = await Shop.findOne({ phone });
    if (shopExists) {
      return res.status(400).json({ success: false, message: 'Shop with this phone number already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Shop (Note: isApproved defaults to false based on our schema)
    const shop = await Shop.create({
      shopName,
      ownerName,
      phone,
      password: hashedPassword,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully. Waiting for Admin approval.',
      token: generateToken(shop._id, 'shop'),
      data: { id: shop._id, shopName: shop.shopName, isApproved: shop.isApproved }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 3. UNIFIED LOGIN (Handles all 4 roles)
// ==========================================
exports.login = async (req, res) => {
  try {
    // Role defines which collection to search ('user', 'shop', 'delivery', 'admin')
    const { phone, email, password, role } = req.body;

    if (!password || !role) {
      return res.status(400).json({ success: false, message: 'Password and role are required' });
    }

    let account;
    // Find the account based on the requested role
    switch (role) {
      case 'user':
        if (!phone) return res.status(400).json({ success: false, message: 'Phone is required for user login' });
        account = await User.findOne({ phone });
        break;
      case 'shop':
        if (!phone) return res.status(400).json({ success: false, message: 'Phone is required for shop login' });
        account = await Shop.findOne({ phone });
        break;
      case 'delivery':
        if (!phone) return res.status(400).json({ success: false, message: 'Phone is required for delivery login' });
        account = await Delivery.findOne({ phone });
        break;
      case 'admin':
        if (!email) return res.status(400).json({ success: false, message: 'Email is required for admin login' });
        account = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    // Validation: If account doesn't exist
    if (!account) {
      return res.status(401).json({ success: false, message: `Invalid credentials for ${role}` });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Optional Check: Ensure Shop/Delivery are approved by admin before letting them fully login
    if ((role === 'shop' || role === 'delivery') && account.isApproved === false) {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    }

    // Success: Return Token
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: generateToken(account._id, role),
      data: {
        id: account._id,
        role: role,
        name: account.name || account.shopName
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};