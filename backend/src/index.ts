import 'reflect-metadata'
import express from 'express'
import { useExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import { useContainer } from 'routing-controllers'
import { UserController } from './controllers/UserController'
import { RoomController } from './controllers/RoomController'
import { RoomService } from './services/RoomService'
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'
import { logger } from './utils/logger'
import { DatabaseManager } from './config/database'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

// Set up TypeDI container
useContainer(Container)

// Create express app
const app = express()

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Enable JSON body parsing
app.use(express.json())

// Setup routing-controllers
useExpressServer(app, {
  controllers: [RoomController, UserController],
  classTransformer: true,
  validation: true,
  defaultErrorHandler: false
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err)
  res.status(err.httpCode || 500).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  })
})

// Start the application
async function startServer() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...')
    const dbManager = DatabaseManager.getInstance()
    await dbManager.connect()
    
    // Initialize RoomService
    const roomService = Container.get(RoomService)
    await roomService.connect()
    
    // Start server after successful database connection
    app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${nodeEnv} mode`)
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Gracefully shutting down...')
      await dbManager.disconnect()
      process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
      logger.info('Gracefully shutting down...')
      await dbManager.disconnect()
      process.exit(0)
    })
  } catch (error) {
    logger.error('Server startup error:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
