import { IRoom, RoomCategory } from '../models/Room'
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto'

export interface IRoomService {
  connect(): Promise<void>
  findAll(): Promise<IRoom<"api">[]>
  findById(id: string): Promise<IRoom<"api">>
  create(data: CreateRoomDto): Promise<IRoom<"api">>
  update(id: string, data: UpdateRoomDto): Promise<IRoom<"api">>
  delete(id: string): Promise<boolean>
  findByRoomNumber(roomNumber: string): Promise<IRoom<"api"> | null>
  findAvailableRooms(checkIn: Date, checkOut: Date, category?: RoomCategory): Promise<IRoom<"api">[]>
}
