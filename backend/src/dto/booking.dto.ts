import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  Min
} from 'class-validator'
import { Type } from 'class-transformer'
import { BookingStatus } from '../models/Booking'

export class CreateBookingDto {
  @IsString()
  userId: string

  @IsString()
  roomId: string

  @IsDate()
  @Type(() => Date)
  checkIn: Date

  @IsDate()
  @Type(() => Date)
  checkOut: Date

  @IsNumber()
  @Min(1)
  numberOfGuests: number

  @IsString()
  @IsOptional()
  specialRequests?: string
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  checkIn?: Date

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  checkOut?: Date

  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfGuests?: number

  @IsString()
  @IsOptional()
  specialRequests?: string
}

export class BookingResponseDto {
  id: string
  userId: string
  roomId: string
  checkIn: Date
  checkOut: Date
  status: BookingStatus
  totalPrice: number
  numberOfGuests: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}
