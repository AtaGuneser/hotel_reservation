import { IBooking, BookingStatus } from '../../models/Booking'
import { IBaseService } from './IBaseService'

export interface IBookingService extends IBaseService<IBooking> {
  findByUserId(userId: string): Promise<IBooking[]>
  findByRoomId(roomId: string): Promise<IBooking[]>
  updateStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<IBooking | null>
  findOverlappingBookings(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<IBooking[]>
  calculateTotalPrice(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<number>
}
