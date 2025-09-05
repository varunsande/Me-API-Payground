# Me-API Playground

A personal API playground for managing candidate profile data with CRUD operations, search functionality, and query endpoints.

## 🚀 Live Demo

- **Frontend**: [https://me-api-playground.vercel.app](https://me-api-playground.vercel.app)
- **API Base URL**: [https://me-api-playground.vercel.app/api](https://me-api-playground.vercel.app/api)
- **Health Check**: [https://me-api-playground.vercel.app/health](https://me-api-playground.vercel.app/health)

## 📋 Features

### Backend & API
- ✅ **Profile Management**: Create, read, update, delete profile information
- ✅ **Query Endpoints**: Search by skill, get top skills, general search
- ✅ **Health Check**: GET /health endpoint for liveness
- ✅ **Authentication**: JWT-based authentication for write operations
- ✅ **Rate Limiting**: Multiple rate limiters for different operations
- ✅ **Input Validation**: Comprehensive validation with express-validator
- ✅ **Error Handling**: Centralized error handling with custom error classes
- ✅ **Logging**: Winston-based logging with multiple transports
- ✅ **Pagination**: Proper pagination for all list endpoints
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **CORS Configuration**: Properly configured for frontend integration

### Database
- ✅ **PostgreSQL Database**: Production-ready database hosted on Neon
- ✅ **Prisma ORM**: Type-safe database access and migrations
- ✅ **Normalized Schema**: Proper relationships and foreign keys
- ✅ **Indexes**: Optimized for query performance
- ✅ **Seed Data**: Real profile data included

### Frontend
- ✅ **Minimal UI**: Clean, responsive interface
- ✅ **Search Functionality**: Search across profiles, projects, skills, work experience
- ✅ **Skill Filtering**: Filter projects by specific skills
- ✅ **Real-time Stats**: Display profile statistics
- ✅ **API Integration**: Calls hosted API with CORS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (HTML/CSS/JS) │◄──►│   (Express.js)  │◄──►│   (Neon + Prisma)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator
- **Logging**: Winston, Morgan
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel

## 📊 Database Schema

### Tables

#### `profiles`
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `education` (TEXT)
- `github_url` (TEXT)
- `linkedin_url` (TEXT)
- `portfolio_url` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `skills`
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY)
- `skill_name` (TEXT, NOT NULL)
- `proficiency_level` (INTEGER, DEFAULT 1)
- `created_at` (DATETIME)

#### `projects`
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `links` (TEXT, JSON format)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `work_experience`
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY)
- `company` (TEXT, NOT NULL)
- `position` (TEXT, NOT NULL)
- `start_date` (TEXT)
- `end_date` (TEXT)
- `description` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Indexes
- `idx_skills_name` on `skills(skill_name)`
- `idx_skills_profile` on `skills(profile_id)`
- `idx_projects_profile` on `projects(profile_id)`
- `idx_work_profile` on `work_experience(profile_id)`

## 🚀 Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/anshumohanacharya/me-api-playground.git
   cd me-api-playground
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```
   This will automatically:
   - Install dependencies
   - Generate Prisma client
   - Push database schema to Neon PostgreSQL
   - Seed the database with sample data

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

### Production Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

## 📚 API Documentation

### Base URL
```
https://me-api-playground.vercel.app/api
```

### Endpoints

#### Profile Management

**GET /api/profile**
- Get complete profile information including skills, projects, and work experience
- Response: Profile object with all related data

**POST /api/profile**
- Create a new profile
- Body: Profile data (name, email, education, skills, projects, workExperience, links)
- Response: Success message with profile ID

**PUT /api/profile**
- Update existing profile
- Body: Updated profile data
- Response: Success message

**DELETE /api/profile**
- Delete profile and all related data
- Response: Success message

#### Query Endpoints

**GET /api/projects?skill=python**
- Get projects filtered by skill
- Query Parameters:
  - `skill` (optional): Filter by skill name
  - `limit` (optional): Number of results (default: 10)
  - `offset` (optional): Pagination offset (default: 0)

**GET /api/skills/top?limit=10**
- Get top skills by frequency
- Query Parameters:
  - `limit` (optional): Number of top skills (default: 10)

**GET /api/search?q=javascript&type=all**
- General search across all data
- Query Parameters:
  - `q` (required): Search query
  - `type` (optional): Search type (all, profiles, projects, skills, work)
  - `limit` (optional): Number of results (default: 20)
  - `offset` (optional): Pagination offset (default: 0)

**GET /api/skills**
- Get all skills
- Query Parameters:
  - `profile_id` (optional): Filter by profile ID

**GET /api/stats**
- Get profile statistics
- Response: Counts of profiles, projects, skills, work experience

#### Authentication

**POST /api/auth/login**
- Login to get authentication token
- Body: { username, password }
- Response: JWT token and user information

#### Health Check

**GET /health**
- Health check endpoint
- Response: Server status and uptime

#### API Documentation

**GET /api-docs**
- Interactive API documentation
- Swagger UI interface for testing endpoints

## 🧪 Sample API Calls

### Using cURL

```bash
# Health check
curl https://me-api-playground.vercel.app/health

# Login to get token
curl -X POST https://me-api-playground.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Get profile (no auth required)
curl https://me-api-playground.vercel.app/api/profile

# Create profile (auth required)
curl -X POST https://me-api-playground.vercel.app/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Search for JavaScript projects
curl "https://me-api-playground.vercel.app/api/search?q=javascript&type=projects"

# Get projects by skill
curl "https://me-api-playground.vercel.app/api/projects?skill=python"

# Get top skills
curl https://me-api-playground.vercel.app/api/skills/top

# Get statistics
curl https://me-api-playground.vercel.app/api/stats

# API Documentation
curl https://me-api-playground.vercel.app/api-docs
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Me-API Playground",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/profile",
          "host": ["{{base_url}}"],
          "path": ["api", "profile"]
        }
      }
    },
    {
      "name": "Search Projects",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/search?q=javascript&type=projects",
          "host": ["{{base_url}}"],
          "path": ["api", "search"],
          "query": [
            {"key": "q", "value": "javascript"},
            {"key": "type", "value": "projects"}
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://me-api-playground.vercel.app"
    }
  ]
}
```

## 📄 Resume

**Anshu Mohan Acharya**
- **Email**: anshumohanacharya@gmail.com
- **GitHub**: [https://github.com/anshumohanacharya](https://github.com/anshumohanacharya)
- **LinkedIn**: [https://linkedin.com/in/anshumohanacharya](https://linkedin.com/in/anshumohanacharya)
- **Portfolio**: [https://anshumohanacharya.dev](https://anshumohanacharya.dev)

## 🔧 Known Limitations

1. **Single Profile**: Currently supports only one profile per database instance
2. **Basic Auth**: Simple username/password authentication (not production-ready)
3. **In-Memory Users**: User store is in-memory (should use database in production)
4. **Database Connection**: Requires stable internet connection for Neon PostgreSQL
5. **Rate Limiting**: Basic rate limiting (could be enhanced with Redis)

## 🚀 Future Enhancements

- [x] Multi-user support with authentication
- [x] PostgreSQL support for production
- [x] API versioning
- [x] Comprehensive test suite
- [x] API documentation with Swagger
- [x] Logging and monitoring
- [x] Docker containerization
- [x] CI/CD pipeline
- [ ] Redis for caching and rate limiting
- [ ] Database user management
- [ ] OAuth2/OpenID Connect integration
- [ ] Real-time notifications with WebSockets
- [ ] File upload for profile images
- [ ] Advanced search with Elasticsearch
- [ ] API analytics and monitoring
- [ ] GraphQL API
- [ ] Microservices architecture

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ by Anshu Mohan Acharya**
