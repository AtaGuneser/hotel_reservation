import {
  JsonController,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Authorized,
  CurrentUser,
  HttpCode,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  OnUndefined
} from 'routing-controllers'
import { Service } from 'typedi'
import { UserService } from '../services/UserService'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto'
import { ApiUser } from '../models/User'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { logger } from '../utils/logger'
import { JwtPayload } from '../middleware/auth.middleware'

@JsonController('/users')
@Service()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Authorized('admin')
  async getAllUsers(): Promise<ApiUser[]> {
    try {
      return await this.userService.findAll()
    } catch (error) {
      logger.error('Failed to get users', error)
      throw new BadRequestError('Failed to get users')
    }
  }

  @Get('/me')
  @Authorized()
  async getCurrentUser(@CurrentUser() user: JwtPayload): Promise<ApiUser> {
    try {
      const userData = await this.userService.findById(user.id)
      
      if (!userData) {
        throw new NotFoundError('User not found')
      }
      
      return userData
    } catch (error) {
      logger.error('Failed to get current user', error)
      throw new BadRequestError('Failed to get current user')
    }
  }

  @Get('/:id')
  @Authorized('admin')
  async getUserById(@Param('id') id: string): Promise<ApiUser> {
    try {
      const user = await this.userService.findById(id)
      
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }
      
      return user
    } catch (error) {
      logger.error(`Failed to get user with ID: ${id}`, error)
      
      if (error instanceof NotFoundError) {
        throw error
      }
      
      throw new BadRequestError(`Failed to get user with ID ${id}`)
    }
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Validate the DTO
      const userDto = plainToInstance(CreateUserDto, userData)
      const errors = await validate(userDto)
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ')
        
        throw new BadRequestError(`Validation errors: ${errorMessages}`)
      }
      
      const user = await this.userService.create(userData)
      return user
    } catch (error) {
      logger.error('Failed to create user', error)
      
      if (error instanceof BadRequestError) {
        throw error
      }
      
      throw new BadRequestError('Failed to create user')
    }
  }

  @Put('/:id')
  @Authorized()
  async updateUser(
    @Param('id') id: string, 
    @Body() userData: UpdateUserDto,
    @CurrentUser() currentUser: JwtPayload
  ): Promise<ApiUser> {
    try {
      // Check if user is admin or updating their own profile
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        throw new UnauthorizedError('You can only update your own profile')
      }
      
      // Validate the DTO
      const userDto = plainToInstance(UpdateUserDto, userData)
      const errors = await validate(userDto)
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ')
        
        throw new BadRequestError(`Validation errors: ${errorMessages}`)
      }
      
      const updatedUser = await this.userService.update(id, userData)
      
      if (!updatedUser) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }
      
      return updatedUser
    } catch (error) {
      logger.error(`Failed to update user with ID: ${id}`, error)
      
      if (error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof BadRequestError) {
        throw error
      }
      
      throw new BadRequestError(`Failed to update user with ID ${id}`)
    }
  }

  @Delete('/:id')
  @Authorized('admin')
  @OnUndefined(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    try {
      const deleted = await this.userService.delete(id)
      
      if (!deleted) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }
    } catch (error) {
      logger.error(`Failed to delete user with ID: ${id}`, error)
      
      if (error instanceof NotFoundError) {
        throw error
      }
      
      throw new BadRequestError(`Failed to delete user with ID ${id}`)
    }
  }

  @Post('/login')
  async login(@Body() credentials: { email: string; password: string }): Promise<{ user: ApiUser; token: string }> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new BadRequestError('Email and password are required')
      }
      
      return await this.userService.authenticate(credentials.email, credentials.password)
    } catch (error) {
      logger.error('Login failed', error)
      
      if (error instanceof UnauthorizedError) {
        throw error
      }
      
      throw new UnauthorizedError('Invalid email or password')
    }
  }

  @Post('/change-password')
  @Authorized()
  async changePassword(
    @Body() data: { currentPassword: string; newPassword: string },
    @CurrentUser() user: JwtPayload
  ): Promise<{ success: boolean }> {
    try {
      if (!data.currentPassword || !data.newPassword) {
        throw new BadRequestError('Current password and new password are required')
      }
      
      if (data.newPassword.length < 6) {
        throw new BadRequestError('New password must be at least 6 characters long')
      }
      
      const result = await this.userService.changePassword(
        user.id,
        data.currentPassword,
        data.newPassword
      )
      
      return { success: result }
    } catch (error) {
      logger.error('Password change failed', error)
      
      if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
        throw error
      }
      
      throw new BadRequestError('Failed to change password')
    }
  }

  @Get('/validate-token')
  @Authorized()
  @HttpCode(200)
  validateToken(): { valid: true } {
    // If we reach here, the token is valid (because of @Authorized)
    return { valid: true }
  }
}
