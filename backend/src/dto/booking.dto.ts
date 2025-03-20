import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  Min,
  IsISO8601,
  IsUUID,
  ValidateIf
} from 'class-validator'
import { Type } from 'class-transformer'
import { BookingStatus } from '../models/Booking'

export class CreateBookingDto {
  @IsString({ message: 'Room ID must be a string' })
  roomId: string

  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string

  @IsISO8601()
  @Type(() => Date)
  startDate: Date

  @IsISO8601()
  @Type(() => Date)
  endDate: Date

  @IsNumber({}, { message: 'Guest count must be a number' })
  @Min(1, { message: 'Guest count must be at least 1' })
  guestCount: number

  @IsNumber({}, { message: 'Total price must be a number' })
  @Min(0, { message: 'Total price must be positive' })
  totalPrice: number

  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  @IsOptional()
  status?: BookingStatus = BookingStatus.PENDING

  @IsString({ message: 'Special requests must be a string' })
  @IsOptional()
  specialRequests?: string
}

export class UpdateBookingDto {
  @IsString({ message: 'Room ID must be a string' })
  @IsOptional()
  roomId?: string

  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string

  @IsISO8601()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date

  @IsISO8601()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date

  @IsNumber({}, { message: 'Guest count must be a number' })
  @Min(1, { message: 'Guest count must be at least 1' })
  @IsOptional()
  guestCount?: number

  @IsNumber({}, { message: 'Total price must be a number' })
  @Min(0, { message: 'Total price must be positive' })
  @IsOptional()
  totalPrice?: number

  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  @IsOptional()
  status?: BookingStatus

  @IsString({ message: 'Special requests must be a string' })
  @IsOptional()
  specialRequests?: string
}

export class BookingResponseDto {
  id: string
  roomId: string
  userId: string
  startDate: Date
  endDate: Date
  guestCount: number
  totalPrice: number
  status: BookingStatus
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}
