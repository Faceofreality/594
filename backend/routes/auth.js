// Authentication routes
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { generateToken, refreshToken } = require('../auth/jwt');
const { createHash, verifyHash, generateToken: generateSecureToken, isIPBlocked, blockIP } = require('../auth/security');

// In-memory user store (replace with a database in production)
const users = [
  {
    id: 'admin',
    username: 'admin594',
    // Password hash would normally be stored in database
    passwordHash: '$2b$10$t7alAh1LZCjJgYBK7OjMqufuL2MZ2fS7jP7F/Ts/0sNvvh2az4UBi', // '594admin!'
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Login attempt tracking to prevent brute force (should use Redis in production)
const loginAttempts = new Map();

// Check login attempts
const checkLoginAttempts = (ip) => {
  if (isIPBlocked(ip)) {
    return { blocked: true };
  }
  
  const attempts = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 3600000 };
  
  // Reset attempts after 1 hour
  if (Date.now() > attempts.resetAt) {
    attempts.count = 0;
    attempts.resetAt = Date.now() + 3600000;
  }
  
  if (attempts.count >= 5) {
    blockIP(ip, 30); // Block for 30 minutes
    loginAttempts.delete(ip); // Reset the counter
    return { blocked: true };
  }
  
  return { blocked: false, attempts };
};

// Increment login attempts
const incrementLoginAttempts = (ip) => {
  const attempts = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 3600000 };
  attempts.count += 1;
  loginAttempts.set(ip, attempts);
  
  return attempts;
};

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  // Check if IP is blocked
  const attemptCheck = checkLoginAttempts(ip);
  if (attemptCheck.blocked) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many login attempts. Try again later.'
    });
  }
  
  // Validate input
  if (!username || !password) {
    incrementLoginAttempts(ip);
    return res.status(400).json({
      status: 'error',
      message: 'Username and password are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.username === username);
  
  if (!user) {
    incrementLoginAttempts(ip);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }
  
  // Verify password with bcrypt
  bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
    if (err || !isMatch) {
      incrementLoginAttempts(ip);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate a JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    // Reset login attempts on successful login
    loginAttempts.delete(ip);
    
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  });
});

// Token refresh route
router.post('/refresh', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is required'
    });
  }
  
  const newToken = refreshToken(token);
  
  if (!newToken) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
  
  return res.status(200).json({
    status: 'success',
    message: 'Token refreshed',
    data: {
      token: newToken
    }
  });
});

// Change password route (protected)
router.post('/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required'
    });
  }
  
  // Find user
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  // Verify current password
  bcrypt.compare(currentPassword, users[userIndex].passwordHash, (err, isMatch) => {
    if (err || !isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Error updating password'
        });
      }
      
      // Update password
      users[userIndex].passwordHash = hash;
      
      return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    });
  });
});

module.exports = router;