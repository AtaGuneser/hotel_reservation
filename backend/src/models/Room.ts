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
  capacity?: number
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
  capacity?: number
  createdAt?: Date
  updatedAt?: Date

  constructor (data: Partial<IRoom>) {
    if (!data.roomNumber) {
      throw new Error('Room number is required')
    }
    this.roomNumber = data.roomNumber
    
    // Safely convert category to RoomCategory
    if (data.category) {
      const categoryStr = typeof data.category === 'string' ? data.category.toUpperCase() : data.category
      if (Object.values(RoomCategory).includes(categoryStr as RoomCategory)) {
        this.category = categoryStr as RoomCategory
      } else {
        throw new Error(`Invalid category value: ${data.category}`)
      }
    } else {
      throw new Error('Category is required')
    }
    
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new Error('Price must be a positive number')
    }
    this.price = data.price
    
    this.amenities = data.amenities || []
    this.isAvailable = data.isAvailable ?? true
    this.description = data.description
    
    if (data.capacity !== undefined && (typeof data.capacity !== 'number' || data.capacity < 1)) {
      throw new Error('Capacity must be a positive number')
    }
    this.capacity = data.capacity
    
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
