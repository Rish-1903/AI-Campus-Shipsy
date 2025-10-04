#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const readline = require('readline');

// Configuration
const API_BASE = 'http://localhost:5000/api';

program
  .name('ai-campus-cli')
  .description('AI-powered CLI for Task Management')
  .version('1.0.0');

// Login command
program
  .command('login')
  .description('Login to the system')
  .requiredOption('-u, --username <username>', 'Your username')
  .requiredOption('-p, --password <password>', 'Your password')
  .action(async (options) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: options.username,
        password: options.password
      });
      
      console.log('✅ Login successful!');
      console.log(`Welcome, ${response.data.user.username}!`);
      console.log(`Token: ${response.data.token}`);
      
      // Save token for future use (in a real app, use secure storage)
      // This is simplified for demonstration
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.error || error.message);
    }
  });

// Task management commands
program
  .command('tasks')
  .description('List tasks with optional filtering')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-u, --urgent', 'Show only urgent tasks')
  .option('--page <page>', 'Page number', '1')
  .option('--limit <limit>', 'Items per page', '5')
  .action(async (options) => {
    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.priority) params.append('priority', options.priority);
      if (options.urgent) params.append('is_urgent', 'true');
      params.append('page', options.page);
      params.append('limit', options.limit);

      // In a real app, use stored token
      const response = await axios.get(`${API_BASE}/tasks?${params}`);
      const { tasks, pagination } = response.data;

      console.log(`\n📋 Tasks (Page ${pagination.page} of ${pagination.pages})`);
      console.log('=' .repeat(80));
      
      tasks.forEach(task => {
        const urgent = task.is_urgent ? '🚨 ' : '';
        const statusIcon = {
          'pending': '⏳',
          'in_progress': '🔄', 
          'completed': '✅'
        }[task.status];
        
        console.log(`${urgent}${statusIcon} ${task.title}`);
        console.log(`   ID: ${task.id} | Priority: ${task.priority} | Status: ${task.status}`);
        console.log(`   Estimated: ${task.estimated_hours}h | Actual: ${task.actual_hours}h`);
        console.log(`   Efficiency: ${task.efficiency_ratio.toFixed(2)}`);
        if (task.due_date) console.log(`   Due: ${task.due_date}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error fetching tasks:', error.response?.data?.error || error.message);
    }
  });

// Create task command
program
  .command('create')
  .description('Create a new task interactively')
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question) => new Promise(resolve => {
      rl.question(question, resolve);
    });

    try {
      console.log('\n🎯 Create New Task');
      console.log('=' .repeat(40));
      
      const title = await askQuestion('Title: ');
      const description = await askQuestion('Description: ');
      const status = await askQuestion('Status (pending/in_progress/completed) [pending]: ') || 'pending';
      const priority = await askQuestion('Priority (low/medium/high) [medium]: ') || 'medium';
      const isUrgent = (await askQuestion('Is urgent? (y/N) [N]: ')).toLowerCase() === 'y';
      const estimatedHours = await askQuestion('Estimated hours [1]: ') || '1';
      const dueDate = await askQuestion('Due date (YYYY-MM-DD) [optional]: ');

      const taskData = {
        title,
        description,
        status,
        priority,
        is_urgent: isUrgent,
        estimated_hours: parseFloat(estimatedHours),
        due_date: dueDate || undefined
      };

      // In a real app, use stored token
      const response = await axios.post(`${API_BASE}/tasks`, taskData);
      
      console.log('\n✅ Task created successfully!');
      console.log(`Task ID: ${response.data.id}`);
      
    } catch (error) {
      console.error('❌ Error creating task:', error.response?.data?.error || error.message);
    } finally {
      rl.close();
    }
  });

// AI Analysis command
program
  .command('analyze')
  .description('Get AI-powered analysis of your tasks')
  .action(async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks?limit=100`);
      const tasks = response.data.tasks;

      // Simple analysis (in a real app, integrate with Gemini API)
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const urgentTasks = tasks.filter(t => t.is_urgent).length;
      const avgEfficiency = tasks.length > 0 
        ? tasks.reduce((sum, t) => sum + t.efficiency_ratio, 0) / tasks.length 
        : 0;

      console.log('\n🤖 AI Task Analysis');
      console.log('=' .repeat(40));
      console.log(`📊 Total Tasks: ${totalTasks}`);
      console.log(`✅ Completed: ${completedTasks} (${Math.round(completedTasks/totalTasks*100)}%)`);
      console.log(`🚨 Urgent: ${urgentTasks}`);
      console.log(`📈 Average Efficiency: ${avgEfficiency.toFixed(2)}`);
      
      if (urgentTasks > 0) {
        console.log('\n⚠️  You have urgent tasks that need attention!');
      }
      
      if (avgEfficiency < 0.8) {
        console.log('💡 Tip: Try to improve your time estimation accuracy');
      }
      
    } catch (error) {
      console.error('❌ Error analyzing tasks:', error.response?.data?.error || error.message);
    }
  });

program.parse();
