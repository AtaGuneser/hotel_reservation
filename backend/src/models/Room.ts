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
export type DbRoom = BaseRoom & {
  _id: ObjectId
  createdBy: ObjectId // User-ID from acc-svc
}

/** API representation of a room */
export type ApiRoom = BaseRoom & {
  id: string
  createdBy: string // User-ID from acc-svc
}

/**
 * Represents a room in the system
 * @template T - The context type ("db" | "api") determining the ID field structure
 */
export type IRoom<T extends "db" | "api"> = T extends "db" ? DbRoom : ApiRoom

// MongoDB collection name
export const ROOMS_COLLECTION = 'rooms'
