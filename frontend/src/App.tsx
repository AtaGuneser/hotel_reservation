import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import Rooms from "./pages/admin/Rooms"
import Bookings from "./pages/admin/Bookings"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
