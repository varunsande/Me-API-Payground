import express from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { validateQuery, paginate } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get projects filtered by skill
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter projects by skill name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of projects to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of projects to skip
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects', validateQuery, paginate, asyncHandler(async (req, res) => {
  const { skill } = req.query;
  const { limit, offset } = req.pagination;

  logger.info('Fetching projects', { 
    skill, 
    limit, 
    offset, 
    ip: req.ip 
  });

  const whereClause = skill ? {
    profile: {
      skills: {
        some: {
          skillName: {
            contains: skill,
            mode: 'insensitive'
          }
        }
      }
    }
  } : {};

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        profile: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.project.count({ where: whereClause })
  ]);

  // Transform the data
  const transformedProjects = projects.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description,
    links: project.links || [],
    created_at: project.createdAt,
    profile_name: project.profile.name
  }));

  logger.info('Projects fetched successfully', { 
    count: transformedProjects.length, 
    totalCount,
    skill 
  });

  res.json({
    projects: transformedProjects,
    pagination: {
      limit,
      offset,
      total: totalCount,
      hasMore: offset + limit < totalCount
    }
  });
}));

/**
 * @swagger
 * /api/skills/top:
 *   get:
 *     summary: Get top skills by frequency
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of top skills to return
 *     responses:
 *       200:
 *         description: Top skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       frequency:
 *                         type: integer
 *                       averageProficiency:
 *                         type: number
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/skills/top', validateQuery, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  logger.info('Fetching top skills', { 
    limit, 
    ip: req.ip 
  });

  const skills = await prisma.skill.groupBy({
    by: ['skillName'],
    _count: {
      skillName: true
    },
    _avg: {
      proficiencyLevel: true
    },
    orderBy: {
      _count: {
        skillName: 'desc'
      }
    },
    take: Math.min(parseInt(limit), 50)
  });

  const transformedSkills = skills.map(skill => ({
    name: skill.skillName,
    frequency: skill._count.skillName,
    averageProficiency: Math.round((skill._avg.proficiencyLevel || 0) * 10) / 10
  }));

  logger.info('Top skills fetched successfully', { 
    count: transformedSkills.length 
  });

  res.json({
    skills: transformedSkills
  });
}));

// GET /api/search?q=... - General search across profile data
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = q.trim();
    const results = {
      profiles: [],
      projects: [],
      skills: [],
      workExperience: []
    };

    if (type === 'all' || type === 'profiles') {
      const profiles = await prisma.profile.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { education: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          education: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      results.profiles = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        education: profile.education,
        github_url: profile.githubUrl,
        linkedin_url: profile.linkedinUrl,
        portfolio_url: profile.portfolioUrl
      }));
    }

    if (type === 'all' || type === 'projects') {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
      
      results.projects = projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        links: project.links || [],
        created_at: project.createdAt
      }));
    }

    if (type === 'all' || type === 'skills') {
      const skills = await prisma.skill.findMany({
        where: {
          skillName: { contains: searchTerm, mode: 'insensitive' }
        },
        orderBy: { proficiencyLevel: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
      
      results.skills = skills.map(skill => ({
        skill_name: skill.skillName,
        proficiency_level: skill.proficiencyLevel
      }));
    }

    if (type === 'all' || type === 'work') {
      const workExperience = await prisma.workExperience.findMany({
        where: {
          OR: [
            { company: { contains: searchTerm, mode: 'insensitive' } },
            { position: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { startDate: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
      
      results.workExperience = workExperience.map(work => ({
        id: work.id,
        company: work.company,
        position: work.position,
        start_date: work.startDate,
        end_date: work.endDate,
        description: work.description
      }));
    }

    res.json({
      query: q,
      type: type,
      results: results,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// GET /api/skills - Get all skills
router.get('/skills', async (req, res) => {
  try {
    const { profile_id } = req.query;

    const whereClause = profile_id ? { profileId: parseInt(profile_id) } : {};

    const skills = await prisma.skill.findMany({
      where: whereClause,
      orderBy: { skillName: 'asc' }
    });

    res.json({
      skills: skills.map(skill => ({
        name: skill.skillName,
        proficiency: skill.proficiencyLevel
      }))
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/stats - Get profile statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalProfiles, totalProjects, uniqueSkills, totalWorkExperience] = await Promise.all([
      prisma.profile.count(),
      prisma.project.count(),
      prisma.skill.groupBy({
        by: ['skillName'],
        _count: { skillName: true }
      }).then(result => result.length),
      prisma.workExperience.count()
    ]);

    const topSkills = await prisma.skill.groupBy({
      by: ['skillName'],
      _count: { skillName: true },
      orderBy: { _count: { skillName: 'desc' } },
      take: 5
    });

    res.json({
      total_profiles: totalProfiles,
      total_projects: totalProjects,
      unique_skills: uniqueSkills,
      total_work_experience: totalWorkExperience,
      topSkills: topSkills.map(skill => ({
        name: skill.skillName,
        frequency: skill._count.skillName
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
