import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomsAPI, CreateRoomDto, UpdateRoomDto } from '../services/api'
import { toast } from 'sonner'

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomsAPI.getAll,
  })
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (room: CreateRoomDto) => {
      console.log('useCreateRoom - Sending request with data:', room)
      return roomsAPI.create(room)
    },
    onSuccess: () => {
      console.log('useCreateRoom - Success')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room created successfully')
    },
    onError: (error: Error) => {
      console.error('useCreateRoom - Error:', error)
      const errorMessage = error.message || 'Failed to create room'
      if (errorMessage.includes('Validation errors:')) {
        toast.error(errorMessage)
      } else {
        toast.error('Failed to create room')
      }
    },
  })
}

export const useDeleteRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete room')
    },
  })
}

export const useUpdateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoomDto> }) =>
        roomsAPI.update(id, data as UpdateRoomDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room updated successfully')
    },
    onError: () => {
      toast.error('Failed to update room')
    },
  })
} 