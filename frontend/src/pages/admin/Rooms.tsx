import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "../../components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Room {
  id: string
  roomNumber: string
  category: string
  price: number
  capacity: number
  status: string
}

const columns: ColumnDef<Room>[] = [
  {
    accessorKey: "roomNumber",
    header: "Room Number",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)
      return formatted
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      )
    },
  },
]

const data: Room[] = [
  {
    id: "1",
    roomNumber: "101",
    category: "Standard",
    price: 100,
    capacity: 2,
    status: "Available",
  },
  {
    id: "2",
    roomNumber: "102",
    category: "Deluxe",
    price: 200,
    capacity: 3,
    status: "Occupied",
  },
  {
    id: "3",
    roomNumber: "201",
    category: "Suite",
    price: 300,
    capacity: 4,
    status: "Available",
  },
]

export default function Rooms() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
} 