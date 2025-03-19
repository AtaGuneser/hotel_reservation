export enum RoomCategory {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential'
}

export interface Room {
  id: string
  roomNumber: string
  category: RoomCategory
  price: number
  capacity: number
  isAvailable: boolean
  amenities: Array<{
    name: string
    description?: string
  }>
  description?: string
}

export interface CreateRoomDto {
  roomNumber: string
  category: RoomCategory
  price: number
  capacity: number
  isAvailable: boolean
  amenities: Array<{
    name: string
    description?: string
  }>
  description?: string
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  id: string
}

const API_URL = 'http://localhost:3000'

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    const response = await fetch(`${API_URL}/rooms`)
    if (!response.ok) throw new Error('Failed to fetch rooms')
    return response.json()
  },

  create: async (room: CreateRoomDto): Promise<Room> => {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    })
    if (!response.ok) throw new Error('Failed to create room')
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete room')
  },

  update: async (id: string, data: Partial<CreateRoomDto>): Promise<Room> => {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update room')
    return response.json()
  }
} 