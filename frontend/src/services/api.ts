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
    const response = await fetch(`${API_URL}/rooms/list`)
    if (!response.ok) throw new Error('Failed to fetch rooms')
    return response.json()
  },

  create: async (room: CreateRoomDto): Promise<Room> => {
    console.log('API - Creating room with data:', JSON.stringify(room, null, 2))
    try {
      const response = await fetch(`${API_URL}/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      })
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        console.error('API - Response headers:', {
          status: response.status,
          statusText: response.statusText,
          contentType
        })
        
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        try {
          const text = await response.text()
          console.error('API - Raw error response:', text)
          if (contentType?.includes('application/json')) {
            const errorData = JSON.parse(text)
            errorMessage = errorData.message || errorMessage
          }
        } catch (error) {
          console.error('API - Error reading response:', error)
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('API - Success response:', data)
      return data
    } catch (error) {
      console.error('API - Request failed:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/rooms/delete/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete room')
  },

  update: async (id: string, data: Partial<CreateRoomDto>): Promise<Room> => {
    const response = await fetch(`${API_URL}/rooms/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update room')
    return response.json()
  }
} 