// Configuration settings for the backend

// Environment-specific settings
const environments = {
  development: {
    port: 3000,
    corsOrigins: ['http://localhost:5000'],
    jwtExpiresIn: '24h',
    rateLimits: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per windowMs
    },
    logLevel: 'debug'
  },
  production: {
    port: process.env.PORT || 3000,
    corsOrigins: ['https://594antiextort.com', 'https://www.594antiextort.com'],
    jwtExpiresIn: '12h',
    rateLimits: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50 // 50 requests per windowMs
    },
    logLevel: 'error'
  },
  test: {
    port: 3001,
    corsOrigins: ['http://localhost:5000'],
    jwtExpiresIn: '1h',
    rateLimits: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // 1000 requests per windowMs for testing
    },
    logLevel: 'info'
  }
};

// Get current environment or default to development
const currentEnv = process.env.NODE_ENV || 'development';
const config = environments[currentEnv] || environments.development;

module.exports = {
  ...config,
  env: currentEnv,
  
  // Security settings
  security: {
    passwordHashRounds: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    blockDuration: 30 * 60 * 1000 // 30 minutes
  },
  
  // Feature flags
  features: {
    enableRegistration: false,
    enablePasswordReset: true,
    enableTwoFactorAuth: false
  }
};