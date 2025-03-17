import dotenv from 'dotenv'

dotenv.config()

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  environment: process.env.NODE_ENV || 'development'
}
