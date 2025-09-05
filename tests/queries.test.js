import request from 'supertest';
import app from '../server.js';
import { prisma } from './setup.js';

describe('Query API', () => {
  beforeEach(async () => {
    // Create test data
    const profile = await prisma.profile.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        education: 'Computer Science',
        skills: {
          create: [
            { skillName: 'JavaScript', proficiencyLevel: 5 },
            { skillName: 'Python', proficiencyLevel: 4 },
            { skillName: 'Node.js', proficiencyLevel: 4 }
          ]
        },
        projects: {
          create: [
            {
              title: 'JavaScript Project',
              description: 'A project built with JavaScript',
              links: [{ name: 'GitHub', url: 'https://github.com/js-project' }]
            },
            {
              title: 'Python Project',
              description: 'A project built with Python',
              links: [{ name: 'GitHub', url: 'https://github.com/python-project' }]
            }
          ]
        },
        workExperience: {
          create: [
            {
              company: 'Tech Corp',
              position: 'Developer',
              startDate: '2023-01',
              endDate: '2024-01',
              description: 'Worked on web applications'
            }
          ]
        }
      }
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter projects by skill', async () => {
      const response = await request(app)
        .get('/api/projects?skill=JavaScript')
        .expect(200);

      expect(response.body.projects).toHaveLength(1);
      expect(response.body.projects[0].title).toBe('JavaScript Project');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/projects?limit=1&offset=0')
        .expect(200);

      expect(response.body.projects).toHaveLength(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/skills/top', () => {
    it('should return top skills', async () => {
      const response = await request(app)
        .get('/api/skills/top')
        .expect(200);

      expect(response.body.skills).toHaveLength(3);
      expect(response.body.skills[0].name).toBeDefined();
      expect(response.body.skills[0].frequency).toBeDefined();
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/skills/top?limit=2')
        .expect(200);

      expect(response.body.skills).toHaveLength(2);
    });
  });

  describe('GET /api/search', () => {
    it('should search across all data', async () => {
      const response = await request(app)
        .get('/api/search?q=JavaScript')
        .expect(200);

      expect(response.body.query).toBe('JavaScript');
      expect(response.body.results).toBeDefined();
    });

    it('should search specific types', async () => {
      const response = await request(app)
        .get('/api/search?q=JavaScript&type=projects')
        .expect(200);

      expect(response.body.results.projects).toHaveLength(1);
      expect(response.body.results.profiles).toHaveLength(0);
    });

    it('should return 400 for empty query', async () => {
      const response = await request(app)
        .get('/api/search?q=')
        .expect(400);

      expect(response.body.error).toContain('Search query is required');
    });
  });

  describe('GET /api/skills', () => {
    it('should return all skills', async () => {
      const response = await request(app)
        .get('/api/skills')
        .expect(200);

      expect(response.body.skills).toHaveLength(3);
    });

    it('should filter by profile_id', async () => {
      const profile = await prisma.profile.findFirst();
      const response = await request(app)
        .get(`/api/skills?profile_id=${profile.id}`)
        .expect(200);

      expect(response.body.skills).toHaveLength(3);
    });
  });

  describe('GET /api/stats', () => {
    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.total_profiles).toBe(1);
      expect(response.body.total_projects).toBe(2);
      expect(response.body.unique_skills).toBe(3);
      expect(response.body.total_work_experience).toBe(1);
      expect(response.body.topSkills).toBeDefined();
    });
  });
});
