import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { BedDouble, Calendar, DollarSign, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { formatDate } from '../../utils/dateUtils'

interface Room {
  id: string
  roomNumber: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
}

interface Booking {
  id: string
  roomId: string
  roomNumber: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalPrice: number
  createdAt: string
}

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  totalBookings: number
  totalRevenue: number
  recentBookings: Booking[]
  roomOccupancy: Record<string, number>
  revenueByMonth: Record<string, number>
}

export default function Dashboard() {
  // Fetch dashboard data
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get<Room[]>('/rooms/list'),
        api.get<Booking[]>('/bookings')
      ])

      const rooms = roomsRes.data
      const bookings = bookingsRes.data

      // Calculate statistics
      const totalRooms = rooms.length
      const availableRooms = rooms.filter(room => room.status === 'AVAILABLE').length
      const totalBookings = bookings.length
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

      // Get recent bookings (last 5)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      // Calculate room occupancy
      const roomOccupancy = rooms.reduce((acc: Record<string, number>, room) => {
        acc[room.roomNumber] = bookings.filter(b => b.roomId === room.id).length
        return acc
      }, {})

      // Calculate revenue by month
      const revenueByMonth = bookings.reduce((acc: Record<string, number>, booking) => {
        const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short' })
        acc[month] = (acc[month] || 0) + booking.totalPrice
        return acc
      }, {})

      return {
        totalRooms,
        availableRooms,
        totalBookings,
        totalRevenue,
        recentBookings,
        roomOccupancy,
        revenueByMonth
      }
    }
  })

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading dashboard data</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.availableRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                    <TableCell>{booking.roomNumber}</TableCell>
                    <TableCell>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'CANCELLED' ? 'destructive' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Room Occupancy */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.roomOccupancy || {}).map(([roomNumber, count]) => (
                <div key={roomNumber} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span>Room {roomNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{count} bookings</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 