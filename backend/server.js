// Backend Server for 594 ANTI EXTORT
// This server contains security measures and protected routes

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const { checkOrigin } = require('./auth/security');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security measures
// =================

// 1. Use Helmet for setting various HTTP headers for security
app.use(helmet());

// 2. Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again after 15 minutes'
  }
});

// 3. Custom CORS configuration with origin validation
app.use(cors({
  origin: checkOrigin,
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 3600
}));

// 4. Body parser with request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Remove sensitive headers
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// 6. Generate random request IDs for tracking
app.use((req, res, next) => {
  req.requestId = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Setup routes
// ============

// Apply rate limiting to authentication routes
app.use('/api/auth', apiLimiter, authRoutes);

// Protected routes with authentication
app.use('/api/protected', protectedRoutes);

// Root route with anti-crawler message
app.get('/', (req, res) => {
  res.status(403).json({
    error: 'Access denied',
    message: 'Direct API access is not permitted'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Resource not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[Error ${req.requestId}]`, err);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    reference: req.requestId
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('==================================');
  });
}

module.exports = app; // For testing