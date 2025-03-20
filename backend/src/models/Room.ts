import mongoose, { Schema, Document, Model } from 'mongoose'

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

export interface IRoom extends Document {
  roomNumber: string
  category: RoomCategory
  price: number
  amenities: IAmenity[]
  isAvailable: boolean
  description?: string
  capacity?: number
  createdAt: Date
  updatedAt: Date
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: Object.values(RoomCategory),
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    name: { type: String, required: true },
    description: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: String,
  capacity: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
})

export const Room = mongoose.model<IRoom>('Room', RoomSchema)
