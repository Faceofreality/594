/**
 * Site Protection System - Security Module
 * 
 * This module provides security features for the 594 ANTI EXTORT site.
 * It helps protect the site by:
 * 1. Rate limiting requests
 * 2. Basic bot detection
 * 3. Blocking suspicious activities
 */

// Storage for IP tracking
const ipRequests = new Map();
const blockedIPs = new Map();

// Security settings
const MAX_REQUESTS_PER_MINUTE = 60;
const BLOCK_DURATION = 1800000; // 30 minutes in milliseconds
const DETECTION_THRESHOLD = 0.8; // 80% confidence for bot detection

// Suspicious user agent patterns (simplified)
const BOT_UA_PATTERNS = [
  'headless',
  'phantom',
  'bot',
  'crawl',
  'spider',
  'wget',
  'curl',
  'scrape',
  'python-requests'
];

/**
 * Check if an IP address is making too many requests
 */
function isRateLimited(ip) {
  cleanupOldEntries();
  
  if (isIPBlocked(ip)) {
    return true;
  }
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, {
      count: 1,
      firstRequest: Date.now(),
      lastRequest: Date.now()
    });
    return false;
  }
  
  const ipData = ipRequests.get(ip);
  const currentTime = Date.now();
  
  // Reset count if it's been more than a minute
  if (currentTime - ipData.firstRequest > 60000) {
    ipData.count = 1;
    ipData.firstRequest = currentTime;
  } else {
    ipData.count++;
  }
  
  ipData.lastRequest = currentTime;
  ipRequests.set(ip, ipData);
  
  // Check if rate limit is exceeded
  if (ipData.count > MAX_REQUESTS_PER_MINUTE) {
    blockIP(ip);
    console.log(`[Security] Rate limit exceeded for IP: ${ip}`);
    return true;
  }
  
  return false;
}

/**
 * Block an IP address for suspicious activity
 */
function blockIP(ip, reason = 'Rate limit exceeded') {
  blockedIPs.set(ip, {
    reason,
    blockedAt: Date.now(),
    expiry: Date.now() + BLOCK_DURATION
  });
  
  console.log(`[Security] Blocked IP: ${ip} (${reason})`);
}

/**
 * Check if an IP is currently blocked
 */
function isIPBlocked(ip) {
  if (!blockedIPs.has(ip)) {
    return false;
  }
  
  const blockData = blockedIPs.get(ip);
  
  // Check if block has expired
  if (Date.now() > blockData.expiry) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

/**
 * Simple bot detection based on user agent
 */
function detectBot(userAgent = '') {
  if (!userAgent) {
    // Missing user agent is suspicious
    return true;
  }
  
  // Normalize user agent
  const ua = userAgent.toLowerCase();
  
  // Check for bot patterns
  for (const pattern of BOT_UA_PATTERNS) {
    if (ua.includes(pattern)) {
      console.log(`[Security] Bot detected with pattern: ${pattern}`);
      return true;
    }
  }
  
  // Check for browser inconsistencies (simplified)
  if (ua.includes('mozilla') && !ua.includes('webkit') && !ua.includes('gecko')) {
    console.log('[Security] Inconsistent browser signature detected');
    return true;
  }
  
  return false;
}

/**
 * Clean up old entries from IP tracking
 */
function cleanupOldEntries() {
  const currentTime = Date.now();
  
  // Clean up old IP request entries
  for (const [ip, data] of ipRequests.entries()) {
    if (currentTime - data.lastRequest > 600000) { // 10 minutes
      ipRequests.delete(ip);
    }
  }
  
  // Clean up expired IP blocks
  for (const [ip, data] of blockedIPs.entries()) {
    if (currentTime > data.expiry) {
      blockedIPs.delete(ip);
    }
  }
}

/**
 * Get security statistics
 */
function getSecurityStats() {
  return {
    activeIPsTracked: ipRequests.size,
    blockedIPs: blockedIPs.size
  };
}

// Export all functions
module.exports = {
  isRateLimited,
  blockIP,
  isIPBlocked,
  detectBot,
  getSecurityStats
};