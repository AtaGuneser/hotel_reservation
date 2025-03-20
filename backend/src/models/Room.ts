import { ObjectId } from "mongodb"

/** Represents the room categories */
export enum RoomCategory {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential'
}

/** Base properties for audit tracking */
type AuditInfo = {
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}

/** Room amenity information */
type AmenityInfo = {
  name: string
  description?: string
}

/** Room pricing information */
type PricingInfo = {
  price: number
  capacity: number
}

/** Room status information */
type StatusInfo = {
  isAvailable: boolean
  lastStatusChangeAt: Date
  statusChangeReason?: string
}

/** Base room properties shared between DB and API */
type BaseRoom = AuditInfo & {
  roomNumber: string
  category: RoomCategory
  amenities: AmenityInfo[]
  description?: string
} & PricingInfo & StatusInfo

/** Database representation of a room */
type DbRoom = BaseRoom & {
  _id: ObjectId
  createdBy: ObjectId // User-ID from acc-svc
}

/** API representation of a room */
type ApiRoom = BaseRoom & {
  id: string
  createdBy: string // User-ID from acc-svc
}

/**
 * Represents a room in the system
 * @template T - The context type ("db" | "api") determining the ID field structure
 */
export type IRoom<T extends "db" | "api"> = T extends "db" ? DbRoom : ApiRoom

// Mongoose Schema
import mongoose, { Schema } from 'mongoose'

const RoomSchema = new Schema<IRoom<"db">>({
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
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    name: { type: String, required: true },
    description: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastStatusChangeAt: {
    type: Date,
    default: Date.now
  },
  statusChangeReason: String,
  description: String,
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true
})

export const Room = mongoose.model<IRoom<"db">>('Room', RoomSchema)
