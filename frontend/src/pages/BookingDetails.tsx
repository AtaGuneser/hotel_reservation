import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Calendar, User, Home, DollarSign, FileText, Clock } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatDate, calculateNights } from '../utils/dateUtils'
import { ApiBooking } from '../types/booking'
import { ApiRoom } from '../types/room'

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
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      {status}
    </span>
  )
}

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery<ApiBooking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`)
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
      return api.put(`/bookings/${id}`, { status: 'CANCELLED' })
    },
    onSuccess: () => {
      navigate('/bookings')
    }
  })

  // Delete booking mutation (admin only)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/bookings/${id}`)
    },
    onSuccess: () => {
      navigate('/bookings')
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
          <Link to="/bookings" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <StatusBadge status={booking.status} />
        </div>
        
        <div className="flex space-x-2">
          {(isAdmin || booking.status === 'PENDING') && booking.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
            >
              Cancel Booking
            </button>
          )}
          
          <Link
            to={`/bookings/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Stay Period</p>
                  <p className="font-medium">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </p>
                  <p className="text-sm text-gray-500">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Home className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium">{room?.name || 'Loading...'}</p>
                  {room && (
                    <p className="text-sm text-gray-500">{room.type} - ${room.price}/night</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Booking Created</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="font-medium">
                    {booking.specialRequests ? booking.specialRequests : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {room?.imageUrl && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-medium mb-3">Room Preview</h3>
            <div className="rounded-lg overflow-hidden">
              <img 
                src={room.imageUrl} 
                alt={room.name} 
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-700">{room.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 