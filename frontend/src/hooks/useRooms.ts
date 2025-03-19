import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomService, CreateRoomDto } from '../services/api'
import { toast } from 'sonner'

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getAll,
  })
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (room: CreateRoomDto) => roomService.create(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room created successfully')
    },
    onError: () => {
      toast.error('Failed to create room')
    },
  })
}

export const useDeleteRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomService.delete(id),
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
      roomService.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room updated successfully')
    },
    onError: () => {
      toast.error('Failed to update room')
    },
  })
} 