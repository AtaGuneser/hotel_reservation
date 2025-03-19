import { create } from 'zustand'
import { Room } from '../services/api'

interface RoomStore {
  selectedRoom: Room | null
  setSelectedRoom: (room: Room | null) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  isEditDialogOpen: false,
  setIsEditDialogOpen: (open) => set({ isEditDialogOpen: open }),
  isCreateDialogOpen: false,
  setIsCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
})) 