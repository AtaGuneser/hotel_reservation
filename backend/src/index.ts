import 'reflect-metadata'
import express from 'express'
import { useExpressServer, useContainer } from 'routing-controllers'
import { createExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import { UserController } from './controllers/UserController'
import dotenv from 'dotenv'
import path from 'path'
import { DatabaseManager } from './config/database'

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

// Enable dependency injection
useContainer(Container)

// Create express app with routing-controllers
const expressApp = createExpressServer({
  controllers: [UserController], // Add your controllers here
  middlewares: [], // Add your middlewares here
  defaultErrorHandler: false
})

// Middleware
expressApp.use(express.json())

// Connect to MongoDB and start server
const dbManager = DatabaseManager.getInstance()

dbManager
  .connect()
  .then(() => {
    expressApp.listen(port, () => {
      console.log(`Server is running on port ${port} in ${nodeEnv} mode`)
    })
  })
  .catch(error => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
