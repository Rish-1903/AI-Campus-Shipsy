const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-campus-secret-key';

// Register new user
const register = async (req, res) => {
  const { username, password, email } = req.body;
  
  // Input validation
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // Check if user exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', 
      [username, email], async (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error occurred' });
        }
        if (row) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
          [username, hashedPassword, email], function(err) {
            if (err) {
              console.error('User creation error:', err);
              return res.status(500).json({ error: 'Failed to create user account' });
            }
            res.status(201).json({ 
              message: 'User created successfully',
              userId: this.lastID 
            });
          });
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Make sure all functions are exported
module.exports = { 
  register, 
  login, 
  authenticateToken 
};
