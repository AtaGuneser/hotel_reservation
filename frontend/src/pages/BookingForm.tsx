import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Save, Calendar, Users, DollarSign, FileText } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatDateForInput, calculateNights, getMinDate, getMaxDate } from '../utils/dateUtils'
import { BookingStatus, ApiBooking, CreateBookingDto, UpdateBookingDto } from '../types/booking'
import { ApiRoom } from '../types/room'

export default function BookingForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isEditMode = !!id
  
  // Form state
  const [formData, setFormData] = useState<CreateBookingDto | UpdateBookingDto>({
    roomId: '',
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date(Date.now() + 86400000)), // tomorrow
    guestCount: 1,
    totalPrice: 0,
    specialRequests: ''
  })
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Fetch rooms for selection
  const { data: rooms } = useQuery<ApiRoom[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms')
      return response.data
    }
  })
  
  // Fetch booking details if in edit mode
  const { data: booking, isLoading: isBookingLoading } = useQuery<ApiBooking>({
    queryKey: ['booking', id],
    enabled: isEditMode,
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`)
      return response.data
    }
  })
  
  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      return api.post('/bookings', data)
    },
    onSuccess: () => {
      navigate('/bookings')
    }
  })
  
  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBookingDto) => {
      return api.put(`/bookings/${id}`, data)
    },
    onSuccess: () => {
      navigate(`/bookings/${id}`)
    }
  })
  
  // Set form data when booking is loaded in edit mode
  useEffect(() => {
    if (isEditMode && booking) {
      setFormData({
        roomId: booking.roomId,
        startDate: formatDateForInput(booking.startDate),
        endDate: formatDateForInput(booking.endDate),
        guestCount: booking.guestCount,
        totalPrice: booking.totalPrice,
        status: booking.status,
        specialRequests: booking.specialRequests
      })
    }
  }, [isEditMode, booking])
  
  // Calculate total price when room, start date, or end date changes
  useEffect(() => {
    if (formData.roomId && formData.startDate && formData.endDate) {
      const selectedRoom = rooms?.find(room => room.id === formData.roomId)
      if (selectedRoom) {
        const nights = calculateNights(formData.startDate, formData.endDate)
        const total = selectedRoom.price * nights
        setFormData(prev => ({ ...prev, totalPrice: total }))
      }
    }
  }, [formData.roomId, formData.startDate, formData.endDate, rooms])
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Please select a check-in date'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Please select a check-out date'
    }
    
    const startDate = new Date(formData.startDate || '')
    const endDate = new Date(formData.endDate || '')
    
    if (startDate >= endDate) {
      newErrors.endDate = 'Check-out date must be after check-in date'
    }
    
    if (formData.guestCount && formData.guestCount < 1) {
      newErrors.guestCount = 'Must have at least 1 guest'
    }
    
    const selectedRoom = rooms?.find(room => room.id === formData.roomId)
    if (selectedRoom && formData.guestCount && formData.guestCount > selectedRoom.maxGuests) {
      newErrors.guestCount = `Maximum ${selectedRoom.maxGuests} guests allowed for this room`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (isEditMode) {
      // Filter out unchanged fields for update
      const updatedFields = Object.entries(formData).reduce((acc, [key, value]) => {
        if (booking && (booking as ApiBooking)[key as keyof ApiBooking] !== value) {
          acc[key as keyof UpdateBookingDto] = value
        }
        return acc
      }, {} as UpdateBookingDto)
      
      updateMutation.mutate(updatedFields)
    } else {
      // Set user ID for new booking
      const newBookingData = {
        ...formData,
        userId: user?.id
      } as CreateBookingDto
      
      createMutation.mutate(newBookingData)
    }
  }
  
  // Check if room is available
  //   const checkRoomAvailability = async () => {
  //   if (!formData.roomId || !formData.startDate || !formData.endDate) {
  //     return false
  //   }
    
  //   try {
  //     const response = await api.get(`/bookings/room/${formData.roomId}/availability`, {
  //       params: {
  //         startDate: formData.startDate,
  //         endDate: formData.endDate
  //       }
  //     })
      
  //     if (!response.data.available) {
  //       setErrors(prev => ({
  //         ...prev,
  //         roomId: 'This room is not available for the selected dates'
  //       }))
  //       return false
  //     }
      
  //     return true
  //   } catch (error) {
  //     console.error('Error checking room availability:', error)
  //     setErrors(prev => ({
  //       ...prev,
  //       roomId: 'Error checking room availability'
  //     }))
  //     return false
  //   }
  // }
  
  if (isEditMode && isBookingLoading) {
    return <div className="p-8 text-center">Loading booking details...</div>
  }
  
  // Check if the user has permission to edit this booking
  if (isEditMode && booking && !isAdmin && booking.userId !== user?.id) {
    return (
      <div className="p-8 text-center text-red-500">
        You do not have permission to edit this booking
      </div>
    )
  }
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 space-x-4">
        <Link to={isEditMode ? `/bookings/${id}` : '/bookings'} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Booking' : 'New Booking'}
        </h1>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Room Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.roomId ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isEditMode && !isAdmin}
              required
            >
              <option value="">Select a room</option>
              {rooms?.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.type} (${room.price}/night, max {room.maxGuests} guests)
                </option>
              ))}
            </select>
            {errors.roomId && <p className="text-red-500 text-sm">{errors.roomId}</p>}
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || getMinDate()}
                  max={getMaxDate()}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
            </div>
          </div>
          
          {/* Guest Count & Total Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  min="1"
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.guestCount ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
              {errors.guestCount && <p className="text-red-500 text-sm">{errors.guestCount}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Total Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500">Calculated automatically based on room and dates</p>
            </div>
          </div>
          
          {/* Status Selection (Admin only) */}
          {isAdmin && isEditMode && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {Object.values(BookingStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Special Requests */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Special Requests</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <textarea
                name="specialRequests"
                value={formData.specialRequests || ''}
                onChange={handleChange}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                placeholder="Any special requests or requirements?"
              />
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <Link
            to={isEditMode ? `/bookings/${id}` : '/bookings'}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isEditMode
                ? 'Update Booking'
                : 'Create Booking'
            }
          </button>
        </div>
      </form>
    </div>
  )
} 