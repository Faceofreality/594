// Protected routes that require authentication
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../auth/jwt');
const { encrypt, decrypt, generateEncryptionKey } = require('../auth/security');

// Encryption key for sensitive data
const ENCRYPTION_KEY = generateEncryptionKey();

// Sample dox data (would be in a database in production)
const doxData = [
  {
    id: 'dox1',
    targetId: 'target1',
    createdAt: new Date().toISOString(),
    // Sensitive data would be encrypted in a real system
    data: encrypt(JSON.stringify({
      name: 'Target Alpha',
      ipAddress: '192.168.1.1',
      location: 'Unknown',
      details: 'Very sensitive information here'
    }), ENCRYPTION_KEY)
  },
  {
    id: 'dox2',
    targetId: 'target2',
    createdAt: new Date().toISOString(),
    data: encrypt(JSON.stringify({
      name: 'Target Beta',
      ipAddress: '10.0.0.1',
      location: 'Undisclosed',
      details: 'High security information'
    }), ENCRYPTION_KEY)
  }
];

// Apply JWT authentication to all routes in this router
router.use(authenticateJWT);

// Get user profile
router.get('/profile', (req, res) => {
  // User info is available from the JWT authentication middleware
  const { id, username, role } = req.user;
  
  return res.status(200).json({
    status: 'success',
    data: {
      id,
      username,
      role,
      accessLevel: role === 'admin' ? 'full' : 'restricted'
    }
  });
});

// Get all dox (admin only)
router.get('/dox', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  // Return dox IDs and targets but not the sensitive data
  const sanitizedDox = doxData.map(dox => ({
    id: dox.id,
    targetId: dox.targetId,
    createdAt: dox.createdAt
  }));
  
  return res.status(200).json({
    status: 'success',
    data: sanitizedDox
  });
});

// Get a specific dox by ID (admin only)
router.get('/dox/:id', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  const { id } = req.params;
  const dox = doxData.find(d => d.id === id);
  
  if (!dox) {
    return res.status(404).json({
      status: 'error',
      message: 'Dox not found'
    });
  }
  
  // Decrypt the sensitive data
  try {
    const decryptedData = JSON.parse(decrypt(dox.data, ENCRYPTION_KEY));
    
    return res.status(200).json({
      status: 'success',
      data: {
        id: dox.id,
        targetId: dox.targetId,
        createdAt: dox.createdAt,
        details: decryptedData
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error decrypting data',
      reference: req.requestId
    });
  }
});

// Secret operations endpoint (admin only)
router.post('/operations', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  // Security check: ensure the operation type is valid
  const { operation } = req.body;
  const allowedOperations = ['scan', 'analyze', 'track'];
  
  if (!operation || !allowedOperations.includes(operation)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid operation type'
    });
  }
  
  // Mock response based on operation type
  let response;
  
  switch (operation) {
    case 'scan':
      response = {
        operationId: `scan-${Date.now()}`,
        status: 'initiated',
        message: 'Network scan initiated'
      };
      break;
    case 'analyze':
      response = {
        operationId: `analyze-${Date.now()}`,
        status: 'initiated',
        message: 'Data analysis initiated'
      };
      break;
    case 'track':
      response = {
        operationId: `track-${Date.now()}`,
        status: 'initiated',
        message: 'Tracking initiated'
      };
      break;
  }
  
  return res.status(200).json({
    status: 'success',
    data: response
  });
});

module.exports = router;