import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator'
import { UserRole } from '../models/User'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsEnum(UserRole)
  role: UserRole
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  name?: string

  @IsEmail()
  email?: string

  @IsString()
  @MinLength(6)
  password?: string

  @IsEnum(UserRole)
  role?: UserRole
}

export class LoginUserDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class UserResponseDto {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
