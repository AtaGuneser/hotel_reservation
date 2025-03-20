import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/jwt.config'
import { UnauthorizedError } from 'routing-controllers'
import { logger } from '../utils/logger'

export interface JwtPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is missing')
    }

    const parts = authHeader.split(' ')
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>')
    }

    const token = parts[1]
    
    try {
      const payload = jwt.verify(token, jwtConfig.secret) as JwtPayload
      req.user = payload
      logger.debug(`Authenticated user: ${payload.email} (${payload.role})`)
      next()
    } catch (err) {
      logger.error('JWT verification failed', err)
      throw new UnauthorizedError('Invalid or expired token')
    }
  } catch (error) {
    next(error)
  }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'))
  }
  
  if (req.user.role !== 'admin') {
    return next(new UnauthorizedError('Admin role required'))
  }
  
  next()
} 