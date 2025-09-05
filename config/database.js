module.exports = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_TLK2wtik6HBD@ep-summer-band-adz4qwsy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001'
};
