import request from 'supertest';
import app from '../server.js';
import { prisma } from './setup.js';

describe('Profile API', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/profile', () => {
    it('should return 404 when no profile exists', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(404);

      expect(response.body.error).toBe('Profile not found');
      expect(response.body.code).toBe('PROFILE_NOT_FOUND');
    });

    it('should return profile when it exists', async () => {
      // Create a test profile
      await prisma.profile.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          education: 'Test Education',
          skills: {
            create: [
              { skillName: 'JavaScript', proficiencyLevel: 5 },
              { skillName: 'Node.js', proficiencyLevel: 4 }
            ]
          },
          projects: {
            create: [
              {
                title: 'Test Project',
                description: 'Test Description',
                links: [{ name: 'GitHub', url: 'https://github.com/test' }]
              }
            ]
          }
        }
      });

      const response = await request(app)
        .get('/api/profile')
        .expect(200);

      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.skills).toHaveLength(2);
      expect(response.body.projects).toHaveLength(1);
    });
  });

  describe('POST /api/profile', () => {
    it('should create a new profile with valid data', async () => {
      const profileData = {
        name: 'New User',
        email: 'newuser@example.com',
        education: 'Computer Science',
        skills: ['JavaScript', 'Python'],
        projects: [
          {
            title: 'New Project',
            description: 'New Description',
            links: [{ name: 'GitHub', url: 'https://github.com/new' }]
          }
        ]
      };

      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body.message).toBe('Profile created successfully');
      expect(response.body.profileId).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '', email: 'invalid-email' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/profile', () => {
    beforeEach(async () => {
      // Create a test profile for updates
      await prisma.profile.create({
        data: {
          name: 'Original User',
          email: 'original@example.com',
          education: 'Original Education'
        }
      });
    });

    it('should update existing profile', async () => {
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
        education: 'Updated Education'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should return 404 when no profile exists', async () => {
      // Delete the profile first
      await prisma.profile.deleteMany();

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(404);

      expect(response.body.error).toBe('Profile not found');
    });
  });

  describe('DELETE /api/profile', () => {
    beforeEach(async () => {
      // Create a test profile for deletion
      await prisma.profile.create({
        data: {
          name: 'Delete User',
          email: 'delete@example.com'
        }
      });
    });

    it('should delete existing profile', async () => {
      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Profile deleted successfully');
    });

    it('should return 404 when no profile exists', async () => {
      // Delete the profile first
      await prisma.profile.deleteMany();

      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Profile not found');
    });
  });
});
