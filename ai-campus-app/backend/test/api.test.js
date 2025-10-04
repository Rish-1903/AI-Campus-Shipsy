const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Task Management API', () => {
  let authToken;
  let testTaskId;

  beforeAll(async () => {
    // Clean up test data
    db.run('DELETE FROM users WHERE username LIKE "test%"');
    db.run('DELETE FROM tasks WHERE title LIKE "Test%"');
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'testpass123',
          email: 'test@example.com'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
    });

    it('should login user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high',
          estimated_hours: 2
        });
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Task');
      testTaskId = response.body.id;
    });

    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          actual_hours: 1.5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.actual_hours).toBe(1.5);
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });
  });
});
