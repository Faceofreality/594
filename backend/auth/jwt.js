// JWT authentication utilities
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// This would normally be in an environment variable
// For a real deployment, move this to a secure environment variable
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '24h';

// Generate a JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication format invalid'
    });
  }
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
  
  // Set the user info in the request for use in protected routes
  req.user = decoded;
  next();
};

// Refresh a token
const refreshToken = (oldToken) => {
  const decoded = verifyToken(oldToken);
  
  if (!decoded) {
    return null;
  }
  
  // Don't include the exp field from the old token
  const { exp, iat, ...payload } = decoded;
  
  // Generate a new token
  return generateToken(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT,
  refreshToken
};