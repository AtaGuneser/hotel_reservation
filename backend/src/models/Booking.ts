import { ObjectId } from 'mongodb'

// MongoDB'de saklanan model
export interface DbBooking {
  _id: ObjectId
  roomId: ObjectId
  userId: ObjectId
  startDate: Date
  endDate: Date
  guestCount: number
  totalPrice: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

// API'de kullanılan model
export interface ApiBooking {
  id: string
  roomId: string
  userId: string
  startDate: Date
  endDate: Date
  guestCount: number
  totalPrice: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

// Bu koleksiyon ismini servis içinde kullanacağız
export const BOOKINGS_COLLECTION = 'bookings'
