import { IRoom } from '../models/Room'
import { CreateRoomDto } from '../dto/room.dto'

export interface IRoomService {
  findAll(): Promise<IRoom<"api">[]>
  findById(id: string): Promise<IRoom<"api">>
  create(roomData: CreateRoomDto): Promise<IRoom<"api">>
  update(id: string, data: Partial<IRoom<"api">>): Promise<IRoom<"api">>
  delete(id: string): Promise<boolean>
  findByRoomNumber(roomNumber: string): Promise<IRoom<"api"> | null>
  findAvailableRooms(checkIn: Date, checkOut: Date, category?: string): Promise<IRoom<"api">[]>
}
