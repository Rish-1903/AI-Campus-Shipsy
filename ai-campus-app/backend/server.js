const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// NUCLEAR CORS FIX
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // ALLOW EVERYTHING
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Auth-Token, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.status(200).send();
  }
  
  next();
});

// Also use CORS package as backup
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

app.use(express.json());

// Import routes
const { register, login } = require('./auth');
const tasksRouter = require('./tasks');

// Load AI routes
let aiRoutes;
try {
  aiRoutes = require('./routes/ai-routes');
  console.log('✅ AI routes loaded');
} catch (error) {
  console.log('❌ AI routes not found, creating basic');
  aiRoutes = express.Router();
  aiRoutes.get('/test', (req, res) => {
    res.json({ message: 'AI test endpoint', timestamp: new Date().toISOString() });
  });
}

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRoutes);

// Health check with CORS test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Campus Backend - CORS FIXED ✅',
    timestamp: new Date().toISOString(),
    cors: {
      allowOrigin: '*',
      allowMethods: 'ALL',
      allowHeaders: 'ALL'
    }
  });
});

// Test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful!',
    frontend: 'Should work from any origin',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 SERVER STARTED - CORS FIXED');
  console.log(`📍 Port: ${PORT}`);
  console.log('📍 CORS: ALLOWING ALL ORIGINS (*)');
  console.log('📍 Test: curl -H "Origin: https://example.com" http://localhost:' + PORT + '/api/health');
});
