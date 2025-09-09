import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => ({
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '30d',
  
  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-change-this-in-production-now!',
  rsaPrivateKey: process.env.RSA_PRIVATE_KEY,
  rsaPublicKey: process.env.RSA_PUBLIC_KEY,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
}));