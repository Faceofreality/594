/**
 * Example Implementation of the Site Protection System
 * 
 * This demonstrates how the protection system would be integrated
 * with a web server (like Express) for the 594 ANTI EXTORT website.
 */

// This would be used in a real server setup:
// const express = require('express');
// const app = express();

// Import the protection system
const protection = require('./index');

// Sample request handler with protection
function handleRequest(req, res) {
  // Extract request information
  const ip = req.ip || req.connection.remoteAddress;
  const url = req.url;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'] || '';
  
  // Process the request through protection system
  const result = protection.processRequest(ip, url, userAgent, referrer);
  
  // Check if request is allowed
  if (!result.allowed) {
    // Request is blocked
    console.log(`Blocked request: ${result.reason}`);
    return res.status(403).send('Access Denied: ' + result.reason);
  }
  
  // Check if response is cached
  if (result.cached) {
    console.log(`Serving cached content for: ${url}`);
    return res.send(result.cacheContent);
  }
  
  // Process request normally and generate content
  const content = generateContent(url);
  
  // Store generated content in cache
  protection.storePage(url, content);
  
  // Send response
  res.send(content);
}

// Sample content generation (would be replaced with actual page rendering)
function generateContent(url) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>594 ANTI EXTORT</title>
      </head>
      <body>
        <h1>Protected Content for: ${url}</h1>
        <p>This content is protected by the 594 ANTI EXTORT protection system.</p>
        <p>Generated at: ${new Date().toISOString()}</p>
      </body>
    </html>
  `;
}

// In a real Express application, this would be set up like:
//
// app.use((req, res, next) => {
//   // Extract request information
//   const ip = req.ip || req.connection.remoteAddress;
//   const url = req.url;
//   const userAgent = req.headers['user-agent'];
//   const referrer = req.headers['referer'] || '';
//   
//   // Process the request through protection system
//   const result = protection.processRequest(ip, url, userAgent, referrer);
//   
//   // Check if request is allowed
//   if (!result.allowed) {
//     // Request is blocked
//     return res.status(403).send('Access Denied: ' + result.reason);
//   }
//   
//   // Store visitor ID in request for later use
//   req.visitorId = result.visitorId;
//   
//   // Check if response is cached
//   if (result.cached) {
//     return res.send(result.cacheContent);
//   }
//   
//   // Continue to next middleware or route handler
//   next();
// });
//
// // Example of using a response hook to cache responses
// app.use((req, res, next) => {
//   const originalSend = res.send;
//   
//   res.send = function(body) {
//     // Cache the response content
//     protection.storePage(req.url, body);
//     
//     // Call the original send method
//     return originalSend.call(this, body);
//   };
//   
//   next();
// });
//
// // Start server on port 3000
// app.listen(3000, () => {
//   console.log('Server running with protection on port 3000');
// });

console.log('Protection system is ready for implementation');
console.log('Stats:', protection.getStats());

// Export for testing
module.exports = {
  handleRequest
};