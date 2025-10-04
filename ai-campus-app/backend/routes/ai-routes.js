const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const db = require('../database');

console.log('✅ AI Routes loaded successfully!');

// AI Analysis endpoint
router.get('/analysis', authenticateToken, (req, res) => {
  console.log('🔍 AI Analysis requested for user:', req.user.userId);
  
  db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.userId], (err, tasks) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`📊 Found ${tasks.length} tasks for analysis`);
    
    // Generate AI analysis with clean text formatting
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const urgent = tasks.filter(t => t.is_urgent).length;
    
    const analysis = `
AI TASK ANALYSIS REPORT

OVERVIEW
• Total Tasks: ${tasks.length}
• Completed: ${completed} (${Math.round((completed/tasks.length)*100)}%)
• In Progress: ${inProgress}
• Pending: ${pending}
• Urgent: ${urgent}

TIME MANAGEMENT
• Total Estimated: ${tasks.reduce((sum, t) => sum + t.estimated_hours, 0).toFixed(1)} hours
• Total Actual: ${tasks.reduce((sum, t) => sum + t.actual_hours, 0).toFixed(1)} hours
• Average Efficiency: ${tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.efficiency_ratio, 0) / tasks.length).toFixed(2) : 0}

PRIORITY BREAKDOWN
• High Priority: ${tasks.filter(t => t.priority === 'high').length}
• Medium Priority: ${tasks.filter(t => t.priority === 'medium').length}
• Low Priority: ${tasks.filter(t => t.priority === 'low').length}

RECOMMENDATIONS
• ${pending > 0 ? `Focus on completing ${pending} pending tasks` : 'Great! No pending tasks'}
• ${urgent > 0 ? `Address ${urgent} urgent tasks immediately` : 'No urgent tasks'}
• ${tasks.length > 0 ? 'Review time estimates for better accuracy' : 'Create your first task!'}
• Break large tasks into smaller, manageable steps

QUICK WINS
${tasks.slice(0, 3).map(task => `• "${task.title}" - ${task.status} (Efficiency: ${task.efficiency_ratio.toFixed(2)})`).join('\n')}
`.trim();

    res.json({ analysis });
  });
});

// Test endpoint to verify AI routes are working
router.get('/test', (req, res) => {
  console.log('✅ AI test endpoint hit');
  res.json({ 
    message: 'AI routes are working perfectly!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/ai/analysis - Get AI task analysis (requires auth)',
      'GET /api/ai/test - Test endpoint'
    ]
  });
});

module.exports = router;
