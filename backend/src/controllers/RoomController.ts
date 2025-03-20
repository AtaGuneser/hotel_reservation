import 'reflect-metadata'
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  QueryParam
} from 'routing-controllers'
import { Service } from 'typedi'
import { RoomService } from '../services/RoomService'
import { CreateRoomDto, UpdateRoomDto, RoomResponseDto } from '../dto/room.dto'
import { IRoom, RoomCategory } from '../models/Room'
import { ResponseSchema } from 'routing-controllers-openapi'
import { logger } from '../utils/logger'
import { validate } from 'class-validator'

@Service()
@Controller('/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('/list')
  @ResponseSchema(RoomResponseDto, { isArray: true })
  async getRooms(): Promise<IRoom<"api">[]> {
    return this.roomService.findAll()
  }

  @Get('/get/:id')
  @ResponseSchema(RoomResponseDto)
  async getRoom(@Param('id') id: string): Promise<IRoom<"api">> {
    return await this.roomService.findById(id)
  }

  @Post('/create')
  @ResponseSchema(RoomResponseDto)
  async createRoom(
    @Body() payload: CreateRoomDto
  ): Promise<IRoom<"api">> {
    logger.info('CREATE ROOM PAYLOAD: ', JSON.stringify(payload, null, 2))
    
    // Transform the data
    const transformedPayload = {
      ...payload,
      category: payload.category.toLowerCase() as RoomCategory,
      price: Number(payload.price),
      capacity: Number(payload.capacity),
      isAvailable: Boolean(payload.isAvailable),
      amenities: Array.isArray(payload.amenities) ? payload.amenities : []
    }
    
    // Validate the payload
    const errors = await validate(transformedPayload)
    if (errors.length > 0) {
      logger.error('Validation errors:', JSON.stringify(errors, null, 2))
      const errorResponse = {
        message: 'Invalid body, check \'errors\' property for more info.',
        errors: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      }
      throw new Error(JSON.stringify(errorResponse))
    }
    
    try {
      return await this.roomService.create(transformedPayload)
    } catch (error) {
      logger.error('Error creating room:', error)
      throw error
    }
  }

  @Put('/update/:id')
  @ResponseSchema(RoomResponseDto)
  async updateRoom(
    @Param('id') id: string,
    @Body() payload: UpdateRoomDto
  ): Promise<IRoom<"api">> {
    // Validate the payload
    const errors = await validate(payload)
    if (errors.length > 0) {
      logger.error('Validation errors:', errors)
      throw new Error('Validation failed')
    }
    
    return await this.roomService.update(id, payload)
  }

  @Delete('/delete/:id')
  @ResponseSchema(RoomResponseDto)
  async deleteRoom(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.roomService.delete(id)
    return { success: result }
  }

  @Get('/available')
  @ResponseSchema(RoomResponseDto, { isArray: true })
  async getAvailableRooms(
    @QueryParam('checkIn') checkIn: Date,
    @QueryParam('checkOut') checkOut: Date,
    @QueryParam('category') category?: string
  ): Promise<IRoom<"api">[]> {
    return await this.roomService.findAvailableRooms(checkIn, checkOut, category as any)
  }
}
