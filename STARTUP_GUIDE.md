# 🚀 Me-API Playground - Startup Guide

## Prerequisites
- Node.js 18.x or higher
- npm or pnpm
- PostgreSQL database (Neon)

## Quick Start

### 1. Backend Setup

```bash
# Navigate to project directory
cd /Users/anshumohanacharya/Documents/Assignment

# Install dependencies
npm install

# Run setup script (installs deps, generates Prisma client, pushes schema, seeds DB)
npm run setup

# Start backend server
npm run dev
```

The backend will be available at:
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api-docs
- **Frontend**: http://localhost:3000 (basic HTML)

### 2. Frontend Setup (Optional - Modern Vite Frontend)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will be available at:
- **Frontend**: http://localhost:3001

## Manual Setup (Step by Step)

### Backend

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

3. **Push Database Schema**
   ```bash
   npm run db:push
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Frontend

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production preview

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (username: admin, password: password)

### Profile Management
- `GET /api/profile` - Get profile (no auth required)
- `POST /api/profile` - Create profile (auth required)
- `PUT /api/profile` - Update profile (auth required)
- `DELETE /api/profile` - Delete profile (auth required)

### Query Endpoints
- `GET /api/projects?skill=python` - Get projects by skill
- `GET /api/skills/top?limit=10` - Get top skills
- `GET /api/search?q=javascript` - Search across all data
- `GET /api/skills` - Get all skills
- `GET /api/stats` - Get statistics

### Health & Documentation
- `GET /health` - Health check
- `GET /api-docs` - Interactive API documentation

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
npm test -- tests/profile.test.js
npm test -- tests/auth.test.js
npm test -- tests/queries.test.js
```

## Authentication

### Default Credentials
- **Username**: admin
- **Password**: password

### Getting a Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

### Using the Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/profile
```

## Troubleshooting

### Common Issues

1. **"require is not defined" Error**
   - The project uses ES modules. Make sure all files use `import`/`export` syntax.

2. **Database Connection Error**
   - Check your `DATABASE_URL` environment variable
   - Ensure Neon database is accessible

3. **Port Already in Use**
   - Backend uses port 3000, frontend uses port 3001
   - Change ports in respective config files if needed

4. **Prisma Client Not Generated**
   - Run `npm run db:generate`

5. **Tests Failing**
   - Ensure database is accessible
   - Check test database URL

### Environment Variables

Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:npg_TLK2wtik6HBD@ep-summer-band-adz4qwsy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your-secret-key-change-in-production
```

## Production Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start with: `npm start`

## Features

✅ **Backend Features**
- JWT Authentication
- Rate Limiting
- Input Validation
- Error Handling
- Logging
- Pagination
- API Documentation
- Comprehensive Testing

✅ **Frontend Features**
- Modern Vite Setup
- Responsive Design
- Search Functionality
- Skill Filtering
- Real-time Stats
- API Integration

✅ **Database Features**
- PostgreSQL with Prisma ORM
- Normalized Schema
- Indexes for Performance
- Seed Data

## Support

For issues or questions:
- Check the logs in `logs/` directory
- Review API documentation at `/api-docs`
- Check test coverage reports
- Review the comprehensive README.md

---

**Happy Coding! 🎉**
