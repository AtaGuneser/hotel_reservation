import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import {
  LayoutDashboard,
  BedDouble,
  Calendar,
  Settings,
  Users,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Rooms",
    href: "/rooms",
    icon: BedDouble,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: Calendar,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hotel Admin</h1>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                  location.pathname === item.href
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  )
} 