import 'reflect-metadata'
import express from 'express'
import { useExpressServer } from 'routing-controllers'
import { createExpressServer } from 'routing-controllers'
import { UserController } from './controllers/UserController'

const app = express()
const port = process.env.PORT || 3000

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
  console.log(`Server is running on port ${port}`)
})
