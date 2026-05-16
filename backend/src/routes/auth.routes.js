const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  registerShop, 
  login 
} = require('../controllers/auth.controller');

// Registration Routes
router.post('/register/user', registerUser);
router.post('/register/shop', registerShop);

// You can add /register/delivery and /register/admin here later

// Unified Login Route
router.post('/login', login);

module.exports = router;