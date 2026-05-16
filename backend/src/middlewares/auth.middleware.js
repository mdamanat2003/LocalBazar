const jwt = require('jsonwebtoken');

// ==========================================
// 1. Protect Routes (Verify Token)
// ==========================================
exports.protect = (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract the token
  }

  // If no token is found
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route. No token provided.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // In our auth controller, we signed the token with { id, role }
    // We attach this directly to the req object so any route can use it!
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next(); // Move to the next middleware or controller
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized. Token is invalid or expired.' 
    });
  }
};

// ==========================================
// 2. Authorize Roles (RBAC)
// ==========================================
// Pass in an array of roles that are allowed to access a specific route
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user.role was attached by the 'protect' middleware above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user.role}) is not authorized to access this resource.` 
      });
    }
    next();
  };
};