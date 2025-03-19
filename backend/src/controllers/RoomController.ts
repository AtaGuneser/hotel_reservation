import 'reflect-metadata'
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  QueryParam
} from 'routing-controllers'
import { Service } from 'typedi'
import { RoomService } from '../services/RoomService'
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto'
import { RoomCategory } from '../models/Room'
import { HttpError } from '../utils/HttpError'

@Service()
@Controller('/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  async getAll(@QueryParam('category') category?: RoomCategory) {
    const rooms = await this.roomService.findAll()
    if (category) {
      return rooms.filter(room => room.category === category)
    }
    return rooms
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const room = await this.roomService.findById(id)
    if (!room) {
      throw new HttpError(404, {
        message: 'Room not found',
        id
      })
    }
    return room
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body({ validate: { validationError: { target: false, value: false } } })
    roomData: CreateRoomDto
  ) {
    const existingRoom = await this.roomService.findByRoomNumber(roomData.roomNumber || '')
    if (existingRoom) {
      throw new HttpError(400, {
        message: 'Room number already exists',
        field: 'roomNumber'
      })
    }

    return await this.roomService.create(roomData)
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body({ validate: { validationError: { target: false, value: false } } })
    roomData: UpdateRoomDto
  ) {
    if (roomData.roomNumber) {
      const existingRoom = await this.roomService.findByRoomNumber(roomData.roomNumber)
      if (existingRoom && existingRoom.id !== id) {
        throw new HttpError(400, {
          message: 'Room number already exists',
          field: 'roomNumber'
        })
      }
    }

    const room = await this.roomService.update(id, roomData)
    if (!room) {
      throw new HttpError(404, {
        message: 'Room not found',
        id
      })
    }
    return room
  }

  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const success = await this.roomService.delete(id)
    if (!success) {
      throw new HttpError(404, {
        message: 'Room not found',
        id
      })
    }
    return { message: 'Room deleted successfully' }
  }

  @Get('/available')
  async getAvailableRooms(
    @QueryParam('checkIn') checkIn: string,
    @QueryParam('checkOut') checkOut: string,
    @QueryParam('category') category?: RoomCategory
  ) {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new HttpError(400, {
        message: 'Invalid date format',
        errors: ['checkIn and checkOut must be valid dates']
      })
    }

    if (checkInDate >= checkOutDate) {
      throw new HttpError(400, {
        message: 'Invalid date range',
        errors: ['checkIn date must be before checkOut date']
      })
    }

    return await this.roomService.findAvailableRooms(
      checkInDate,
      checkOutDate,
      category
    )
  }

  @Put('/:id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body() data: { isAvailable: boolean }
  ) {
    const room = await this.roomService.updateAvailability(id, data.isAvailable)
    if (!room) {
      throw new HttpError(404, {
        message: 'Room not found',
        id
      })
    }
    return room
  }
} 