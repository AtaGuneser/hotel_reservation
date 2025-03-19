import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

export default function Bookings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bookings</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Guest Name</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>#12345</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>101</TableCell>
            <TableCell>2024-03-20</TableCell>
            <TableCell>2024-03-25</TableCell>
            <TableCell>Confirmed</TableCell>
            <TableCell>$500</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
} 