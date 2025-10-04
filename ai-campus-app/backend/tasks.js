const express = require('express');
const router = express.Router();
const db = require('./database');
const { authenticateToken } = require('./auth');

// GET /tasks - Get all tasks with pagination and filtering
router.get('/', authenticateToken, (req, res) => {
  const { 
    page = 1, 
    limit = 5, 
    status, 
    priority, 
    is_urgent,
    search 
  } = req.query;
  
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE user_id = ?';
  let params = [req.user.userId];

  // Build filter conditions
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    whereClause += ' AND priority = ?';
    params.push(priority);
  }
  if (is_urgent !== undefined) {
    whereClause += ' AND is_urgent = ?';
    params.push(is_urgent === 'true' ? 1 : 0);
  }
  if (search) {
    whereClause += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Get total count for pagination
  db.get(`SELECT COUNT(*) as total FROM tasks ${whereClause}`, params, (err, countResult) => {
    if (err) {
      console.error('Database error in count:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get paginated tasks
    const query = `
      SELECT * FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    db.all(query, [...params, parseInt(limit), parseInt(offset)], (err, tasks) => {
      if (err) {
        console.error('Database error in select:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// GET /tasks/:id - Get single task
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', 
    [id, req.user.userId], (err, task) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    });
});

// POST /tasks - Create new task
router.post('/', authenticateToken, (req, res) => {
  const { 
    title, 
    description, 
    status = 'pending', 
    priority = 'medium',
    is_urgent = false,
    estimated_hours = 1,
    actual_hours = 0,
    due_date 
  } = req.body;

  // Validate required fields
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO tasks (
      title, description, status, priority, is_urgent, 
      estimated_hours, actual_hours, due_date, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    title.trim(), 
    description ? description.trim() : null, 
    status, 
    priority, 
    is_urgent ? 1 : 0,
    estimated_hours, 
    actual_hours, 
    due_date, 
    req.user.userId
  ], function(err) {
    if (err) {
      console.error('Database error in insert:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
    
    // Return the created task
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
      if (err) {
        console.error('Database error in select after insert:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(task);
    });
  });
});

// PUT /tasks/:id - Update task
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { 
    title, description, status, priority, is_urgent,
    estimated_hours, actual_hours, due_date 
  } = req.body;

  // Check if task exists and belongs to user
  db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', 
    [id, req.user.userId], (err, task) => {
      if (err) {
        console.error('Database error in select:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const query = `
        UPDATE tasks SET 
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          is_urgent = COALESCE(?, is_urgent),
          estimated_hours = COALESCE(?, estimated_hours),
          actual_hours = COALESCE(?, actual_hours),
          due_date = COALESCE(?, due_date),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      db.run(query, [
        title ? title.trim() : null, 
        description !== undefined ? description.trim() : null, 
        status, 
        priority, 
        is_urgent !== undefined ? (is_urgent ? 1 : 0) : null,
        estimated_hours, 
        actual_hours, 
        due_date,
        id, 
        req.user.userId
      ], function(err) {
        if (err) {
          console.error('Database error in update:', err);
          return res.status(500).json({ error: 'Failed to update task' });
        }

        // Return updated task
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedTask) => {
          if (err) {
            console.error('Database error in select after update:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(updatedTask);
        });
      });
    });
});

// DELETE /tasks/:id - Delete task
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if task exists and belongs to user
  db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', 
    [id, req.user.userId], (err, task) => {
      if (err) {
        console.error('Database error in select:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', 
        [id, req.user.userId], function(err) {
          if (err) {
            console.error('Database error in delete:', err);
            return res.status(500).json({ error: 'Failed to delete task' });
          }
          res.json({ message: 'Task deleted successfully' });
        });
    });
});

module.exports = router;
