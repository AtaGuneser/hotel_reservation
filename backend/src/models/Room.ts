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

export class Room implements IRoom {
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

  constructor (data: Partial<IRoom>) {
    this.roomNumber = data.roomNumber!
    this.category = data.category!
    this.price = data.price!
    this.amenities = data.amenities || []
    this.isAvailable = data.isAvailable ?? true
    this.description = data.description
    this.capacity = data.capacity!
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
