// Security utilities for the backend
const crypto = require('crypto');

// List of allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'https://594antiextort.com'
];

// Check if origin is allowed (for CORS)
const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl requests)
  if (!origin) return callback(null, true);
  
  if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  }
  
  return callback(null, true);
};

// Generate a secure random token
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

// Create a secure hash for passwords and sensitive data
const createHash = (data) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

// Verify a hash against stored hash
const verifyHash = (data, storedHash, storedSalt) => {
  const hash = crypto.pbkdf2Sync(data, storedSalt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
};

// Encrypt sensitive data
const encrypt = (text, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
};

// Decrypt sensitive data
const decrypt = (encrypted, encryptionKey) => {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const encryptedText = Buffer.from(encrypted.encryptedData, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
};

// Generate a random encryption key (32 bytes = 256 bits)
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// IP blocking helpers
const blockedIPs = new Map();

// Check if IP is blocked
const isIPBlocked = (ip) => {
  if (!blockedIPs.has(ip)) return false;
  
  const { until } = blockedIPs.get(ip);
  if (Date.now() > until) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
};

// Block IP for specified duration (in minutes)
const blockIP = (ip, duration = 30) => {
  const until = Date.now() + (duration * 60 * 1000);
  blockedIPs.set(ip, { until });
};

// Export all security functions
module.exports = {
  checkOrigin,
  generateToken,
  createHash,
  verifyHash,
  encrypt,
  decrypt,
  generateEncryptionKey,
  isIPBlocked,
  blockIP
};