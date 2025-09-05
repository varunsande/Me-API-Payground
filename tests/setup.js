import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Create a test database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Clean up database before each test
beforeEach(async () => {
  await prisma.workExperience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
});

// Clean up database after all tests
afterAll(async () => {
  await prisma.workExperience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.$disconnect();
});

export { prisma };
