import { Service } from 'typedi'
import { Room, IRoom, RoomCategory } from '../models/Room'
import { IRoomService } from '../interfaces/IRoomService'

@Service()
export class RoomService implements IRoomService {  
  private rooms: Room[] = []

  async findAll (): Promise<IRoom[]> {
    return this.rooms
  }

  async findById (id: string): Promise<IRoom | null> {
    return this.rooms.find(room => room.id === id) || null
  }

  async create (data: Partial<IRoom>): Promise<IRoom> {
    const room = new Room(data)
    room.id = Math.random().toString(36).substr(2, 9)
    this.rooms.push(room)
    return room
  }

  async update (id: string, data: Partial<IRoom>): Promise<IRoom | null> {
    const index = this.rooms.findIndex(room => room.id === id)
    if (index === -1) return null

    this.rooms[index] = { ...this.rooms[index], ...data, updatedAt: new Date() }
    return this.rooms[index]
  }

  async delete (id: string): Promise<boolean> {
    const index = this.rooms.findIndex(room => room.id === id)
    if (index === -1) return false
    this.rooms.splice(index, 1)
    return true
  }

  async findByRoomNumber (roomNumber: string): Promise<IRoom | null> {
    return this.rooms.find(room => room.roomNumber === roomNumber) || null
  }

  async findAvailableRooms (
    checkIn: Date,
    checkOut: Date,
    category?: RoomCategory
  ): Promise<IRoom[]> {
    return this.rooms.filter(room => {
      const matchesCategory = !category || room.category === category
      return room.isAvailable && matchesCategory
    })
  }

  async updateAvailability (
    roomId: string,
    isAvailable: boolean
  ): Promise<IRoom | null> {
    const room = await this.findById(roomId)
    if (!room) return null

    room.isAvailable = isAvailable
    room.updatedAt = new Date()
    return room
  }
}
