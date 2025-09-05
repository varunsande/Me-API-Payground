import express from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { validateProfile, paginate } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { writeLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get profile information
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
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
router.get('/', asyncHandler(async (req, res) => {
  logger.info('Fetching profiles', { ip: req.ip, userAgent: req.get('User-Agent') });

  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      skills: true,
      projects: true,
      workExperience: {
        orderBy: { startDate: 'desc' }
      }
    }
  });

  if (profiles.length === 0) {
    throw new AppError('No profiles found', 404, 'PROFILES_NOT_FOUND');
  }

  // Transform the data to match the expected format
  const transformedProfiles = profiles.map(profile => ({
    ...profile,
    github_url: profile.githubUrl,
    linkedin_url: profile.linkedinUrl,
    portfolio_url: profile.portfolioUrl,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
    skills: profile.skills.map(s => s.skillName),
    skillsWithLevel: profile.skills.map(s => ({
      skill_name: s.skillName,
      proficiency_level: s.proficiencyLevel
    })),
    projects: profile.projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      links: p.links || [],
      created_at: p.createdAt
    })),
    workExperience: profile.workExperience.map(w => ({
      id: w.id,
      company: w.company,
      position: w.position,
      start_date: w.startDate,
      end_date: w.endDate,
      description: w.description
    }))
  }));

  logger.info('Profiles fetched successfully', { count: profiles.length });
  res.json(transformedProfiles);
}));

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profileId:
 *                   type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
router.post('/', writeLimiter, validateProfile, asyncHandler(async (req, res) => {
  const { name, email, education, skills, projects, workExperience, github_url, linkedin_url, portfolio_url } = req.body;

  logger.info('Creating new profile', { 
    name, 
    email, 
    ip: req.ip
  });

  // Check if profile with same email already exists
  const existingProfile = await prisma.profile.findFirst({
    where: { email }
  });
  if (existingProfile) {
    throw new AppError('Profile with this email already exists. Use PUT to update.', 409, 'PROFILE_EXISTS');
  }

  // Create profile with related data in a transaction
  const profile = await prisma.profile.create({
    data: {
      name,
      email,
      education,
      githubUrl: github_url,
      linkedinUrl: linkedin_url,
      portfolioUrl: portfolio_url,
      skills: skills && Array.isArray(skills) ? {
        create: skills.map(skill => ({
          skillName: typeof skill === 'string' ? skill : skill.name,
          proficiencyLevel: typeof skill === 'string' ? 1 : (skill.level || 1)
        }))
      } : undefined,
      projects: projects && Array.isArray(projects) ? {
        create: projects.map(project => ({
          title: project.title,
          description: project.description,
          links: project.links || []
        }))
      } : undefined,
      workExperience: workExperience && Array.isArray(workExperience) ? {
        create: workExperience.map(work => ({
          company: work.company,
          position: work.position,
          startDate: work.start_date,
          endDate: work.end_date,
          description: work.description
        }))
      } : undefined
    }
  });

  logger.info('Profile created successfully', { 
    profileId: profile.id
  });

  res.status(201).json({ 
    message: 'Profile created successfully',
    profileId: profile.id
  });
}));

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update existing profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
router.put('/', writeLimiter, validateProfile, asyncHandler(async (req, res) => {
  const { name, email, education, skills, projects, workExperience, github_url, linkedin_url, portfolio_url } = req.body;

  logger.info('Updating profile', { 
    ip: req.ip
  });

  // Get existing profile
  const existingProfile = await prisma.profile.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!existingProfile) {
    throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  }

  // Update profile with related data in a transaction
  await prisma.$transaction(async (tx) => {
    // Update profile
    await tx.profile.update({
      where: { id: existingProfile.id },
      data: {
        name,
        email,
        education,
        githubUrl: github_url,
        linkedinUrl: linkedin_url,
        portfolioUrl: portfolio_url
      }
    });

    // Delete existing related data
    await tx.skill.deleteMany({
      where: { profileId: existingProfile.id }
    });
    await tx.project.deleteMany({
      where: { profileId: existingProfile.id }
    });
    await tx.workExperience.deleteMany({
      where: { profileId: existingProfile.id }
    });

    // Insert updated data
    if (skills && Array.isArray(skills)) {
      await tx.skill.createMany({
        data: skills.map(skill => ({
          profileId: existingProfile.id,
          skillName: typeof skill === 'string' ? skill : skill.name,
          proficiencyLevel: typeof skill === 'string' ? 1 : (skill.level || 1)
        }))
      });
    }

    if (projects && Array.isArray(projects)) {
      await tx.project.createMany({
        data: projects.map(project => ({
          profileId: existingProfile.id,
          title: project.title,
          description: project.description,
          links: project.links || []
        }))
      });
    }

    if (workExperience && Array.isArray(workExperience)) {
      await tx.workExperience.createMany({
        data: workExperience.map(work => ({
          profileId: existingProfile.id,
          company: work.company,
          position: work.position,
          startDate: work.start_date,
          endDate: work.end_date,
          description: work.description
        }))
      });
    }
  });

  logger.info('Profile updated successfully', { 
    profileId: existingProfile.id
  });

  res.json({ message: 'Profile updated successfully' });
}));

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
router.delete('/', writeLimiter, asyncHandler(async (req, res) => {
  logger.info('Deleting profile', { 
    ip: req.ip
  });

  const result = await prisma.profile.deleteMany({});
  
  if (result.count === 0) {
    throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  }

  logger.info('Profile deleted successfully', { 
    deletedCount: result.count
  });

  res.json({ message: 'Profile deleted successfully' });
}));

/**
 * @swagger
 * /api/profile/projects/{id}:
 *   delete:
 *     summary: Delete a specific project
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Project not found
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
router.delete('/projects/:id', writeLimiter, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID', 400, 'INVALID_PROJECT_ID');
  }

  logger.info('Deleting project', { projectId, ip: req.ip });

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  await prisma.project.delete({
    where: { id: projectId }
  });

  logger.info('Project deleted successfully', { projectId });
  res.json({ message: 'Project deleted successfully' });
}));

/**
 * @swagger
 * /api/profile/work-experience/{id}:
 *   delete:
 *     summary: Delete a specific work experience
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Work experience ID
 *     responses:
 *       200:
 *         description: Work experience deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Work experience not found
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
router.delete('/work-experience/:id', writeLimiter, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workId = parseInt(id);

  if (isNaN(workId)) {
    throw new AppError('Invalid work experience ID', 400, 'INVALID_WORK_ID');
  }

  logger.info('Deleting work experience', { workId, ip: req.ip });

  const work = await prisma.workExperience.findUnique({
    where: { id: workId }
  });

  if (!work) {
    throw new AppError('Work experience not found', 404, 'WORK_NOT_FOUND');
  }

  await prisma.workExperience.delete({
    where: { id: workId }
  });

  logger.info('Work experience deleted successfully', { workId });
  res.json({ message: 'Work experience deleted successfully' });
}));

export default router;
