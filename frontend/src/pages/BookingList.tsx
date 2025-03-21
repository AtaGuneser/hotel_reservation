import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Edit, Trash2, Eye } from 'lucide-react'
import { api, Room } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/dateUtils'
import { ApiBooking } from '../types/booking'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { DataTablePagination } from "../components/ui/data-table-pagination"
import { DataTableToolbar } from "../components/ui/data-table-toolbar"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

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
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

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
    return room ? room.roomNumber : 'Unknown Room'
  }

  const columns: ColumnDef<ApiBooking>[] = [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: ({ row }) => (row.getValue("id") as string).substring(0, 8) + "..."
    },
    {
      accessorKey: "roomId",
      header: "Room",
      cell: ({ row }) => getRoomName(row.getValue("roomId") as string)
    },
    {
      accessorKey: "startDate",
      header: "Dates",
      cell: ({ row }) => {
        const startDate = row.getValue("startDate") as string;
        const endDate = row.original.endDate;
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    },
    {
      accessorKey: "guestCount",
      header: "Guests",
    },
    {
      accessorKey: "totalPrice",
      header: "Total",
      cell: ({ row }) => `$${(row.getValue("totalPrice") as number).toFixed(2)}`
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="space-x-2">
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
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data: bookings || [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
        
        {isAdmin && (
          <Link
            to="/bookings/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          filterColumn="roomId"
          filterPlaceholder="Filter bookings..."
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                      <p className="mt-2 text-gray-500">
                        {isAdmin 
                          ? "There are no bookings in the system yet." 
                          : "You don't have any bookings yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
} 