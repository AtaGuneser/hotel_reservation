import { useContext } from 'react'
import { AuthContext } from '../contexts/context'
import { UserRole } from '../services/api'

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const isAdmin = context.userData?.role === UserRole.ADMIN

  return {
    ...context,
    isAdmin
  }
} 