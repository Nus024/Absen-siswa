import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback_secret_key_absen_v2',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
