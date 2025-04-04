import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Calendar, User, Home, DollarSign, FileText, Clock } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatDate, calculateNights } from '../utils/dateUtils'
import { ApiBooking } from '../types/booking'
import { ApiRoom } from '../types/room'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  }

  const color = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <Badge variant="outline" className={color}>
      {status}
    </Badge>
  )
}

export default function BookingDetails() {
  const { bookingId } = useParams({ from: '/admin/bookings/$bookingId' })
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  
  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery<ApiBooking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`)
      return response.data
    }
  })

  // Fetch room details
  const { data: room } = useQuery<ApiRoom>({
    queryKey: ['room', booking?.roomId],
    enabled: !!booking?.roomId,
    queryFn: async () => {
      const response = await api.get(`/rooms/${booking?.roomId}`)
      return response.data
    }
  })

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return api.put(`/bookings/${bookingId}`, { status: 'CANCELLED' })
    },
    onSuccess: () => {
      navigate({ to: '/admin/bookings' })
    }
  })

  // Delete booking mutation (admin only)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/bookings/${bookingId}`)
    },
    onSuccess: () => {
      navigate({ to: '/admin/bookings' })
    }
  })

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate()
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading booking details...</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading booking details or booking not found
      </div>
    )
  }

  // Calculate number of nights
  const nights = calculateNights(booking.startDate, booking.endDate)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/admin/bookings" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <StatusBadge status={booking.status} />
        </div>
        
        <div className="flex space-x-2">
          {(isAdmin || booking.status === 'PENDING') && booking.status !== 'CANCELLED' && (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
            >
              Cancel Booking
            </Button>
          )}
          
          <Link to="/admin/bookings/$bookingId/edit" params={{ bookingId }}>
            <Button className="flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
          {isAdmin && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Booking Info */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Stay Period</p>
                  <p className="font-medium">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </p>
                  <p className="text-sm text-gray-500">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium">{room?.roomNumber || 'Loading...'}</p>
                  {room && (
                    <p className="text-sm text-gray-500">{room.type} - ${room.price}/night</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Booking Created</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="font-medium">
                    {booking.specialRequests ? booking.specialRequests : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {room?.imageUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Room Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden">
              <img 
                src={room.imageUrl} 
                alt={room.roomNumber} 
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-700">{room.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 