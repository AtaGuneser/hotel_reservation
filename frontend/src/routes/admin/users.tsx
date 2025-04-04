import { createFileRoute } from '@tanstack/react-router'
import UserList from '../../pages/UserList'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  return <UserList />
} 