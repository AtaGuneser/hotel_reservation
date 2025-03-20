import { ApiBooking } from '../models/Booking'
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto'

export interface IBookingService {
  connect(): Promise<void>
  findAll(): Promise<ApiBooking[]>
  findAllByUserId(userId: string): Promise<ApiBooking[]>
  findById(id: string): Promise<ApiBooking | null>
  create(bookingData: CreateBookingDto): Promise<ApiBooking>
  update(id: string, bookingData: UpdateBookingDto): Promise<ApiBooking>
  delete(id: string): Promise<boolean>
  checkAvailability(roomId: string, startDate: Date, endDate: Date): Promise<boolean>
}
