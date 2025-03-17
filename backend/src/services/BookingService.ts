import { IBookingService } from './interfaces/IBookingService'
import { IBooking, BookingStatus } from '../models/Booking'
import { IRoomService } from './interfaces/IRoomService'

export class BookingService implements IBookingService {
  private bookings: IBooking[] = []

  constructor (private roomService: IRoomService) {}

  async findAll (): Promise<IBooking[]> {
    return this.bookings
  }

  async findById (id: string): Promise<IBooking | null> {
    return this.bookings.find(booking => booking.id === id) || null
  }

  async create (data: Partial<IBooking>): Promise<IBooking> {
    const room = await this.roomService.findById(data.roomId!)
    if (!room) {
      throw new Error('Room not found')
    }

    const totalPrice = await this.calculateTotalPrice(
      data.roomId!,
      data.checkIn!,
      data.checkOut!
    )

    const booking: IBooking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.userId!,
      roomId: data.roomId!,
      checkIn: data.checkIn!,
      checkOut: data.checkOut!,
      status: BookingStatus.PENDING,
      totalPrice,
      numberOfGuests: data.numberOfGuests!,
      specialRequests: data.specialRequests,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.bookings.push(booking)
    return booking
  }

  async update (id: string, data: Partial<IBooking>): Promise<IBooking | null> {
    const index = this.bookings.findIndex(booking => booking.id === id)
    if (index === -1) return null

    const booking = this.bookings[index]
    const updatedBooking = {
      ...booking,
      ...data,
      updatedAt: new Date()
    }

    this.bookings[index] = updatedBooking
    return updatedBooking
  }

  async delete (id: string): Promise<boolean> {
    const index = this.bookings.findIndex(booking => booking.id === id)
    if (index === -1) return false

    this.bookings.splice(index, 1)
    return true
  }

  async findByUserId (userId: string): Promise<IBooking[]> {
    return this.bookings.filter(booking => booking.userId === userId)
  }

  async findByRoomId (roomId: string): Promise<IBooking[]> {
    return this.bookings.filter(booking => booking.roomId === roomId)
  }

  async updateStatus (
    id: string,
    status: BookingStatus
  ): Promise<IBooking | null> {
    return this.update(id, { status })
  }

  async findOverlappingBookings (
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<IBooking[]> {
    return this.bookings.filter(booking => {
      if (booking.roomId !== roomId) return false
      if (booking.status === BookingStatus.CANCELLED) return false

      return (
        (checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
        (checkOut > booking.checkIn && checkOut <= booking.checkOut) ||
        (checkIn <= booking.checkIn && checkOut >= booking.checkOut)
      )
    })
  }

  async calculateTotalPrice (
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<number> {
    const room = await this.roomService.findById(roomId)
    if (!room) {
      throw new Error('Room not found')
    }

    const days = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )
    return room.price * days
  }
}
