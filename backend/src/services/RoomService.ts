import { Service } from 'typedi'
import { MongoClient, ObjectId } from 'mongodb'
import { IRoom, RoomCategory } from '../models/Room'
import { IRoomService } from '../interfaces/IRoomService'
import { CreateRoomDto } from '../dto/room.dto'
import { logger } from '../utils/logger'

@Service()
export class RoomService implements IRoomService {  
  private client: MongoClient
  private db: any

  constructor() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    this.client = new MongoClient(mongoURI)
  }

  async connect() {
    try {
      await this.client.connect()
      this.db = this.client.db('hotel_reservation')
      logger.info('Connected to MongoDB')
    } catch (error) {
      logger.error('MongoDB Connection Error:', error)
      throw error
    }
  }

  async findAll(): Promise<IRoom<"api">[]> {
    try {
      logger.info('ROOM SERVICE - Finding all rooms')
      const rooms = await this.db.collection('rooms').find().toArray()
      logger.info('ROOM SERVICE - Found rooms:', JSON.stringify(rooms, null, 2))
      return rooms.map(this.transformToApi)
    } catch (error) {
      logger.error('ROOM SERVICE - Error finding all rooms:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async findById(id: string): Promise<IRoom<"api">> {
    try {
      logger.info('ROOM SERVICE - Finding room by id:', id)
      const room = await this.db.collection('rooms').findOne({ _id: new ObjectId(id) })
      if (!room) {
        throw new Error('Room not found')
      }
      logger.info('ROOM SERVICE - Found room:', JSON.stringify(room, null, 2))
      return this.transformToApi(room)
    } catch (error) {
      logger.error('ROOM SERVICE - Error finding room by id:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async create(roomData: CreateRoomDto): Promise<IRoom<"api">> {
    try {
      logger.info('ROOM SERVICE - Creating room with data:', JSON.stringify(roomData, null, 2))
      
      // Check if room number already exists
      const existingRoom = await this.findByRoomNumber(roomData.roomNumber)
      if (existingRoom) {
        throw new Error(`Room with number ${roomData.roomNumber} already exists`)
      }
      
      const now = new Date()
      const dbRoom: IRoom<"db"> = {
        ...roomData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
        lastStatusChangeAt: now,
        metadata: {},
        createdBy: new ObjectId('000000000000000000000000') // TODO: Get from auth context
      }
      
      const result = await this.db.collection('rooms').insertOne(dbRoom)
      const savedRoom = await this.db.collection('rooms').findOne({ _id: result.insertedId })
      logger.info('ROOM SERVICE - Room saved successfully:', JSON.stringify(savedRoom, null, 2))
      return this.transformToApi(savedRoom)
    } catch (error) {
      logger.error('ROOM SERVICE - Error creating room:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async update(id: string, data: Partial<IRoom<"api">>): Promise<IRoom<"api">> {
    try {
      logger.info('ROOM SERVICE - Updating room:', id, 'with data:', JSON.stringify(data, null, 2))
      
      // Transform category to lowercase if it's a string
      if (data.category && typeof data.category === 'string') {
        data.category = data.category.toLowerCase() as RoomCategory
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      }
      
      const result = await this.db.collection('rooms').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
      
      if (!result.value) {
        throw new Error('Room not found')
      }
      
      logger.info('ROOM SERVICE - Room updated successfully:', JSON.stringify(result.value, null, 2))
      return this.transformToApi(result.value)
    } catch (error) {
      logger.error('ROOM SERVICE - Error updating room:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.info('ROOM SERVICE - Deleting room:', id)
      const result = await this.db.collection('rooms').deleteOne({ _id: new ObjectId(id) })
      logger.info('ROOM SERVICE - Delete result:', result)
      return result.deletedCount > 0
    } catch (error) {
      logger.error('ROOM SERVICE - Error deleting room:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async findByRoomNumber(roomNumber: string): Promise<IRoom<"api"> | null> {
    try {
      logger.info('ROOM SERVICE - Finding room by number:', roomNumber)
      const room = await this.db.collection('rooms').findOne({ roomNumber })
      logger.info('ROOM SERVICE - Found room:', room ? JSON.stringify(room, null, 2) : 'null')
      return room ? this.transformToApi(room) : null
    } catch (error) {
      logger.error('ROOM SERVICE - Error finding room by number:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  async findAvailableRooms(checkIn: Date, checkOut: Date, category?: RoomCategory): Promise<IRoom<"api">[]> {
    try {
      logger.info('ROOM SERVICE - Finding available rooms for dates:', { checkIn, checkOut, category })
      const query: any = { isAvailable: true }
      if (category) {
        query.category = category.toLowerCase()
      }
      const rooms = await this.db.collection('rooms').find(query).toArray()
      logger.info('ROOM SERVICE - Found available rooms:', JSON.stringify(rooms, null, 2))
      return rooms.map(this.transformToApi)
    } catch (error) {
      logger.error('ROOM SERVICE - Error finding available rooms:', error)
      logger.error('ROOM SERVICE - Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  private transformToApi(dbRoom: IRoom<"db">): IRoom<"api"> {
    return {
      ...dbRoom,
      id: dbRoom._id.toString(),
      createdBy: dbRoom.createdBy.toString()
    }
  }
}
