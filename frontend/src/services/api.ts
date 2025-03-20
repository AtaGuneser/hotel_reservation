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

// User related types
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface ApiUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: ApiUser
  token: string
}

export interface RegisterUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
      
      return response.json()
    } catch (error) {
      console.error('API - Login failed:', error)
      throw error
    }
  },
  
  register: async (userData: RegisterUserDto): Promise<ApiUser> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }
      
      return response.json()
    } catch (error) {
      console.error('API - Registration failed:', error)
      throw error
    }
  }
} 