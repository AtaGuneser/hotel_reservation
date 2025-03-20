import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNotEmpty } from 'class-validator'
import { UserRole } from '../models/User'

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty()
  @MinLength(2)
  firstName: string

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty()
  @MinLength(2)
  lastName: string

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2)
  firstName?: string

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2)
  lastName?: string

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole
}

// Response DTO - used for Swagger documentation
export class UserResponseDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
