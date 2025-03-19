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

  @IsNumber()
  @IsOptional()
  capacity?: number

  @IsBoolean()
  isAvailable: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities: AmenityDto[]
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string

  @IsEnum(RoomCategory)
  @IsOptional()
  category?: RoomCategory

  @IsNumber()
  @IsOptional()
  price?: number

  @IsNumber()
  @IsOptional()
  capacity?: number

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  @IsOptional()
  amenities?: AmenityDto[]
}

export class RoomResponseDto {
  id: string
  roomNumber: string
  category: RoomCategory
  price: number
  capacity?: number
  isAvailable: boolean
  description?: string
  amenities: AmenityDto[]
  createdAt: Date
  updatedAt: Date
}
