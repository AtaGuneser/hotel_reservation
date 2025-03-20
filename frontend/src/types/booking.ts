export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface ApiBooking {
  id: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus | string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  roomId: string;
  userId?: string;
  startDate: Date;
  endDate: Date;
  guestCount: number;
  totalPrice: number;
  status?: BookingStatus;
  specialRequests?: string;
}

export interface UpdateBookingDto {
  roomId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  guestCount?: number;
  totalPrice?: number;
  status?: BookingStatus;
  specialRequests?: string;
} 