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
import { Room, RoomCategory } from '../models/Room'
import { HttpError } from '../utils/HttpError'
import { validate } from 'class-validator'
import { ResponseSchema } from 'routing-controllers-openapi'

@Service()
@Controller('/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('/list')
  @ResponseSchema(RoomResponseDto, { isArray: true })
  async getRooms(): Promise<Room[]> {
    try {
      console.log('GET ALL ROOMS - Request received')
      const rooms = await this.roomService.findAll()
      console.log('GET ALL ROOMS - Success:', JSON.stringify(rooms, null, 2))
      return rooms
    } catch (error) {
      console.error('GET ALL ROOMS - Error:', error)
      throw new HttpError(500, {
        message: 'Failed to fetch rooms',
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      })
    }
  }

  @Get('/get/:id')
  @ResponseSchema(RoomResponseDto)
  async getRoom(@Param('id') id: string): Promise<Room> {
    try {
      console.log('GET ROOM BY ID - Request received for id:', id)
      const room = await this.roomService.findById(id)
      if (!room) {
        console.log('GET ROOM BY ID - Room not found:', id)
        throw new HttpError(404, {
          message: 'Room not found',
          errors: [{
            field: 'id',
            message: 'Room not found'
          }]
        })
      }
      console.log('GET ROOM BY ID - Success:', JSON.stringify(room, null, 2))
      return room
    } catch (error) {
      console.error('GET ROOM BY ID - Error:', error)
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, {
        message: 'Failed to fetch room',
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      })
    }
  }

  @Post('/create')
  @ResponseSchema(RoomResponseDto)
  async createRoom(
    @Body({ validate: true })
    payload: CreateRoomDto
  ): Promise<Room> {
    try {
      console.log('CREATE ROOM - Request received with data:', JSON.stringify(payload, null, 2))

      // Transform category to uppercase if it's a string
      if (typeof payload.category === 'string') {
        payload.category = payload.category.toUpperCase() as RoomCategory
      }

      // Check if room number already exists
      const existingRoom = await this.roomService.findByRoomNumber(payload.roomNumber)
      if (existingRoom) {
        console.log('CREATE ROOM - Room number already exists:', payload.roomNumber)
        throw new HttpError(400, {
          message: 'Room number already exists',
          errors: [{
            field: 'roomNumber',
            message: 'Room number already exists'
          }]
        })
      }

      console.log('CREATE ROOM - Creating room with data:', JSON.stringify(payload, null, 2))
      const createdRoom = await this.roomService.create(payload)
      console.log('CREATE ROOM - Success:', JSON.stringify(createdRoom, null, 2))
      
      return createdRoom
    } catch (error) {
      console.error('CREATE ROOM - Error:', error)
      console.error('CREATE ROOM - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('CREATE ROOM - Error type:', (error as any).constructor.name)
      console.error('CREATE ROOM - Full error object:', JSON.stringify(error, null, 2))
      
      if (error instanceof HttpError) {
        throw error
      }
      
      throw new HttpError(500, {
        message: 'Failed to create room',
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      })
    }
  }

  @Put('/update/:id')
  @ResponseSchema(RoomResponseDto)
  async updateRoom(
    @Param('id') id: string,
    @Body({ validate: { validationError: { target: false, value: false } } })
    payload: UpdateRoomDto
  ): Promise<Room> {
    try {
      console.log('UPDATE ROOM - Request received for id:', id, 'with data:', JSON.stringify(payload, null, 2))
      
      const existingRoom = await this.roomService.findById(id)
      if (!existingRoom) {
        console.log('UPDATE ROOM - Room not found:', id)
        throw new HttpError(404, {
          message: 'Room not found',
          errors: [{
            field: 'id',
            message: 'Room not found'
          }]
        })
      }

      // If room number is being updated, check if it already exists
      if (payload.roomNumber && payload.roomNumber !== existingRoom.roomNumber) {
        const roomWithNumber = await this.roomService.findByRoomNumber(payload.roomNumber)
        if (roomWithNumber) {
          console.log('UPDATE ROOM - Room number already exists:', payload.roomNumber)
          throw new HttpError(400, {
            message: 'Room number already exists',
            errors: [{
              field: 'roomNumber',
              message: 'Room number already exists'
            }]
          })
        }
      }

      console.log('UPDATE ROOM - Updating room with data:', JSON.stringify(payload, null, 2))
      const updatedRoom = await this.roomService.update(id, payload)
      if (!updatedRoom) {
        throw new HttpError(500, {
          message: 'Failed to update room',
          errors: [{
            field: 'general',
            message: 'Room update failed'
          }]
        })
      }
      console.log('UPDATE ROOM - Success:', JSON.stringify(updatedRoom, null, 2))
      
      return updatedRoom
    } catch (error) {
      console.error('UPDATE ROOM - Error:', error)
      console.error('UPDATE ROOM - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      
      if (error instanceof HttpError) {
        throw error
      }
      
      throw new HttpError(500, {
        message: 'Failed to update room',
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      })
    }
  }

  @Delete('/delete/:id')
  @ResponseSchema(RoomResponseDto)
  async deleteRoom(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      console.log('DELETE ROOM - Request received for id:', id)
      
      const existingRoom = await this.roomService.findById(id)
      if (!existingRoom) {
        console.log('DELETE ROOM - Room not found:', id)
        throw new HttpError(404, {
          message: 'Room not found',
          errors: [{
            field: 'id',
            message: 'Room not found'
          }]
        })
      }

      const success = await this.roomService.delete(id)
      if (!success) {
        console.log('DELETE ROOM - Failed to delete room:', id)
        throw new HttpError(500, {
          message: 'Failed to delete room',
          errors: [{
            field: 'general',
            message: 'Failed to delete room'
          }]
        })
      }
      
      console.log('DELETE ROOM - Success:', id)
      return { success: true }
    } catch (error) {
      console.error('DELETE ROOM - Error:', error)
      console.error('DELETE ROOM - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      
      if (error instanceof HttpError) {
        throw error
      }
      
      throw new HttpError(500, {
        message: 'Failed to delete room',
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      })
    }
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
        errors: [{
          field: 'checkIn',
          message: 'Invalid date format'
        }, {
          field: 'checkOut',
          message: 'Invalid date format'
        }]
      })
    }

    if (checkInDate >= checkOutDate) {
      throw new HttpError(400, {
        message: 'Invalid date range',
        errors: [{
          field: 'checkIn',
          message: 'checkIn date must be before checkOut date'
        }, {
          field: 'checkOut',
          message: 'checkOut date must be after checkIn date'
        }]
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