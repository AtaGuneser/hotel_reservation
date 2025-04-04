import { createFileRoute } from '@tanstack/react-router'
import BookingList from '../../pages/BookingList'

export const Route = createFileRoute('/admin/bookings')({
  component: AdminBookings,
})

function AdminBookings() {
  return <BookingList />
} 