import 'reflect-metadata'
import express from 'express'
import { useExpressServer, useContainer } from 'routing-controllers'
import { createExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import { UserController } from './controllers/UserController'
import { RoomController } from './controllers/RoomController'
import { RoomService } from './services/RoomService'
import dotenv from 'dotenv'
import path from 'path'
import { MongoClient } from 'mongodb'
import cors from 'cors'
import { logger } from './utils/logger'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

// Enable dependency injection
useContainer(Container)

// Create express app with routing-controllers
const expressApp = createExpressServer({
  controllers: [RoomController, UserController],
  middlewares: [],
  defaultErrorHandler: false,
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})

expressApp.use(express.json())

// Error handling middleware
expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err)
  res.status(err.httpCode || 500).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  })
})

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
logger.info('Connecting to MongoDB...')

const client = new MongoClient(mongoURI)
client.connect()
  .then(async () => {
    logger.info('MongoDB Connected Successfully')
    
    // Initialize RoomService
    const roomService = Container.get(RoomService)
    await roomService.connect()
    
    // Start server after successful database connection
    expressApp.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${nodeEnv} mode`)
    })
  })
  .catch(error => {
    logger.error('MongoDB Connection Error:', error)
    process.exit(1)
  })
