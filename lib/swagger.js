import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Me-API Playground',
      version: '1.0.0',
      description: 'A personal API playground for managing candidate profile data with CRUD operations, search functionality, and query endpoints.',
      contact: {
        name: 'Anshu Mohan Acharya',
        email: 'anshumohanacharya@gmail.com',
        url: 'https://anshumohanacharya.dev'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            education: { type: 'string' },
            github_url: { type: 'string', format: 'uri' },
            linkedin_url: { type: 'string', format: 'uri' },
            portfolio_url: { type: 'string', format: 'uri' },
            skills: {
              type: 'array',
              items: { type: 'string' }
            },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' }
            },
            workExperience: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkExperience' }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  url: { type: 'string', format: 'uri' }
                }
              }
            },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        WorkExperience: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            company: { type: 'string' },
            position: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'array', items: { type: 'string' } }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

export default specs;
