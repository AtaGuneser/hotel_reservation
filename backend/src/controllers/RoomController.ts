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
import { IRoom } from '../models/Room'
import { ResponseSchema } from 'routing-controllers-openapi'
import { logger } from '../utils/logger'

@Service()
@Controller('/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('/list')
  @ResponseSchema(RoomResponseDto, { isArray: true })
  async getRooms(): Promise<IRoom[]> {
    return this.roomService.findAll()
  }

  @Get('/get/:id')
  @ResponseSchema(RoomResponseDto)
  async getRoom(@Param('id') id: string): Promise<IRoom> {
    return await this.roomService.findById(id)
  }

  @Post('/create')
  @ResponseSchema(RoomResponseDto)
  async createRoom(
    @Body({ validate: { validationError: { target: false, value: false } } })
    payload: CreateRoomDto
  ): Promise<IRoom> {
    logger.info('CREATE ROOM PAYLOAD: ', JSON.stringify(payload, null, 2))
    return await this.roomService.create(payload)
  }

  @Put('/update/:id')
  @ResponseSchema(RoomResponseDto)
  async updateRoom(
    @Param('id') id: string,
    @Body({ validate: { validationError: { target: false, value: false } } })
    payload: UpdateRoomDto
  ): Promise<IRoom> {
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
  ): Promise<IRoom[]> {
    return await this.roomService.findAvailableRooms(checkIn, checkOut, category as any)
  }
}
