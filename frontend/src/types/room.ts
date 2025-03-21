export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface ApiRoom {
  id: string;
  roomNumber: string;
  description: string;
  type: RoomType | string;
  price: number;
  maxGuests: number;
  status: RoomStatus | string;
  amenities: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  description: string;
  type: RoomType | string;
  price: number;
  maxGuests: number;
  status?: RoomStatus | string;
  amenities?: string[];
  imageUrl?: string;
}

export interface UpdateRoomDto {
  name?: string;
  description?: string;
  type?: RoomType | string;
  price?: number;
  maxGuests?: number;
  status?: RoomStatus | string;
  amenities?: string[];
  imageUrl?: string;
} 