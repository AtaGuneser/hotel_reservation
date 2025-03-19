import 'reflect-metadata'
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  HttpCode
} from 'routing-controllers'
import { Container, Service } from 'typedi'
import { UserService } from '../services/UserService'
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto'
import { validate } from 'class-validator'
import { HttpError, ValidationError } from '../utils/HttpError'

@Controller('/users')
@Service()
export class UserController {
  private userService: UserService

  constructor() {
    this.userService = Container.get(UserService)
  }

  @Get()
  async getAll () {
    const users = await this.userService.findAll()
    return users
  }

  @Get('/:id')
  async getOne (@Param('id') id: string) {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new HttpError(404, {
        message: 'User not found',
        id
      })
    }
    return user
  }

  @Post()
  @HttpCode(201)
  async create (@Body() userData: CreateUserDto) {
    try {
      // Validate the input data
      const createUserDto = new CreateUserDto()
      Object.assign(createUserDto, userData)
      const errors = await validate(createUserDto)

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = Object.values(error.constraints || {})
          return `${error.property}: ${constraints.join(', ')}`
        })
        throw new HttpError(400, {
          message: 'Validation failed',
          errors: convertToValidationErrors(errorMessages)
        })
      }

      // Check if email already exists
      const existingUser = await this.userService.findByEmail(userData.email)
      if (existingUser) {
        throw new HttpError(400, {
          message: 'Email already exists',
          field: 'email'
        })
      }

      const user = await this.userService.create(userData)
      return user
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Put('/:id')
  async update (@Param('id') id: string, @Body() userData: UpdateUserDto) {
    try {
      // Validate the input data
      const updateUserDto = new UpdateUserDto()
      Object.assign(updateUserDto, userData)
      const errors = await validate(updateUserDto)

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = Object.values(error.constraints || {})
          return `${error.property}: ${constraints.join(', ')}`
        })
        throw new HttpError(400, {
          message: 'Validation failed',
          errors: convertToValidationErrors(errorMessages)
        })
      }

      const user = await this.userService.update(id, userData)
      if (!user) {
        throw new HttpError(404, {
          message: 'User not found',
          id
        })
      }
      return user
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  async remove (@Param('id') id: string) {
    try {
      const success = await this.userService.delete(id)
      if (!success) {
        throw new HttpError(404, {
          message: 'User not found',
          id
        })
      }
      return { message: 'User deleted successfully' }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Post('/login')
  async login (@Body() loginData: LoginUserDto) {
    try {
      // Validate the input data
      const loginUserDto = new LoginUserDto()
      Object.assign(loginUserDto, loginData)
      const errors = await validate(loginUserDto)

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = Object.values(error.constraints || {})
          return `${error.property}: ${constraints.join(', ')}`
        })
        throw new HttpError(400, {
          message: 'Validation failed',
          errors: convertToValidationErrors(errorMessages)
        })
      }

      const { user, token } = await this.userService.authenticate(
        loginData.email,
        loginData.password
      )
      return { user, token }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(401, {
        message: 'Invalid credentials',
        error: error instanceof Error ? error.message : 'Authentication failed'
      })
    }
  }

  @Post('/:id/change-password')
  async changePassword (
    @Param('id') id: string,
    @Body() data: { oldPassword: string; newPassword: string }
  ) {
    try {
      // Validate password requirements
      if (!data.oldPassword || !data.newPassword) {
        const errors: string[] = []
        if (!data.oldPassword) errors.push('oldPassword is required')
        if (!data.newPassword) errors.push('newPassword is required')
        
        throw new HttpError(400, {
          message: 'Missing required fields',
          errors: convertToValidationErrors(errors)
        })
      }

      if (data.newPassword.length < 6) {
        throw new HttpError(400, {
          message: 'New password must be at least 6 characters long',
          errors: convertToValidationErrors(['New password must be at least 6 characters long'])
        })
      }

      const success = await this.userService.changePassword(
        id,
        data.oldPassword,
        data.newPassword
      )
      if (!success) {
        throw new HttpError(400, {
          message: 'Invalid old password or user not found',
          errors: convertToValidationErrors(['Invalid old password or user not found'])
        })
      }
      return { message: 'Password changed successfully' }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }
}

// Convert string array to ValidationError array
const convertToValidationErrors = (messages: string[]): ValidationError[] => {
  return messages.map(message => ({
    field: 'general',
    message
  }))
}
