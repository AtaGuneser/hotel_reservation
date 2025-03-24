import React from 'react'
import { UserRole } from '../services/api'

export interface UserData {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

export interface AuthContextType {
  userData: UserData | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

export const AuthContext = React.createContext<AuthContextType | null>(null) 