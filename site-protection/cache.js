/**
 * Site Protection System - Cache Module
 * 
 * This module provides caching functionality for the 594 ANTI EXTORT site.
 * It helps protect the site by:
 * 1. Reducing server load through caching
 * 2. Tracking visitor statistics
 * 3. Providing the foundation for more advanced protection measures
 */

// Cache storage
const pageCache = new Map();
const visitorCache = new Map();

// Cache settings
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached pages

// Visitor tracking
let totalVisitors = 0;
let activeSessions = 0;

/**
 * Generate a unique cache key based on page URL and parameters
 */
function generateCacheKey(url, params = {}) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  return `${url}?${sortedParams}`;
}

/**
 * Store page content in cache
 */
function cachePage(url, content, params = {}) {
  // Don't cache if we've hit the size limit
  if (pageCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest item (first key in map)
    const oldestKey = pageCache.keys().next().value;
    pageCache.delete(oldestKey);
  }
  
  const cacheKey = generateCacheKey(url, params);
  
  pageCache.set(cacheKey, {
    content,
    timestamp: Date.now(),
    hits: 0
  });
  
  console.log(`[Cache] Stored page: ${url}`);
}

/**
 * Get page content from cache if available and not expired
 */
function getPageFromCache(url, params = {}) {
  const cacheKey = generateCacheKey(url, params);
  
  if (!pageCache.has(cacheKey)) {
    return null;
  }
  
  const cachedPage = pageCache.get(cacheKey);
  
  // Check if cache is expired
  if (Date.now() - cachedPage.timestamp > CACHE_DURATION) {
    pageCache.delete(cacheKey);
    console.log(`[Cache] Expired cache for: ${url}`);
    return null;
  }
  
  // Increment hit counter
  cachedPage.hits++;
  pageCache.set(cacheKey, cachedPage);
  
  console.log(`[Cache] Hit for: ${url}`);
  return cachedPage.content;
}

/**
 * Clear cache for a specific URL or all cache if no URL is provided
 */
function clearCache(url = null) {
  if (url) {
    // Find all keys that start with the URL
    for (const key of pageCache.keys()) {
      if (key.startsWith(url)) {
        pageCache.delete(key);
      }
    }
    console.log(`[Cache] Cleared cache for: ${url}`);
  } else {
    pageCache.clear();
    console.log('[Cache] Cleared all cache');
  }
}

/**
 * Register a new visitor in the tracking system
 */
function registerVisitor(visitorId, userAgent = '', referrer = '') {
  totalVisitors++;
  activeSessions++;
  
  visitorCache.set(visitorId, {
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    visits: 1,
    userAgent,
    referrer
  });
  
  console.log(`[Visitor] New visitor: ${visitorId}`);
}

/**
 * Update an existing visitor's information
 */
function updateVisitor(visitorId) {
  if (!visitorCache.has(visitorId)) {
    // If visitor doesn't exist, register as new
    registerVisitor(visitorId);
    return;
  }
  
  const visitor = visitorCache.get(visitorId);
  visitor.lastVisit = Date.now();
  visitor.visits++;
  
  visitorCache.set(visitorId, visitor);
  console.log(`[Visitor] Return visitor: ${visitorId} (${visitor.visits} visits)`);
}

/**
 * End a visitor session
 */
function endVisitorSession(visitorId) {
  if (visitorCache.has(visitorId)) {
    activeSessions--;
    console.log(`[Visitor] Session ended: ${visitorId}`);
  }
}

/**
 * Get visitor statistics
 */
function getVisitorStats() {
  return {
    totalVisitors,
    activeSessions,
    cachedPages: pageCache.size
  };
}

// Export all functions
module.exports = {
  cachePage,
  getPageFromCache,
  clearCache,
  registerVisitor,
  updateVisitor,
  endVisitorSession,
  getVisitorStats
};