import { Service } from 'typedi'
import { MongoClient, ObjectId, Collection } from 'mongodb'
import { IRoom, RoomCategory, ROOMS_COLLECTION, DbRoom, ApiRoom } from '../models/Room'
import { IRoomService } from '../interfaces/IRoomService'
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto'
import { logger } from '../utils/logger'

@Service()
export class RoomService implements IRoomService {  
  private client: MongoClient
  private db: any
  private rooms: Collection<DbRoom>

  constructor() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_reservation'
    this.client = new MongoClient(mongoURI)
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect()
      this.db = this.client.db()
      this.rooms = this.db.collection(ROOMS_COLLECTION)
      logger.info('Connected to MongoDB successfully')
    } catch (error) {
      logger.error('MongoDB Connection Error:', error)
      throw error
    }
  }

  async findAll(): Promise<IRoom<"api">[]> {
    try {
      const rooms = await this.rooms.find().toArray()
      return rooms.map(this.transformToApi)
    } catch (error) {
      logger.error('Error finding all rooms:', error)
      throw error
    }
  }

  async findById(id: string): Promise<IRoom<"api">> {
    try {
      const room = await this.rooms.findOne({ _id: new ObjectId(id) })
      if (!room) {
        throw new Error(`Room with id ${id} not found`)
      }
      return this.transformToApi(room)
    } catch (error) {
      logger.error(`Error finding room by id ${id}:`, error)
      throw error
    }
  }

  async create(data: CreateRoomDto): Promise<IRoom<"api">> {
    try {
      // Check if room number already exists
      const existingRoom = await this.findByRoomNumber(data.roomNumber)
      if (existingRoom) {
        throw new Error(`Room with number ${data.roomNumber} already exists`)
      }      

      const now = new Date()
      const room: DbRoom = {
        _id: new ObjectId(),
        roomNumber: data.roomNumber,
        category: data.category,
        price: Number(data.price),
        capacity: Number(data.capacity),
        isAvailable: Boolean(data.isAvailable),
        description: data.description,
        amenities: data.amenities || [],
        createdAt: now,
        updatedAt: now,
        lastStatusChangeAt: now,
        statusChangeReason: undefined,
        metadata: {},
        createdBy: new ObjectId('000000000000000000000000') 
      }

      await this.rooms.insertOne(room)
      return this.transformToApi(room)
    } catch (error) {
      logger.error('Error creating room:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateRoomDto): Promise<IRoom<"api">> {
    try {
      const updateData: Partial<DbRoom> = { ...data, updatedAt: new Date() }
      
     
      if (updateData.price !== undefined) updateData.price = Number(updateData.price)
      if (updateData.capacity !== undefined) updateData.capacity = Number(updateData.capacity)
      if (updateData.isAvailable !== undefined) updateData.isAvailable = Boolean(updateData.isAvailable)
      
      // Remove id if present (it's not part of the DB schema)
      delete (updateData as any).id
      
      // Update the document
      const result = await this.rooms.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
      
      if (!result) {
        throw new Error(`Room with id ${id} not found`)
      }
      
      return this.transformToApi(result)
    } catch (error) {
      logger.error(`Error updating room ${id}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.rooms.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch (error) {
      logger.error(`Error deleting room ${id}:`, error)
      throw error
    }
  }

  async findByRoomNumber(roomNumber: string): Promise<IRoom<"api"> | null> {
    try {
      const room = await this.rooms.findOne({ roomNumber })
      return room ? this.transformToApi(room) : null
    } catch (error) {
      logger.error(`Error finding room by number ${roomNumber}:`, error)
      throw error
    }
  }

  async findAvailableRooms(checkIn: Date, checkOut: Date, category?: RoomCategory): Promise<IRoom<"api">[]> {
    try {
      const query: any = { isAvailable: true }
      if (category) {
        query.category = typeof category === 'string' 
          ? category.toLowerCase() 
          : category
      }
      
      const rooms = await this.rooms.find(query).toArray()
      return rooms.map(this.transformToApi)
    } catch (error) {
      logger.error('Error finding available rooms:', error)
      throw error
    }
  }

  private transformToApi(dbRoom: DbRoom): ApiRoom {
    return {
      ...dbRoom,
      id: dbRoom._id.toString(),
      createdBy: dbRoom.createdBy.toString()
    }
  }
}
