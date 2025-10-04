const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database'); // Initialize database

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ai-campus-shipsy-2.onrender.com',
    'https://ai-campus-shipsy-utu2.vercel.app',
    'https://ai-campus-shipsy-*.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());

// Import routes
const { register, login } = require('./auth');
const tasksRouter = require('./tasks');
const aiRoutes = require('./routes/ai-routes'); // Add this line

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Task routes
app.use('/api/tasks', tasksRouter);

// AI routes - Add this section
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Campus Assignment API is running',
    timestamp: new Date().toISOString(),
    routes: {
      auth: ['/api/auth/register', '/api/auth/login'],
      tasks: ['/api/tasks', '/api/tasks/:id'],
      ai: ['/api/ai/analysis', '/api/ai/test']
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/ai/analysis',
      'GET /api/ai/test',
      'GET /api/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 AI Test: http://localhost:${PORT}/api/ai/test`);
  console.log(`📍 AI Analysis: http://localhost:${PORT}/api/ai/analysis`);
  console.log(`📍 Make sure 'routes/ai-routes.js' exists!`);
});
