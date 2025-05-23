import { Link, Outlet, useRouter } from "@tanstack/react-router"
import { cn } from "../lib/utils"
import {
  BedDouble,
  Calendar,
  LayoutDashboard,
  LogOut,
  User
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Rooms",
    href: "/admin/rooms",
    icon: BedDouble,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",      
    icon: Calendar,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: User,
  },
]

export default function AdminLayout() {
  const router = useRouter()
  const { userData, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hotel Admin</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                  router.state.location.pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* User Info and Logout */}
        <div className="mt-auto border-t border-gray-700 pt-4">
          {userData && (
            <div className="flex items-center px-4 py-2 text-gray-400">
              <User className="h-5 w-5 mr-2" />
              <div className="text-sm">
                <div className="font-medium text-white">{userData.firstName} {userData.lastName}</div>
                <div className="text-xs">{userData.email}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  )
} 