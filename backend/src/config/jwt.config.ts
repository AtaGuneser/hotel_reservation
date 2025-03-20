export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: process.env.JWT_ISSUER || 'hotel-reservation-api',
  audience: process.env.JWT_AUDIENCE || 'hotel-reservation-client'
} 