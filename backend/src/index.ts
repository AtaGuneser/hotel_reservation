import 'reflect-metadata'
import express from 'express'
import { useExpressServer, Action, RoutingControllersOptions, useContainer } from 'routing-controllers'
import { Container } from 'typedi'
import { RoomController } from './controllers/RoomController'
import { UserController } from './controllers/UserController'
import { RoomService } from './services/RoomService'
import { UserService } from './services/UserService'
import cors from 'cors'
import { logger } from './utils/logger'
import { JwtPayload } from './middleware/auth.middleware'
import jwt from 'jsonwebtoken'
import { jwtConfig } from './config/jwt.config'

// Burada container'ı ayarlıyoruz - ÖNEMLİ!
useContainer(Container);

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize and connect services
async function initializeServices() {
  logger.info('Initializing services...')
  
  const roomService = Container.get(RoomService)
  await roomService.connect()
  
  const userService = Container.get(UserService)
  await userService.connect()
  
  logger.info('Services initialized successfully')
}

// Authentication function for routing-controllers
const authorizationChecker = async (action: Action, roles: string[]) => {
  try {
    // Get the authorization header
    const authHeader = action.request.headers.authorization
    
    if (!authHeader) {
      return false
    }
    
    // Check if it's Bearer token
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return false
    }
    
    const token = parts[1]
    
    // Verify token with Buffer.from
    const decoded = jwt.verify(token, Buffer.from(jwtConfig.secret)) as JwtPayload
    
    // If roles are specified, check if user has the required role
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

// Current user extractor for routing-controllers
const currentUserChecker = async (action: Action) => {
  try {
    const authHeader = action.request.headers.authorization
    
    if (!authHeader) {
      return null
    }
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }
    
    const token = parts[1]
    
    // Verify token with Buffer.from
    return jwt.verify(token, Buffer.from(jwtConfig.secret)) as JwtPayload
  } catch (error) {
    return null
  }
}

// Setup routing-controllers
const routingControllersOptions: RoutingControllersOptions = {
  controllers: [RoomController, UserController],
  routePrefix: '',
  validation: true,
  classTransformer: true,
  defaultErrorHandler: false,
  authorizationChecker,
  currentUserChecker
}

// Start the server
async function startServer() {
  try {
    await initializeServices()
    
    useExpressServer(app, routingControllersOptions)
    
    // Custom error handler middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Global error handler:', err)
      
      const status = err.httpCode || err.status || 500
      const message = err.message || 'Something went wrong'
      
      res.status(status).json({
        status,
        message,
        errors: err.errors || []
      })
    })
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
