// Script to start the backend server
const app = require('./backend/server');

console.log('Starting 594 ANTI EXTORT backend server...');
console.log('================================================');
console.log('');
console.log('You can access the backend API at:');
console.log('   http://localhost:3000/api');
console.log('');
console.log('Available endpoints:');
console.log('   POST /api/auth/login - Login endpoint');
console.log('   POST /api/auth/refresh - Refresh token');
console.log('   GET /api/protected/profile - Get user profile (requires auth)');
console.log('   GET /api/protected/dox - List all dox (admin only)');
console.log('   GET /api/protected/dox/:id - Get specific dox (admin only)');
console.log('   POST /api/protected/operations - Perform operation (admin only)');
console.log('');
console.log('Default admin credentials:');
console.log('   Username: admin594');
console.log('   Password: 594admin!');
console.log('');
console.log('================================================');