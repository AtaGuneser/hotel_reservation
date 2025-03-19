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
import { Container, Service } from 'typedi'
import { RoomService } from '../services/RoomService'
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto'
import { validate } from 'class-validator'
import { HttpError } from '../utils/HttpError'
import { RoomCategory } from '../models/Room'

@Controller('/rooms')
@Service()
export class RoomController {
  private roomService: RoomService

  constructor() {
    this.roomService = Container.get(RoomService)
  }

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
  async create(@Body() roomData: CreateRoomDto) {
    try {
      // Validate the input data
      const createRoomDto = new CreateRoomDto()
      Object.assign(createRoomDto, roomData)
      const errors = await validate(createRoomDto)

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = Object.values(error.constraints || {})
          return `${error.property}: ${constraints.join(', ')}`
        })
        throw new HttpError(400, {
          message: 'Validation failed',
          errors: errorMessages
        })
      }

      // Check if room number already exists
      const existingRoom = await this.roomService.findByRoomNumber(roomData.roomNumber || '')
      if (existingRoom) {
        throw new HttpError(400, {
          message: 'Room number already exists',
          field: 'roomNumber'
        })
      }

      const room = await this.roomService.create(roomData)
      return room
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() roomData: UpdateRoomDto) {
    try {
      // Validate the input data
      const updateRoomDto = new UpdateRoomDto()
      Object.assign(updateRoomDto, roomData)
      const errors = await validate(updateRoomDto)

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = Object.values(error.constraints || {})
          return `${error.property}: ${constraints.join(', ')}`
        })
        throw new HttpError(400, {
          message: 'Validation failed',
          errors: errorMessages
        })
      }

      // If room number is being updated, check if it already exists
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
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      const success = await this.roomService.delete(id)
      if (!success) {
        throw new HttpError(404, {
          message: 'Room not found',
          id
        })
      }
      return { message: 'Room deleted successfully' }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Get('/available')
  async getAvailableRooms(
    @QueryParam('checkIn') checkIn: string,
    @QueryParam('checkOut') checkOut: string,
    @QueryParam('category') category?: RoomCategory
  ) {
    try {
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

      const availableRooms = await this.roomService.findAvailableRooms(
        checkInDate,
        checkOutDate,
        category
      )
      return availableRooms
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  @Put('/:id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body() data: { isAvailable: boolean }
  ) {
    try {
      const room = await this.roomService.updateAvailability(id, data.isAvailable)
      if (!room) {
        throw new HttpError(404, {
          message: 'Room not found',
          id
        })
      }
      return room
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }
} 