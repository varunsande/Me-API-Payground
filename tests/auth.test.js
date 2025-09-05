import request from 'supertest';
import app from '../server.js';

describe('Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'password'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('admin');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin'
        })
        .expect(400);

      expect(response.body.error).toBe('Username and password are required');
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should return 400 with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Protected routes', () => {
    it('should allow GET requests without authentication', async () => {
      await request(app)
        .get('/api/profile')
        .expect(404); // 404 because no profile exists, not 401
    });

    it('should require authentication for POST requests', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        })
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should require authentication for PUT requests', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        })
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should require authentication for DELETE requests', async () => {
      const response = await request(app)
        .delete('/api/profile')
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });
  });
});
