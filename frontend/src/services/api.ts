import axios from 'axios';
import { CreateBookingDto } from '../types/booking';
import { UpdateBookingDto } from '../types/booking';

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

// API instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  
  register: async (userData: RegisterUserDto) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Rooms API
export const roomsAPI = {
  getAll: async () => {
    const response = await api.get('/rooms/list');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/rooms/get/${id}`);
    return response.data;
  },
  
  create: async (roomData: CreateRoomDto) => {
    const response = await api.post('/rooms/create', roomData);
    return response.data;
  },
  
  update: async (id: string, roomData: UpdateRoomDto) => {
    const response = await api.put(`/rooms/update/${id}`, roomData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/rooms/delete/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  
  getUserBookings: async () => {
    const response = await api.get('/bookings/user');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  create: async (bookingData: CreateBookingDto) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  update: async (id: string, bookingData: UpdateBookingDto) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
  
  checkAvailability: async (roomId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/bookings/room/${roomId}/availability`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
}; 