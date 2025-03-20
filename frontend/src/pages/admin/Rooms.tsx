import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "../../components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Room, CreateRoomDto, RoomCategory } from "../../services/api"

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
import { useState, useEffect, useReducer, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import { z } from "zod"

// Form validation schema
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  category: z.nativeEnum(RoomCategory),
  price: z.number().min(0, "Price must be positive"),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  isAvailable: z.boolean(),
  description: z.string().optional(),
  amenities: z.array(z.object({
    name: z.string().min(1, "Amenity name is required"),
    description: z.string().optional()
  }))
})

type RoomFormState = CreateRoomDto & {
  errors?: Record<string, string>
}

type RoomFormAction = 
  | { type: 'SET_FIELD'; field: keyof RoomFormState; value: string | number | boolean | RoomCategory | Array<{ name: string; description?: string }> }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'RESET' }
  | { type: 'SET_ROOM'; room: Room }

const initialRoomState: RoomFormState = {
  roomNumber: "",
  category: RoomCategory.STANDARD,
  price: 0,
  capacity: 1,
  isAvailable: true,
  amenities: [],
  description: ""
}

function roomFormReducer(state: RoomFormState, action: RoomFormAction): RoomFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'RESET':
      return initialRoomState
    case 'SET_ROOM':
      return {
        roomNumber: action.room.roomNumber,
        category: action.room.category,
        price: action.room.price,
        capacity: action.room.capacity,
        isAvailable: action.room.isAvailable,
        amenities: action.room.amenities,
        description: action.room.description || ""
      }
    default:
      return state
  }
}

const ActionsCell = ({ room }: { room: Room }) => {
  const { setSelectedRoom, setIsEditDialogOpen } = useRoomStore()
  const deleteRoom = useDeleteRoom()

  const handleDelete = async () => {
    try {
      await deleteRoom.mutateAsync(room.id)
      toast.success("Room deleted successfully")
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error("Failed to delete room")
    }
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
    cell: ({ row }) => {
      const category = row.getValue("category") as RoomCategory
      return category.charAt(0).toUpperCase() + category.slice(1)
    },
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
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable")
      return isAvailable ? "Available" : "Occupied"
    },
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roomForm, dispatch] = useReducer(roomFormReducer, initialRoomState)

  const validateForm = useCallback(() => {
    try {
      roomSchema.parse(roomForm)
      dispatch({ type: 'SET_ERRORS', errors: {} })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        dispatch({ type: 'SET_ERRORS', errors })
      }
      return false
    }
  }, [roomForm])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the validation errors")
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Creating room with data:', roomForm)
      await createRoom.mutateAsync(roomForm)
      console.log('Room created successfully')
      setIsCreateDialogOpen(false)
      dispatch({ type: 'RESET' })
    } catch (error) {
      console.error('Error creating room:', error)
      if (error instanceof Error && error.message.includes('Validation errors:')) {
        toast.error(error.message)
      } else {
        toast.error("Failed to create room")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom || !validateForm()) {
      toast.error("Please fix the validation errors")
      return
    }

    setIsSubmitting(true)
    try {
      await updateRoom.mutateAsync({ id: selectedRoom.id, data: roomForm })
      setIsEditDialogOpen(false)
      dispatch({ type: 'RESET' })
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error("Failed to update room")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isCreateDialogOpen) {
      dispatch({ type: 'RESET' })
    }
  }, [isCreateDialogOpen])

  useEffect(() => {
    if (isEditDialogOpen && selectedRoom) {
      dispatch({ type: 'SET_ROOM', room: selectedRoom })
    }
  }, [isEditDialogOpen, selectedRoom])

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
                  value={roomForm.roomNumber}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'roomNumber', value: e.target.value })
                  }
                  required
                />
                {roomForm.errors?.roomNumber && (
                  <p className="text-sm text-red-500">{roomForm.errors.roomNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={roomForm.category}
                  onValueChange={(value) =>
                    dispatch({ type: 'SET_FIELD', field: 'category', value: value as RoomCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RoomCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={roomForm.price}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'price', value: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'capacity', value: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={roomForm.description}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <div className="space-y-2">
                  {roomForm.amenities.map((amenity, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Amenity name"
                        value={amenity.name}
                        onChange={(e) => {
                          const newAmenities = [...roomForm.amenities]
                          newAmenities[index] = { ...amenity, name: e.target.value }
                          dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                        }}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={amenity.description || ""}
                        onChange={(e) => {
                          const newAmenities = [...roomForm.amenities]
                          newAmenities[index] = { ...amenity, description: e.target.value }
                          dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newAmenities = roomForm.amenities.filter((_, i) => i !== index)
                          dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'amenities', value: [...roomForm.amenities, { name: "", description: "" }] })
                    }}
                  >
                    Add Amenity
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={Array.isArray(rooms) ? rooms : []} />

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
                value={roomForm.roomNumber}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'roomNumber', value: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={roomForm.category}
                onValueChange={(value) =>
                  dispatch({ type: 'SET_FIELD', field: 'category', value: value as RoomCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RoomCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={roomForm.price}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'price', value: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={roomForm.capacity}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'capacity', value: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={roomForm.description}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amenities">Amenities</Label>
              <div className="space-y-2">
                {roomForm.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Amenity name"
                      value={amenity.name}
                      onChange={(e) => {
                        const newAmenities = [...roomForm.amenities]
                        newAmenities[index] = { ...amenity, name: e.target.value }
                        dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                      }}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={amenity.description || ""}
                      onChange={(e) => {
                        const newAmenities = [...roomForm.amenities]
                        newAmenities[index] = { ...amenity, description: e.target.value }
                        dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newAmenities = roomForm.amenities.filter((_, i) => i !== index)
                        dispatch({ type: 'SET_FIELD', field: 'amenities', value: newAmenities })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch({ type: 'SET_FIELD', field: 'amenities', value: [...roomForm.amenities, { name: "", description: "" }] })
                  }}
                >
                  Add Amenity
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Room"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 