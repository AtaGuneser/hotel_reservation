import 'reflect-metadata'
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  QueryParam,
  HttpError
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
    try {
      return await this.roomService.findAll()
    } catch (error) {
      logger.error('Error listing rooms:', error)
      throw new HttpError(500, 'Failed to list rooms')
    }
  }

  @Get('/get/:id')
  @ResponseSchema(RoomResponseDto)
  async getRoom(@Param('id') id: string): Promise<IRoom<"api">> {
    try {
      return await this.roomService.findById(id)
    } catch (error) {
      logger.error(`Error getting room ${id}:`, error)
      throw new HttpError(404, `Room with id ${id} not found`)
    }
  }

  @Post('/create')
  @ResponseSchema(RoomResponseDto)
  async createRoom(@Body() payload: CreateRoomDto): Promise<IRoom<"api">> {
    try {
      logger.info('Creating room with payload:', JSON.stringify(payload, null, 2))
      return await this.roomService.create(payload)
    } catch (error) {
      logger.error('Error creating room:', error)
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new HttpError(409, error.message)
      }
      throw new HttpError(500, 'Failed to create room')
    }
  }

  @Put('/update/:id')
  @ResponseSchema(RoomResponseDto)
  async updateRoom(
    @Param('id') id: string,
    @Body() payload: UpdateRoomDto
  ): Promise<IRoom<"api">> {
    try {
      logger.info(`Updating room ${id} with payload:`, JSON.stringify(payload, null, 2))
      return await this.roomService.update(id, payload)
    } catch (error) {
      logger.error(`Error updating room ${id}:`, error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpError(404, error.message)
      }
      throw new HttpError(500, `Failed to update room ${id}`)
    }
  }

  @Delete('/delete/:id')
  async deleteRoom(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      const result = await this.roomService.delete(id)
      return { success: result }
    } catch (error) {
      logger.error(`Error deleting room ${id}:`, error)
      throw new HttpError(500, `Failed to delete room ${id}`)
    }
  }

  @Get('/available')
  @ResponseSchema(RoomResponseDto, { isArray: true })
  async getAvailableRooms(
    @QueryParam('checkIn') checkIn: Date,
    @QueryParam('checkOut') checkOut: Date,
    @QueryParam('category') category?: string
  ): Promise<IRoom<"api">[]> {
    try {
      return await this.roomService.findAvailableRooms(
        checkIn, 
        checkOut, 
        category as RoomCategory
      )
    } catch (error) {
      logger.error('Error finding available rooms:', error)
      throw new HttpError(500, 'Failed to find available rooms')
    }
  }
}
