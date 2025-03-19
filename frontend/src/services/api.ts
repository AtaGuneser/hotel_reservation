export interface Room {
  id: string
  roomNumber: string
  category: string
  price: number
  capacity: number
  status: string
}

export interface CreateRoomDto {
  roomNumber: string
  category: string
  price: number
  capacity: number
  status: string
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

  update: async ({ id, ...data }: UpdateRoomDto): Promise<Room> => {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update room')
    return response.json()
  }
} 