import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./hooks/useAuth"
import { 
  createRootRoute, 
  createRoute, 
  createRouter,
  RouterProvider,
  Outlet,
  redirect,
  useNavigate
} from '@tanstack/react-router'
import AdminLayout from "./layouts/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import Rooms from "./pages/admin/Rooms"
import BookingList from "./pages/BookingList"
import BookingForm from "./pages/BookingForm"
import BookingDetails from "./pages/BookingDetails"
import UserList from "./pages/UserList"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

// Root Route
const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  ),
})

// Root Index Route
const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      throw redirect({
        to: '/admin',
      })
    }
    throw redirect({
      to: '/login',
    })
  },
})

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

// Register Route
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
})

const AuthGuard = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/login', replace: true })
    }
  }, [loading, isAuthenticated, navigate])
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }
  
  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mb-6 text-gray-600">Sorry, only administrators can access this area.</p>
          <button
            onClick={() => navigate({ to: '/login', replace: true })}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }
  
  return <AdminLayout />
}

// Admin Layout Route
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AuthGuard,
})

// Dashboard Route
const dashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: Dashboard,
})

// Rooms Route
const roomsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/rooms',
  component: Rooms,
})

// Users Route
const usersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users',
  component: UserList,
})

// Bookings Routes
const bookingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/bookings',
  component: BookingList,
})

const newBookingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/bookings/new',
  component: BookingForm,
})

const editBookingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/bookings/$bookingId/edit',
  component: BookingForm,
})

const bookingDetailsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/bookings/$bookingId',
  component: BookingDetails,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  registerRoute,
  adminLayoutRoute.addChildren([
    dashboardRoute,
    roomsRoute,
    usersRoute,
    bookingsRoute,
    newBookingRoute,
    editBookingRoute,
    bookingDetailsRoute,
  ]),
])

// Create router
const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
