import 'reflect-metadata'
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpError
} from 'routing-controllers'
import { UserService } from '../services/UserService'
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto'

@Controller('/users')
export class UserController {
  constructor (private userService: UserService) {}

  @Get()
  async getAll () {
    const users = await this.userService.findAll()
    return users
  }

  @Get('/:id')
  async getOne (@Param('id') id: string) {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new HttpError(404, 'User not found')
    }
    return user
  }

  @Post()
  @HttpCode(201)
  async create (@Body() userData: CreateUserDto) {
    const user = await this.userService.create(userData)
    return user
  }

  @Put('/:id')
  async update (@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const user = await this.userService.update(id, userData)
    if (!user) {
      throw new HttpError(404, 'User not found')
    }
    return user
  }

  @Delete('/:id')
  @HttpCode(204)
  async remove (@Param('id') id: string) {
    const success = await this.userService.delete(id)
    if (!success) {
      throw new HttpError(404, 'User not found')
    }
    return { message: 'User deleted successfully' }
  }

  @Post('/login')
  async login (@Body() loginData: LoginUserDto) {
    try {
      const { user, token } = await this.userService.authenticate(
        loginData.email,
        loginData.password
      )
      return { user, token }
    } catch (error) {
      throw new HttpError(401, 'Invalid credentials')
    }
  }

  @Post('/:id/change-password')
  async changePassword (
    @Param('id') id: string,
    @Body() data: { oldPassword: string; newPassword: string }
  ) {
    const success = await this.userService.changePassword(
      id,
      data.oldPassword,
      data.newPassword
    )
    if (!success) {
      throw new HttpError(400, 'Invalid old password or user not found')
    }
    return { message: 'Password changed successfully' }
  }
}
