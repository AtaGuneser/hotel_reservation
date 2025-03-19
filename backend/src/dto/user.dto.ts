import { Service } from 'typedi'
import { IsString, IsEmail, IsEnum, MinLength, IsNotEmpty } from 'class-validator'
import { UserRole } from '../models/User'

@Service()
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole
}

@Service()
export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  firstName?: string

  @IsString()
  @MinLength(2)
  lastName?: string

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
