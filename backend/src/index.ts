import 'reflect-metadata'
import express from 'express'
import { useExpressServer } from 'routing-controllers'
import { createExpressServer } from 'routing-controllers'
import { UserController } from './controllers/UserController'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'development'

// Create express app with routing-controllers
const expressApp = createExpressServer({
  controllers: [UserController], // Add your controllers here
  middlewares: [], // Add your middlewares here
  defaultErrorHandler: false
})

// Middleware
expressApp.use(express.json())

// Start server
expressApp.listen(port, () => {
  console.log(`Server is running on port ${port} in ${nodeEnv} mode`)
})
