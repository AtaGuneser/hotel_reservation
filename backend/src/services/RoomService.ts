import { Service } from 'typedi'
import { MongoClient, ObjectId } from 'mongodb'
import { IRoom, RoomCategory } from '../models/Room'
import { IRoomService } from '../interfaces/IRoomService'
import { CreateRoomDto } from '../dto/room.dto'

@Service()
export class RoomService implements IRoomService {  
  private client: MongoClient
  private db: any

  constructor() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    this.client = new MongoClient(mongoURI)
  }

  async connect() {
    await this.client.connect()
    this.db = this.client.db('hotel_reservation')
  }

  async findAll (): Promise<IRoom[]> {
    try {
      console.log('ROOM SERVICE - Finding all rooms')
      const rooms = await this.db.collection('rooms').find({}).toArray()
      console.log('ROOM SERVICE - Found rooms:', JSON.stringify(rooms, null, 2))
      return rooms
    } catch (error) {
      console.error('ROOM SERVICE - Error finding all rooms:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async findById (id: string): Promise<IRoom> {
    try {
      console.log('ROOM SERVICE - Finding room by id:', id)
      const room = await this.db.collection('rooms').findOne({ _id: new ObjectId(id) })
      if (!room) {
        throw new Error('Room not found')
      }
      console.log('ROOM SERVICE - Found room:', JSON.stringify(room, null, 2))
      return room
    } catch (error) {
      console.error('ROOM SERVICE - Error finding room by id:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async create (roomData: CreateRoomDto): Promise<IRoom> {
    try {
      console.log('ROOM SERVICE - Creating room with data:', JSON.stringify(roomData, null, 2))
      
      // Transform category to lowercase if it's a string
      if (typeof roomData.category === 'string') {
        roomData.category = roomData.category.toLowerCase() as RoomCategory
      }
      
      const result = await this.db.collection('rooms').insertOne({
        ...roomData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const savedRoom = await this.db.collection('rooms').findOne({ _id: result.insertedId })
      console.log('ROOM SERVICE - Room saved successfully:', JSON.stringify(savedRoom, null, 2))
      return savedRoom
    } catch (error) {
      console.error('ROOM SERVICE - Error creating room:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async update (id: string, data: Partial<IRoom>): Promise<IRoom> {
    try {
      console.log('ROOM SERVICE - Updating room:', id, 'with data:', JSON.stringify(data, null, 2))
      const result = await this.db.collection('rooms').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...data,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )
      
      if (!result.value) {
        throw new Error('Room not found')
      }
      
      console.log('ROOM SERVICE - Room updated successfully:', JSON.stringify(result.value, null, 2))
      return result.value
    } catch (error) {
      console.error('ROOM SERVICE - Error updating room:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async delete (id: string): Promise<boolean> {
    try {
      console.log('ROOM SERVICE - Deleting room:', id)
      const result = await this.db.collection('rooms').deleteOne({ _id: new ObjectId(id) })
      
      if (result.deletedCount === 0) {
        console.log('ROOM SERVICE - Room not found for deletion:', id)
        return false
      }
      
      console.log('ROOM SERVICE - Room deleted successfully:', id)
      return true
    } catch (error) {
      console.error('ROOM SERVICE - Error deleting room:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async findByRoomNumber (roomNumber: string): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Finding room by number:', roomNumber)
      const room = await this.db.collection('rooms').findOne({ roomNumber })
      console.log('ROOM SERVICE - Found room:', room ? JSON.stringify(room, null, 2) : 'null')
      return room
    } catch (error) {
      console.error('ROOM SERVICE - Error finding room by number:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
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
      const query: any = { isAvailable: true }
      
      if (category) {
        query.category = category
      }
      
      const rooms = await this.db.collection('rooms').find(query).toArray()
      console.log('ROOM SERVICE - Found available rooms:', JSON.stringify(rooms, null, 2))
      return rooms
    } catch (error) {
      console.error('ROOM SERVICE - Error finding available rooms:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async updateAvailability (
    roomId: string,
    isAvailable: boolean
  ): Promise<IRoom | null> {
    try {
      console.log('ROOM SERVICE - Updating room availability:', roomId, isAvailable)
      const result = await this.db.collection('rooms').findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        { 
          $set: { 
            isAvailable,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )
      
      if (!result.value) {
        console.log('ROOM SERVICE - Room not found for availability update:', roomId)
        return null
      }
      
      console.log('ROOM SERVICE - Room availability updated successfully:', JSON.stringify(result.value, null, 2))
      return result.value
    } catch (error) {
      console.error('ROOM SERVICE - Error updating room availability:', error)
      console.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }
}
