import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundError,
  Authorized,
  CurrentUser,
  QueryParam
} from 'routing-controllers'
import { OpenAPI } from 'routing-controllers-openapi'
import { Service } from 'typedi'
import { BookingService } from '../services/BookingService'
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto'
import { ApiBooking } from '../models/Booking'
import { ApiUser } from '../models/User'

@JsonController('/bookings')
@Service()
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  @OpenAPI({
    summary: 'Get all bookings',
    description: 'Get a list of all bookings',
    security: [{ bearerAuth: [] }]
  })
  async getAllBookings(): Promise<ApiBooking[]> {
    return this.bookingService.findAll();
  }

  @Get('/user')
  @OpenAPI({
    summary: 'Get current user bookings',
    description: 'Get a list of bookings for the current user',
    security: [{ bearerAuth: [] }]
  })
  async getCurrentUserBookings(@CurrentUser() user: ApiUser): Promise<ApiBooking[]> {
    return this.bookingService.findAllByUserId(user.id);
  }

  @Get('/user/:userId')
  @OpenAPI({
    summary: 'Get bookings by user ID',
    description: 'Get a list of bookings for a specific user',
    security: [{ bearerAuth: [] }]
  })
  async getBookingsByUserId(@Param('userId') userId: string): Promise<ApiBooking[]> {
    return this.bookingService.findAllByUserId(userId);
  }

  @Get('/:id')
  @OpenAPI({
    summary: 'Get booking by ID',
    description: 'Get a booking by its ID',
    security: [{ bearerAuth: [] }]
  })
  async getBookingById(
    @Param('id') id: string,
    @CurrentUser() user: ApiUser
  ): Promise<ApiBooking> {
    const booking = await this.bookingService.findById(id);
    
    if (!booking) {
      throw new NotFoundError(`Booking with ID ${id} not found`);
    }
    
    // Users can only see their own bookings, admins can see all
    if (user.role !== 'admin' && booking.userId !== user.id) {
      throw new NotFoundError(`Booking with ID ${id} not found`);
    }
    
    return booking;
  }

  @Post()
  @OpenAPI({
    summary: 'Create a new booking',
    description: 'Create a new booking with the provided data',
    security: [{ bearerAuth: [] }]
  })
  async createBooking(
    @Body() bookingData: CreateBookingDto,
    @CurrentUser() user: ApiUser | null
  ): Promise<ApiBooking> {
    // Set the user ID to the current user if not provided
    if (!bookingData.userId && user) {
      bookingData.userId = user.id;
    }
    
    return this.bookingService.create(bookingData);
  }

  @Put('/:id')
  @OpenAPI({
    summary: 'Update a booking',
    description: 'Update a booking with the provided data',
    security: [{ bearerAuth: [] }]
  })
  async updateBooking(
    @Param('id') id: string,
    @Body() bookingData: UpdateBookingDto,
    @CurrentUser() user: ApiUser
  ): Promise<ApiBooking> {
    // Check if booking exists and belongs to user (or user is admin)
    const booking = await this.bookingService.findById(id);
    
    if (!booking) {
      throw new NotFoundError(`Booking with ID ${id} not found`);
    }
    
    if (user.role !== 'admin' && booking.userId !== user.id) {
      throw new NotFoundError(`Booking with ID ${id} not found`);
    }
    
    // Regular users can only update specialRequests
    if (user.role !== 'admin') {
      const allowedFields: (keyof UpdateBookingDto)[] = ['specialRequests'];
      
      // Filter the update data to only allow specific fields for non-admin users
      const filteredData: UpdateBookingDto = {} as UpdateBookingDto;
      
      for (const field of allowedFields) {
        if (field in bookingData) {
          (filteredData as any)[field] = (bookingData as any)[field];
        }
      }
      
      return this.bookingService.update(id, filteredData);
    }
    
    return this.bookingService.update(id, bookingData);
  }

  @Delete('/:id')
  @OpenAPI({
    summary: 'Delete a booking',
    description: 'Delete a booking by its ID',
    security: [{ bearerAuth: [] }]
  })
  async deleteBooking(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.bookingService.delete(id);
    return { success };
  }

  @Get('/room/:roomId/availability')
  @OpenAPI({
    summary: 'Check room availability',
    description: 'Check if a room is available for the specified dates'
  })
  async checkRoomAvailability(
    @Param('roomId') roomId: string,
    @QueryParam('startDate') startDate: string,
    @QueryParam('endDate') endDate: string
  ): Promise<{ available: boolean }> {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    
    const isAvailable = await this.bookingService.checkAvailability(roomId, start, end);
    
    return { available: isAvailable };
  }
} 