import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '../../pages/admin/Dashboard'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return <Dashboard />
} 