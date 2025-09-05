#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Me-API Playground...\n');

// Check if .env file exists, if not create it
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database
DATABASE_URL="postgresql://neondb_owner:npg_TLK2wtik6HBD@ep-summer-band-adz4qwsy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3001
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

try {
  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');

  console.log('\n🔧 Generating Prisma client...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  console.log('\n🗄️ Pushing database schema...');
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed');

  console.log('\n🌱 Seeding database...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded');

  console.log('\n🧪 Running tests...');
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ All tests passed');
  } catch (error) {
    console.log('⚠️ Some tests failed, but continuing with setup');
  }

  console.log('\n🔍 Running linter...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Code linting passed');
  } catch (error) {
    console.log('⚠️ Linting issues found, but continuing with setup');
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\nTo start the development server, run:');
  console.log('  npm run dev');
  console.log('\nTo start the production server, run:');
  console.log('  npm start');
  console.log('\nThe application will be available at:');
  console.log('  Frontend: http://localhost:3000');
  console.log('  API: http://localhost:3000/api');
  console.log('  Health Check: http://localhost:3000/health');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
