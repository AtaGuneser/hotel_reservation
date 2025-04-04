import { createFileRoute } from '@tanstack/react-router'
import BookingDetails from '../../../pages/BookingDetails'

export const Route = createFileRoute('/admin/bookings/$bookingId')({
  component: BookingDetailsRoute,
})

function BookingDetailsRoute() {
  return <BookingDetails />
} 