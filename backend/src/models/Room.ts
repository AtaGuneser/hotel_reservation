export enum RoomCategory {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential'
}

export interface IAmenity {
  name: string
  description?: string
}

export interface IRoom {
  id?: string
  roomNumber: string
  category: RoomCategory
  price: number
  amenities: IAmenity[]
  isAvailable: boolean
  description?: string
  capacity: number
  createdAt?: Date
  updatedAt?: Date
}
