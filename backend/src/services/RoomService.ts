import { Service } from 'typedi'
import { Room, IRoom, RoomCategory } from '../models/Room'
import { IRoomService } from '../interfaces/IRoomService'
import { CreateRoomDto } from '../dto/room.dto'

@Service()
export class RoomService implements IRoomService {  
  private rooms: Room[] = []

  async findAll (): Promise<IRoom[]> {
    try {
      console.log('ROOM SERVICE - Finding all rooms')
      return this.rooms
    } catch (error) {
      console.error('ROOM SERVICE - Error finding all rooms:', error)
      throw error
    }
  }

  async findById (id: string): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Finding room by id:', id)
      return this.rooms.find(room => room.id === id) || null
    } catch (error) {
      console.error('ROOM SERVICE - Error finding room by id:', error)
      throw error
    }
  }

  async create (roomData: CreateRoomDto): Promise<Room> {
    try {
      console.log('ROOM SERVICE - Creating room with data:', JSON.stringify(roomData, null, 2))
      
      const room = new Room(roomData)
      room.id = Math.random().toString(36).substr(2, 9)
      
      console.log('ROOM SERVICE - Room object before save:', JSON.stringify(room, null, 2))
      
      this.rooms.push(room)
      console.log('ROOM SERVICE - Room saved successfully:', JSON.stringify(room, null, 2))
      
      return room
    } catch (error) {
      console.error('ROOM SERVICE - Error creating room:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async update (id: string, data: Partial<IRoom>): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Updating room:', id, 'with data:', JSON.stringify(data, null, 2))
      const index = this.rooms.findIndex(room => room.id === id)
      if (index === -1) {
        console.log('ROOM SERVICE - Room not found for update:', id)
        return null
      }

      this.rooms[index] = { ...this.rooms[index], ...data, updatedAt: new Date() }
      console.log('ROOM SERVICE - Room updated successfully:', JSON.stringify(this.rooms[index], null, 2))
      return this.rooms[index]
    } catch (error) {
      console.error('ROOM SERVICE - Error updating room:', error)
      throw error
    }
  }

  async delete (id: string): Promise<boolean> {
    try {
      console.log('ROOM SERVICE - Deleting room:', id)
      const index = this.rooms.findIndex(room => room.id === id)
      if (index === -1) {
        console.log('ROOM SERVICE - Room not found for deletion:', id)
        return false
      }
      this.rooms.splice(index, 1)
      console.log('ROOM SERVICE - Room deleted successfully:', id)
      return true
    } catch (error) {
      console.error('ROOM SERVICE - Error deleting room:', error)
      throw error
    }
  }

  async findByRoomNumber (roomNumber: string): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Finding room by number:', roomNumber)
      return this.rooms.find(room => room.roomNumber === roomNumber) || null
    } catch (error) {
      console.error('ROOM SERVICE - Error finding room by number:', error)
      throw error
    }
  }

  async findAvailableRooms (
    checkIn: Date,
    checkOut: Date,
    category?: RoomCategory
  ): Promise<IRoom[]> {
    try {
      console.log('ROOM SERVICE - Finding available rooms:', { checkIn, checkOut, category })
      return this.rooms.filter(room => {
        const matchesCategory = !category || room.category === category
        return room.isAvailable && matchesCategory
      })
    } catch (error) {
      console.error('ROOM SERVICE - Error finding available rooms:', error)
      throw error
    }
  }

  async updateAvailability (
    roomId: string,
    isAvailable: boolean
  ): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Updating room availability:', roomId, isAvailable)
      const room = await this.findById(roomId)
      if (!room) {
        console.log('ROOM SERVICE - Room not found for availability update:', roomId)
        return null
      }

      room.isAvailable = isAvailable
      room.updatedAt = new Date()
      console.log('ROOM SERVICE - Room availability updated successfully:', JSON.stringify(room, null, 2))
      return room
    } catch (error) {
      console.error('ROOM SERVICE - Error updating room availability:', error)
      throw error
    }
  }
}
