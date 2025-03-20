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

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
console.log('Connecting to MongoDB...')

const client = new MongoClient(mongoURI)
client.connect()
  .then(async () => {
    console.log('MongoDB Connected Successfully')
    
    // Initialize RoomService
    const roomService = Container.get(RoomService)
    await roomService.connect()
    
    // Start server after successful database connection
    expressApp.listen(port, () => {
      console.log(`Server is running on port ${port} in ${nodeEnv} mode`)
    })
  })
  .catch(error => {
    console.error('MongoDB Connection Error:', error)
    process.exit(1)
  })
