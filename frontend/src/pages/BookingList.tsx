import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Edit, Trash2, Eye, Search } from 'lucide-react'
import { api, Room } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/dateUtils'
import { ApiBooking } from '../types/booking'
// Booking status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  }

  const color = statusColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}

export default function BookingList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch bookings based on user role
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/bookings' : '/bookings/user'
      const response = await api.get(endpoint)
      return response.data
    }
  })

  // Fetch room data for display
  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms/list')
      return response.data
    }
  })

  // Get room name by ID
  const getRoomName = (roomId: string) => {
    const room = rooms?.find((r: Room) => r.id === roomId)
    return room ? room.name : 'Unknown Room'
  }

  // Filter bookings based on search term
  const filteredBookings = bookings?.filter((booking: ApiBooking) => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const roomName = getRoomName(booking.roomId).toLowerCase()
    
    return (
      roomName.includes(searchLower) ||
      booking.status.toLowerCase().includes(searchLower) ||
      booking.id.toLowerCase().includes(searchLower)
    )
  })

  // Handle booking deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`)
        // Refetch bookings
        window.location.reload()
      } catch (error) {
        console.error('Error deleting booking:', error)
      }
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading bookings...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading bookings</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        
        {/* Search */}
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <Link
              to="/bookings/new"
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          )}
        </div>
      </div>

      {filteredBookings?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-gray-500">
            {isAdmin 
              ? "There are no bookings in the system yet." 
              : "You don't have any bookings yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings?.map((booking: ApiBooking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getRoomName(booking.roomId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.guestCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/bookings/${booking.id}/edit`}
                      className="text-yellow-600 hover:text-yellow-900 inline-flex items-center ml-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 