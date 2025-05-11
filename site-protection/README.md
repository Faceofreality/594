# Site Protection System for 594 ANTI EXTORT

This protection system implements several security measures to protect the 594 ANTI EXTORT website from unauthorized access, bots, and excessive traffic.

## Features

### Caching System
- Page content caching to reduce server load
- Configurable cache duration and size
- Cache invalidation for outdated content

### Visitor Tracking
- Unique visitor identification
- Session management
- Statistical data collection

### Security Measures
- Rate limiting to prevent excessive requests
- Bot detection based on user agent analysis
- IP blocking for suspicious activities
- Protection against common web vulnerabilities

## How It Works

1. When a visitor accesses the site, the system assigns them a unique visitor ID
2. Each request is evaluated through security checks:
   - IP address verification
   - Rate limit enforcement
   - Bot detection
3. If the request passes all checks, it's processed normally
4. Page content is cached for faster delivery to subsequent visitors
5. Statistical data is collected for monitoring and analysis

## Configuration

The system has several configurable parameters:
- `MAX_REQUESTS_PER_MINUTE`: Maximum allowed requests per minute from a single IP
- `BLOCK_DURATION`: How long a blocked IP remains blocked (in milliseconds)
- `CACHE_DURATION`: How long cached content remains valid (in milliseconds)
- `MAX_CACHE_SIZE`: Maximum number of pages to keep in the cache

## Implementation

This protection system is designed to work with both static websites and backend services. It's implemented in Node.js and can be integrated with various web servers and frameworks.

For optimal protection, it should be combined with server-level security measures like firewalls and proper HTTPS configuration.