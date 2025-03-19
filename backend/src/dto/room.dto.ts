import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'
import { RoomCategory } from '../models/Room'

export class AmenityDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}

export class CreateRoomDto {
  @IsString()
  roomNumber: string

  @IsEnum(RoomCategory)
  category: RoomCategory

  @IsNumber()
  @Min(0)
  price: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities: AmenityDto[]

  @IsBoolean()
  isAvailable: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string

  @IsEnum(RoomCategory)
  @IsOptional()
  category?: RoomCategory

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  @IsOptional()
  amenities?: AmenityDto[]

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number
}

export class RoomResponseDto {
  id: string
  roomNumber: string
  category: RoomCategory
  price: number
  amenities: AmenityDto[]
  isAvailable: boolean
  description?: string
  capacity: number
  createdAt: Date
  updatedAt: Date
}
