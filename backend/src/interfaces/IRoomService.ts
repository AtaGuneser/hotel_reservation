import { IRoom, RoomCategory } from '../../models/Room'
import { IBaseService } from './IBaseService'

export interface IRoomService extends IBaseService<IRoom> {
  findByRoomNumber(roomNumber: string): Promise<IRoom | null>
  findAvailableRooms(
    checkIn: Date,
    checkOut: Date,
    category?: RoomCategory
  ): Promise<IRoom[]>
  updateAvailability(
    roomId: string,
    isAvailable: boolean
  ): Promise<IRoom | null>
}
