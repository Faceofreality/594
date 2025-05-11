/**
 * Site Protection System - Main Module
 * 
 * This is the main entry point for the 594 ANTI EXTORT site protection system.
 * It integrates the cache and security modules to provide comprehensive protection.
 */

const cache = require('./cache');
const security = require('./security');
const crypto = require('crypto');

// Site protection settings
const PROTECTION_ENABLED = true;
const CACHE_ENABLED = true;
const SECURITY_ENABLED = true;

/**
 * Generate a unique visitor ID
 */
function generateVisitorId(ip, userAgent) {
  const data = `${ip}-${userAgent}-${Date.now()}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Process a request through the protection system
 */
function processRequest(ip, url, userAgent = '', referrer = '') {
  if (!PROTECTION_ENABLED) {
    return { allowed: true };
  }
  
  const result = {
    allowed: true,
    cached: false,
    cacheContent: null,
    visitorId: null
  };
  
  // Security checks
  if (SECURITY_ENABLED) {
    // Check if IP is already blocked
    if (security.isIPBlocked(ip)) {
      result.allowed = false;
      result.reason = 'IP address is blocked';
      console.log(`[Protection] Blocked request from: ${ip}`);
      return result;
    }
    
    // Rate limiting check
    if (security.isRateLimited(ip)) {
      result.allowed = false;
      result.reason = 'Rate limit exceeded';
      console.log(`[Protection] Rate limited: ${ip}`);
      return result;
    }
    
    // Bot detection
    if (security.detectBot(userAgent)) {
      security.blockIP(ip, 'Bot signature detected');
      result.allowed = false;
      result.reason = 'Bot activity detected';
      console.log(`[Protection] Bot detected: ${ip} (${userAgent})`);
      return result;
    }
  }
  
  // If request is allowed, generate visitor ID and check cache
  const visitorId = generateVisitorId(ip, userAgent);
  result.visitorId = visitorId;
  
  // Update visitor tracking
  cache.updateVisitor(visitorId);
  
  // Check if page is in cache
  if (CACHE_ENABLED) {
    const cachedContent = cache.getPageFromCache(url);
    if (cachedContent) {
      result.cached = true;
      result.cacheContent = cachedContent;
    }
  }
  
  return result;
}

/**
 * Store a page in the cache
 */
function storePage(url, content) {
  if (CACHE_ENABLED) {
    cache.cachePage(url, content);
  }
}

/**
 * End a visitor session
 */
function endSession(visitorId) {
  if (visitorId) {
    cache.endVisitorSession(visitorId);
  }
}

/**
 * Get protection system statistics
 */
function getStats() {
  return {
    enabled: PROTECTION_ENABLED,
    cache: CACHE_ENABLED ? cache.getVisitorStats() : 'Disabled',
    security: SECURITY_ENABLED ? security.getSecurityStats() : 'Disabled'
  };
}

// Export the protection API
module.exports = {
  processRequest,
  storePage,
  endSession,
  getStats
};