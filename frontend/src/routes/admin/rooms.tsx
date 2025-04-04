import { createFileRoute } from '@tanstack/react-router'
import Rooms from '../../pages/admin/Rooms'

export const Route = createFileRoute('/admin/rooms')({
  component: AdminRooms,
})

function AdminRooms() {
  return <Rooms />
} 