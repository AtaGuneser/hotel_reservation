import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Save, DollarSign } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { calculateNights, getMinDate, getMaxDate } from '../utils/dateUtils'
import { BookingStatus, ApiBooking, CreateBookingDto, UpdateBookingDto } from '../types/booking'
import { ApiRoom } from '../types/room'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"

export default function BookingForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = !!id
  
  // Form state
  const [formData, setFormData] = useState<CreateBookingDto | UpdateBookingDto>({
    roomId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // tomorrow
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
      const response = await api.get('/rooms/list')
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
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        guestCount: booking.guestCount,
        totalPrice: booking.totalPrice,
        specialRequests: booking.specialRequests
      })
    }
  }, [isEditMode, booking])
  
  // Calculate total price when room, start date, or end date changes
  useEffect(() => {
    if (formData.roomId && formData.startDate && formData.endDate) {
      const selectedRoom = rooms?.find(room => room.id === formData.roomId)
      if (selectedRoom) {
        const nights = calculateNights(formData.startDate.toISOString(), formData.endDate.toISOString())
        const total = selectedRoom.price * nights
        setFormData(prev => ({ ...prev, totalPrice: total }))
      }
    }
  }, [formData.roomId, formData.startDate, formData.endDate, rooms])
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'startDate' || name === 'endDate' ? new Date(value) : value 
    }))
    
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
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
    
    const bookingData = {
      ...formData,
      userId: user.id,
      status: BookingStatus.PENDING,
    } as CreateBookingDto;
    
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync(bookingData);
        toast.success('Booking updated successfully!');
      } else {
        await createMutation.mutateAsync(bookingData);
        toast.success('Booking created successfully!');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server error response:', error.response.data);
        if (error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
          interface ValidationError {
            property: string;
            constraints?: Record<string, string>;
          }
          
          const serverErrors = error.response.data.errors.reduce((acc: Record<string, string>, err: ValidationError) => {
            const field = err.property;
            acc[field] = err.constraints ? Object.values(err.constraints)[0] as string : 'Invalid value';
            return acc;
          }, {});
          setErrors(prev => ({ ...prev, ...serverErrors }));
          toast.error('Please fix the validation errors');
        } else {
          toast.error(error.response.data.message || 'Error saving booking');
        }
      } else {
        toast.error('An error occurred while saving the booking');
      }
    }
  };
  
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
      <Card>
        <CardHeader>
          <CardTitle>Booking Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="roomId">Room</Label>
              <Select
                name="roomId"
                value={formData.roomId}
                onValueChange={(value) => handleChange({ target: { name: 'roomId', value } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.roomNumber} - ${room.price}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <p className="text-sm text-red-500">{errors.roomId}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Check-in Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate?.toISOString().split('T')[0]}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Check-out Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate?.toISOString().split('T')[0]}
                  onChange={handleChange}
                  min={formData.startDate?.toISOString().split('T')[0]}
                  max={getMaxDate()}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <Label htmlFor="guestCount">Number of Guests</Label>
              <Input
                type="number"
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                min={1}
                max={rooms?.find(room => room.id === formData.roomId)?.maxGuests || 4}
              />
              {errors.guestCount && (
                <p className="text-sm text-red-500">{errors.guestCount}</p>
              )}
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="Any special requests or requirements..."
                rows={4}
              />
            </div>

            <Separator />

            {/* Total Price */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Total Price:</span>
              </div>
              <span className="text-xl font-bold">${formData.totalPrice?.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Booking' : 'Create Booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 