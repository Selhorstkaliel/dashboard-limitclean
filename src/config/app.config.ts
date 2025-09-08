import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  
  // File uploads
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ],
  
  // Email
  mailFrom: process.env.MAIL_FROM || 'noreply@example.com',
  smtpUrl: process.env.SMTP_URL,
  
  // Admin defaults
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'kalielselhorst@example.com',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Kaskolk14',
}));