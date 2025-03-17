export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export interface IBooking {
  id?: string
  userId: string
  roomId: string
  checkIn: Date
  checkOut: Date
  status: BookingStatus
  totalPrice: number
  numberOfGuests: number
  specialRequests?: string
  createdAt?: Date
  updatedAt?: Date
}
