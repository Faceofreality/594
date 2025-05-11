/**
 * Client-side implementation of site protection for 594 ANTI EXTORT
 * This script connects to the protection system and applies it to the website
 */

// Site Protection System - Client Side
const SiteProtection = (function() {
  // Visitor tracking & storage
  let visitorId = localStorage.getItem('visitor_id');
  const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
  const firstVisit = localStorage.getItem('first_visit') || Date.now().toString();
  const pageCache = new Map();
  
  // Settings
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Initialize the protection system
   */
  function initialize() {
    console.log('[Protection] Initializing site protection...');
    
    // Register visitor
    registerVisitor();
    
    // Check for bots
    if (detectBot()) {
      console.log('[Protection] Bot detected, blocking access');
      blockAccess('Bot activity detected');
      return false;
    }
    
    // Check rate limiting
    if (isRateLimited()) {
      console.log('[Protection] Rate limit exceeded, temporarily blocking access');
      blockAccess('Too many requests, please try again later');
      return false;
    }
    
    // Setup cache system
    setupCache();
    
    // Monitor page interactions
    setupActivityMonitoring();
    
    console.log('[Protection] Site protection initialized successfully');
    return true;
  }
  
  /**
   * Register or update visitor information
   */
  function registerVisitor() {
    // Generate visitor ID if not exists
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem('visitor_id', visitorId);
      localStorage.setItem('first_visit', Date.now().toString());
      localStorage.setItem('visit_count', '1');
      
      console.log('[Protection] New visitor registered:', visitorId);
    } else {
      // Update existing visitor
      const newCount = visitCount + 1;
      localStorage.setItem('visit_count', newCount.toString());
      localStorage.setItem('last_visit', Date.now().toString());
      
      console.log('[Protection] Return visitor:', visitorId, '(Visit #' + newCount + ')');
    }
  }
  
  /**
   * Generate a unique visitor ID
   */
  function generateVisitorId() {
    const components = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      !!navigator.cookieEnabled
    ];
    
    // Create a simple hash
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Add timestamp for uniqueness
    return 'visitor_' + Math.abs(hash) + '_' + Date.now().toString(36);
  }
  
  /**
   * Basic bot detection
   */
  function detectBot() {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check common bot signatures
    const botPatterns = [
      'bot', 'spider', 'crawl', 'headless', 'phantom', 'slurp',
      'facebot', 'facebook', 'twitter', 'whatsapp', 'wget', 'curl',
      'python-requests', 'python-urllib', 'java/', 'jakarta', 'perl'
    ];
    
    for (const pattern of botPatterns) {
      if (ua.includes(pattern)) {
        return true;
      }
    }
    
    // Check for headless browser
    if (navigator.webdriver) {
      return true;
    }
    
    // Advanced fingerprinting checks
    try {
      // Test for browser inconsistencies
      if (navigator.plugins.length === 0 && !navigator.mimeTypes.length) {
        return true;
      }
      
      // Check if browser lies about features
      if (navigator.languages === undefined || navigator.languages.length === 0) {
        return true;
      }
    } catch (e) {
      // Errors in detection could indicate a bot
      return true;
    }
    
    return false;
  }
  
  /**
   * Rate limiting check
   */
  function isRateLimited() {
    // Get the request timestamps from session storage
    let requests = sessionStorage.getItem('requests');
    
    if (!requests) {
      requests = [];
    } else {
      try {
        requests = JSON.parse(requests);
        
        // Remove requests older than 1 minute
        const oneMinuteAgo = Date.now() - 60000;
        requests = requests.filter(time => time > oneMinuteAgo);
      } catch (e) {
        requests = [];
      }
    }
    
    // Add current request
    requests.push(Date.now());
    sessionStorage.setItem('requests', JSON.stringify(requests));
    
    // Check if too many requests
    const MAX_REQUESTS_PER_MINUTE = 60;
    return requests.length > MAX_REQUESTS_PER_MINUTE;
  }
  
  /**
   * Block access to the site
   */
  function blockAccess(reason) {
    // Save the reason
    sessionStorage.setItem('block_reason', reason);
    
    // Clear the page and display block message
    document.body.innerHTML = '';
    document.body.style.backgroundColor = '#000';
    document.body.style.color = '#f00';
    document.body.style.fontFamily = 'monospace';
    document.body.style.padding = '50px';
    document.body.style.textAlign = 'center';
    
    const container = document.createElement('div');
    
    const title = document.createElement('h1');
    title.textContent = 'ACCESS DENIED';
    title.style.fontSize = '36px';
    title.style.marginBottom = '20px';
    
    const message = document.createElement('p');
    message.textContent = reason || 'Your access to this site has been blocked';
    message.style.fontSize = '18px';
    message.style.marginBottom = '30px';
    
    const errorCode = document.createElement('div');
    errorCode.textContent = 'Error Code: ' + Math.floor(Math.random() * 9000 + 1000);
    errorCode.style.color = '#888';
    errorCode.style.marginTop = '40px';
    
    container.appendChild(title);
    container.appendChild(message);
    container.appendChild(errorCode);
    document.body.appendChild(container);
    
    // Prevent further execution
    throw new Error('Access blocked: ' + reason);
  }
  
  /**
   * Cache setup for improved performance
   */
  function setupCache() {
    // Load cache from localStorage
    try {
      const savedCache = localStorage.getItem('page_cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        
        // Convert to Map and check expiry
        const currentTime = Date.now();
        for (const [key, item] of Object.entries(parsedCache)) {
          if (currentTime - item.timestamp < CACHE_DURATION) {
            pageCache.set(key, item);
          }
        }
        
        console.log('[Protection] Loaded', pageCache.size, 'items from cache');
      }
    } catch (e) {
      console.error('[Protection] Error loading cache:', e);
    }
    
    // Set up storage event to save cache periodically
    window.addEventListener('beforeunload', () => {
      try {
        // Convert Map to object for storage
        const cacheObject = {};
        for (const [key, value] of pageCache.entries()) {
          cacheObject[key] = value;
        }
        
        localStorage.setItem('page_cache', JSON.stringify(cacheObject));
      } catch (e) {
        console.error('[Protection] Error saving cache:', e);
      }
    });
  }
  
  /**
   * Set up monitoring for user activity
   */
  function setupActivityMonitoring() {
    // Track page navigation
    window.addEventListener('popstate', trackNavigation);
    
    // Intercept link clicks for tracking
    document.addEventListener('click', (e) => {
      // Check if it's a link
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        
        // Only track internal links
        if (link.hostname === window.location.hostname) {
          trackNavigation(link.pathname);
        }
      }
    });
    
    // Record initial page view
    trackNavigation();
  }
  
  /**
   * Track page navigation
   */
  function trackNavigation(path = window.location.pathname) {
    // Save to pageviews in session storage
    let pageviews = sessionStorage.getItem('pageviews');
    
    if (!pageviews) {
      pageviews = [];
    } else {
      try {
        pageviews = JSON.parse(pageviews);
      } catch (e) {
        pageviews = [];
      }
    }
    
    // Add current page
    pageviews.push({
      path: path,
      time: Date.now()
    });
    
    sessionStorage.setItem('pageviews', JSON.stringify(pageviews));
  }
  
  /**
   * Get visitor statistics
   */
  function getStats() {
    return {
      visitorId: visitorId,
      visitCount: visitCount,
      firstVisit: new Date(parseInt(firstVisit)).toISOString(),
      pagesCached: pageCache.size,
      sessionPages: JSON.parse(sessionStorage.getItem('pageviews') || '[]').length
    };
  }
  
  // Public API
  return {
    initialize,
    getStats
  };
})();

// Initialize protection when page loads
document.addEventListener('DOMContentLoaded', function() {
  try {
    SiteProtection.initialize();
    console.log('Protection active:', SiteProtection.getStats());
  } catch (e) {
    console.error('Error initializing protection:', e);
  }
});