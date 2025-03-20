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
    
    try {
      // When using routing-controllers with proper validation setup,
      // we don't need manual validation here anymore
      // The payload should already be validated and transformed
      return await this.roomService.create(payload)
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
    try {
      logger.info(`UPDATE ROOM - ID: ${id}, Payload:`, JSON.stringify(payload, null, 2))
      
      if (typeof payload.category === 'string') {
        payload.category = payload.category.toLowerCase() as RoomCategory
      }
      
      return await this.roomService.update(id, payload)
    } catch (error) {
      logger.error('Error updating room:', error)
      logger.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
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
