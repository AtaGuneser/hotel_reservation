import { createFileRoute } from '@tanstack/react-router'
import BookingForm from "../../../../pages/BookingForm"

export const Route = createFileRoute('/admin/bookings/$bookingId/edit')({
  component: EditBookingRoute,
})

function EditBookingRoute() {
  return <BookingForm />
} 