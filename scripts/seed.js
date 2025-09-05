import prisma from '../lib/prisma.js';

const profileData = {
  name: "Varun Sandesh",
  email: "varunsandeshtalluru@gmail.com",
  education: "BTech in Computer Science and Engineering",
  github_url: "https://github.com/varunsande",
  linkedin_url: "https://www.linkedin.com/in/talluru-varun-sandesh-2242362b5",
  portfolio_url: "N/A",
  skills: [
    { name: "JavaScript", level: 4 },
    { name: "Python", level: 4 },
    { name: "Node.js", level: 4 },
    { name: "React", level: 4 },
    { name: "Express.js", level: 4 },
    { name: "MongoDB", level: 3 },
    { name: "PostgreSQL", level: 4 },
    { name: "SQLite", level: 4 },
    { name: "Git", level: 3 },
    { name: "Docker", level: 4 },
    { name: "GCP", level: 4 },
    { name: "TypeScript", level: 3 },
    { name: "Next.js", level: 4 },
    { name: "REST APIs", level: 4 }
  ],
  projects: [
    {
      title: "Coaching Center Website",
      description: "Developed a responsive coaching center website featuring course listings, faculty profiles, student testimonials, online registration, and a contact page with integrated Google Maps for location assistance.",
      links: [
        { name: "GitHub", url: "https://github.com/varunsande/CodeT utorials.git" },
        { name: "Live Demo", url: "https://varunsande.github.io/Code_Tutorials/" }
      ]
    },
    {
      title: "Loan Prediction using Python",
      description: "Developed a machine learning-based loan prediction system in Google Colab to predict loan approval based on features like income, credit history, education, and loan amount. Involved data preprocessing, feature engineering, and model evaluation using popular ML libraries.",
      links: [
        { name: "GitHub", url: "https://github.com/varunsande/loan.git" },
        { name: "Live Demo", url: "https://colab.research.google.com/drive/1qS-c3EfWt0i_O3fR4r_F_CkN8j6G9X1Q?usp=sharing" }
      ]
    },
    {
      title: "Resume Generator Website",
      description: "Developed a Resume Generator Website that allows users to create and download professional resumes by inputting personal, educational, and work details. The site offers customizable templates and formats (chronological, functional, combination) with PDF download options, focusing on both front-end and back-end development for a seamless user experience.",
      links: [
        { name: "GitHub", url: "https://github.com/varunsande/Resume_Generator.git" },
        { name: "Live Demo", url: "https://varunsande.github.io/Resume_Generator/" }
      ]
    },
    {
      title: "Me-API Playground",
      description: "Personal API playground for managing candidate profile data with CRUD operations, search functionality, and query endpoints.",
      links: [
        { name: "GitHub", url: "https://github.com/anshumohanacharya/me-api-playground" },
        { name: "API Endpoint", url: "https://me-api.anshumohanacharya.dev" }
      ]
    }
  ],
  workExperience: [
    {
      company: "Tech Solutions Inc.",
      position: "Full Stack Developer",
      start_date: "2023-01",
      end_date: "2024-01",
      description: "Developed and maintained web applications using React, Node.js, and PostgreSQL. Implemented RESTful APIs and worked with cloud services including AWS."
    },
    {
      company: "StartupXYZ",
      position: "Frontend Developer",
      start_date: "2022-06",
      end_date: "2022-12",
      description: "Built responsive user interfaces using React and TypeScript. Collaborated with design team to implement pixel-perfect UI components and optimized application performance."
    },
    {
      company: "Freelance",
      position: "Web Developer",
      start_date: "2021-01",
      end_date: "2022-05",
      description: "Provided web development services to various clients. Built custom websites, e-commerce platforms, and web applications using modern JavaScript frameworks."
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await prisma.workExperience.deleteMany();
    await prisma.project.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.profile.deleteMany();

    // Create profile with all related data
    const profile = await prisma.profile.create({
      data: {
        name: profileData.name,
        email: profileData.email,
        education: profileData.education,
        githubUrl: profileData.github_url,
        linkedinUrl: profileData.linkedin_url,
        portfolioUrl: profileData.portfolio_url,
        skills: {
          create: profileData.skills.map(skill => ({
            skillName: skill.name,
            proficiencyLevel: skill.level
          }))
        },
        projects: {
          create: profileData.projects.map(project => ({
            title: project.title,
            description: project.description,
            links: project.links
          }))
        },
        workExperience: {
          create: profileData.workExperience.map(work => ({
            company: work.company,
            position: work.position,
            startDate: work.start_date,
            endDate: work.end_date,
            description: work.description
          }))
        }
      }
    });

    console.log(`Profile created with ID: ${profile.id}`);
    console.log(`Inserted ${profileData.skills.length} skills`);
    console.log(`Inserted ${profileData.projects.length} projects`);
    console.log(`Inserted ${profileData.workExperience.length} work experiences`);

    console.log('Database seeding completed successfully!');
    
    // Verify data
    const [profileCount, skillsCount, projectsCount, workCount] = await Promise.all([
      prisma.profile.count(),
      prisma.skill.count(),
      prisma.project.count(),
      prisma.workExperience.count()
    ]);

    console.log('\nVerification:');
    console.log(`Profiles: ${profileCount}`);
    console.log(`Skills: ${skillsCount}`);
    console.log(`Projects: ${projectsCount}`);
    console.log(`Work Experience: ${workCount}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase, profileData };
