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
  @Type(() => String)
  category: RoomCategory

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity: number

  @IsBoolean()
  @Type(() => Boolean)
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
  @Type(() => String)
  category?: RoomCategory

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  capacity?: number

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
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
  capacity: number
  isAvailable: boolean
  description?: string
  amenities: AmenityDto[]
  createdAt: Date
  updatedAt: Date
  lastStatusChangeAt: Date
  statusChangeReason?: string
  metadata: Record<string, any>
  createdBy: string
}
