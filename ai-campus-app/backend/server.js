const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// NUCLEAR CORS FIX - Allow everything
app.use(cors({
  origin: '*', // Allow ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Requested-With']
}));

// Manual CORS headers as backup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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
  console.log('❌ AI routes not found');
  aiRoutes = express.Router();
  aiRoutes.get('/test', (req, res) => {
    res.json({ message: 'AI endpoint' });
  });
}

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Campus Assignment API - CORS FIXED',
    timestamp: new Date().toISOString(),
    cors: 'enabled-all-origins'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Campus Backend - CORS FIXED',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET/POST /api/tasks',
      'GET /api/ai/analysis'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS: ENABLED FOR ALL ORIGINS (*)`);
  console.log(`📍 Test: curl https://localhost:${PORT}/api/health`);
});
