import { Service } from 'typedi'
import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator'
import { UserRole } from '../models/User'

@Service()
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

@Service()
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

@Service()
export class LoginUserDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

@Service()
export class UserResponseDto {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
