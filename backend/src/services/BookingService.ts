import { Service } from 'typedi'
import { Collection, ObjectId } from 'mongodb'
import { MongoClient } from 'mongodb'
import { IBookingService } from '../interfaces/IBookingService'
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto'
import { ApiBooking, DbBooking, BookingStatus, BOOKINGS_COLLECTION } from '../models/Booking'
import { logger } from '../utils/logger'
import { BadRequestError, NotFoundError } from 'routing-controllers'

@Service()
export class BookingService implements IBookingService {
  private client: MongoClient | null = null
  private collection: Collection<DbBooking> | null = null
  private readonly MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  private readonly DB_NAME = process.env.DB_NAME || 'hotel_reservation'

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to MongoDB for BookingService...')
      this.client = new MongoClient(this.MONGODB_URI)
      await this.client.connect()
      logger.info('Connected to MongoDB')
      
      const db = this.client.db(this.DB_NAME)
      this.collection = db.collection<DbBooking>(BOOKINGS_COLLECTION)
      
      // Create indexes for faster lookups
      await this.collection.createIndex({ roomId: 1 })
      await this.collection.createIndex({ userId: 1 })
      await this.collection.createIndex({ startDate: 1, endDate: 1 })
      logger.info('BookingService initialized successfully')
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error)
      throw error
    }
  }

  private async getCollection(): Promise<Collection<DbBooking>> {
    if (!this.collection) {
      await this.connect()
    }
    
    if (!this.collection) {
      throw new Error('Failed to get bookings collection')
    }
    
    return this.collection
  }

  private transformToApi = (dbBooking: DbBooking): ApiBooking => {
    // Destructure to rename _id to id
    const { _id, roomId, userId, ...rest } = dbBooking
    return {
      ...rest,
      id: _id.toString(),
      roomId: roomId.toString(),
      userId: userId.toString()
    }
  }

  async findAll(): Promise<ApiBooking[]> {
    try {
      logger.info('Finding all bookings')
      const collection = await this.getCollection()
      const bookings = await collection.find().sort({ createdAt: -1 }).toArray()
      return bookings.map(this.transformToApi)
    } catch (error) {
      logger.error('Error finding all bookings', error)
      throw error
    }
  }

  async findAllByUserId(userId: string): Promise<ApiBooking[]> {
    try {
      logger.info(`Finding bookings for user ID: ${userId}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(userId)) {
        throw new BadRequestError(`Invalid user ID: ${userId}`)
      }
      
      const bookings = await collection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()
      
      return bookings.map(this.transformToApi)
    } catch (error) {
      logger.error(`Error finding bookings for user ID: ${userId}`, error)
      throw error
    }
  }

  async findById(id: string): Promise<ApiBooking | null> {
    try {
      logger.info(`Finding booking by ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid booking ID: ${id}`)
      }
      
      const booking = await collection.findOne({ _id: new ObjectId(id) })
      
      if (!booking) {
        return null
      }
      
      return this.transformToApi(booking)
    } catch (error) {
      logger.error(`Error finding booking by ID: ${id}`, error)
      throw error
    }
  }

  async create(bookingData: CreateBookingDto): Promise<ApiBooking> {
    try {
      logger.info('Creating new booking')
      const collection = await this.getCollection()
      
      // Check room ID is valid
      if (!ObjectId.isValid(bookingData.roomId)) {
        throw new BadRequestError(`Invalid room ID: ${bookingData.roomId}`)
      }
      
      // Check user ID is valid if provided
      if (bookingData.userId && !ObjectId.isValid(bookingData.userId)) {
        throw new BadRequestError(`Invalid user ID: ${bookingData.userId}`)
      }
      
      // Validate dates
      const startDate = new Date(bookingData.startDate)
      const endDate = new Date(bookingData.endDate)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestError('Invalid date format')
      }
      
      if (startDate >= endDate) {
        throw new BadRequestError('Start date must be before end date')
      }
      
      // Check room availability
      const isAvailable = await this.checkAvailability(
        bookingData.roomId,
        startDate,
        endDate
      )
      
      if (!isAvailable) {
        throw new BadRequestError('Room is not available for the selected dates')
      }
      
      const now = new Date()
      
      // Create new booking
      const newBooking: DbBooking = {
        _id: new ObjectId(),
        roomId: new ObjectId(bookingData.roomId),
        userId: bookingData.userId ? new ObjectId(bookingData.userId) : new ObjectId(),
        startDate,
        endDate,
        guestCount: bookingData.guestCount,
        totalPrice: bookingData.totalPrice,
        status: bookingData.status || BookingStatus.PENDING,
        specialRequests: bookingData.specialRequests,
        createdAt: now,
        updatedAt: now
      }
      
      const result = await collection.insertOne(newBooking)
      
      if (!result.acknowledged) {
        throw new Error('Failed to create booking')
      }
      
      return this.transformToApi(newBooking)
    } catch (error) {
      logger.error('Error creating booking', error)
      throw error
    }
  }

  async update(id: string, bookingData: UpdateBookingDto): Promise<ApiBooking> {
    try {
      logger.info(`Updating booking with ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid booking ID: ${id}`)
      }
      
      // Check if booking exists
      const existingBooking = await collection.findOne({ _id: new ObjectId(id) })
      if (!existingBooking) {
        throw new NotFoundError(`Booking with ID ${id} not found`)
      }
      
      // Check room ID is valid if provided
      if (bookingData.roomId && !ObjectId.isValid(bookingData.roomId)) {
        throw new BadRequestError(`Invalid room ID: ${bookingData.roomId}`)
      }
      
      // Check user ID is valid if provided
      if (bookingData.userId && !ObjectId.isValid(bookingData.userId)) {
        throw new BadRequestError(`Invalid user ID: ${bookingData.userId}`)
      }
      
      // Validate dates if provided
      let startDate = existingBooking.startDate
      let endDate = existingBooking.endDate
      
      if (bookingData.startDate) {
        startDate = new Date(bookingData.startDate)
        if (isNaN(startDate.getTime())) {
          throw new BadRequestError('Invalid start date format')
        }
      }
      
      if (bookingData.endDate) {
        endDate = new Date(bookingData.endDate)
        if (isNaN(endDate.getTime())) {
          throw new BadRequestError('Invalid end date format')
        }
      }
      
      if (startDate >= endDate) {
        throw new BadRequestError('Start date must be before end date')
      }
      
      // Check room availability if dates or room changed
      if (
        (bookingData.startDate || bookingData.endDate || bookingData.roomId) &&
        bookingData.status !== BookingStatus.CANCELLED
      ) {
        const roomId = bookingData.roomId || existingBooking.roomId.toString()
        
        // Only check availability for other bookings (exclude this one)
        const isAvailable = await this.checkAvailability(
          roomId,
          startDate,
          endDate,
          id
        )
        
        if (!isAvailable) {
          throw new BadRequestError('Room is not available for the selected dates')
        }
      }
      
      const updateData: Partial<DbBooking> = {
        ...(bookingData.roomId && { roomId: new ObjectId(bookingData.roomId) }),
        ...(bookingData.userId && { userId: new ObjectId(bookingData.userId) }),
        ...(bookingData.startDate && { startDate }),
        ...(bookingData.endDate && { endDate }),
        ...(bookingData.guestCount !== undefined && { guestCount: bookingData.guestCount }),
        ...(bookingData.totalPrice !== undefined && { totalPrice: bookingData.totalPrice }),
        ...(bookingData.status !== undefined && { status: bookingData.status }),
        ...(bookingData.specialRequests !== undefined && { specialRequests: bookingData.specialRequests }),
        updatedAt: new Date()
      }
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
      
      if (!result) {
        throw new Error('Failed to update booking')
      }
      
      return this.transformToApi(result)
    } catch (error) {
      logger.error(`Error updating booking with ID: ${id}`, error)
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting booking with ID: ${id}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid booking ID: ${id}`)
      }
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      
      if (result.deletedCount === 0) {
        throw new NotFoundError(`Booking with ID ${id} not found`)
      }
      
      return true
    } catch (error) {
      logger.error(`Error deleting booking with ID: ${id}`, error)
      throw error
    }
  }

  async checkAvailability(
    roomId: string, 
    startDate: Date, 
    endDate: Date, 
    excludeBookingId?: string
  ): Promise<boolean> {
    try {
      logger.info(`Checking availability for room ID: ${roomId} from ${startDate} to ${endDate}`)
      const collection = await this.getCollection()
      
      if (!ObjectId.isValid(roomId)) {
        throw new BadRequestError(`Invalid room ID: ${roomId}`)
      }
      
      const query: any = {
        roomId: new ObjectId(roomId),
        status: { $nin: [BookingStatus.CANCELLED] },
        $or: [
          { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlapping dates
        ]
      }
      
      // Exclude current booking when updating
      if (excludeBookingId && ObjectId.isValid(excludeBookingId)) {
        query._id = { $ne: new ObjectId(excludeBookingId) }
      }
      
      const overlappingBookingsCount = await collection.countDocuments(query)
      
      return overlappingBookingsCount === 0
    } catch (error) {
      logger.error(`Error checking availability for room ID: ${roomId}`, error)
      throw error
    }
  }
}
