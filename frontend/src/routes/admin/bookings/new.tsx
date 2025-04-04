import { createFileRoute } from '@tanstack/react-router'
import BookingForm from '../../../pages/BookingForm'

export const Route = createFileRoute('/admin/bookings/new')({
  component: NewBookingRoute,
})

function NewBookingRoute() {
  return <BookingForm />
} 