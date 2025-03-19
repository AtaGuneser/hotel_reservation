import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "../../components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Room, CreateRoomDto } from "../../services/api"

import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { useRooms, useCreateRoom, useDeleteRoom, useUpdateRoom } from "../../hooks/useRooms"
import { useRoomStore } from "../../store/useRoomStore"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"

const ActionsCell = ({ room }: { room: Room }) => {
  const { setSelectedRoom, setIsEditDialogOpen } = useRoomStore()
  const deleteRoom = useDeleteRoom()

  const handleDelete = async () => {
    await deleteRoom.mutateAsync(room.id)
  }

  const handleEdit = () => {
    setSelectedRoom(room)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleEdit}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
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
    cell: ({ row }) => <ActionsCell room={row.original} />,
  },
]

export default function Rooms() {
  const { data: rooms, isLoading } = useRooms()
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const { isCreateDialogOpen, setIsCreateDialogOpen, isEditDialogOpen, setIsEditDialogOpen, selectedRoom } = useRoomStore()
  const [newRoom, setNewRoom] = useState<CreateRoomDto>({
    roomNumber: "",
    category: "standard",
    price: 0,
    capacity: 1,
    status: "Available",
  })

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRoom.mutateAsync(newRoom)
    setIsCreateDialogOpen(false)
    setNewRoom({
      roomNumber: "",
      category: "standard",
      price: 0,
      capacity: 1,
      status: "Available",
    })
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return
    await updateRoom.mutateAsync({ id: selectedRoom.id, data: newRoom })
    setIsEditDialogOpen(false)
    setNewRoom({
      roomNumber: "",
      category: "standard",
      price: 0,
      capacity: 1,
      status: "Available",
    })
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={newRoom.roomNumber}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, roomNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newRoom.category}
                  onValueChange={(value) =>
                    setNewRoom({ ...newRoom, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="presidential">Presidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newRoom.price}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, price: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Room
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={rooms || []} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRoom} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-roomNumber">Room Number</Label>
              <Input
                id="edit-roomNumber"
                value={newRoom.roomNumber}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={newRoom.category}
                onValueChange={(value) =>
                  setNewRoom({ ...newRoom, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={newRoom.price}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, price: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, capacity: Number(e.target.value) })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Room
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 