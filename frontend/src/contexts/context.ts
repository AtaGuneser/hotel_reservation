import { createContext } from 'react'
import { ApiUser, LoginCredentials } from '../services/api'

export interface AuthContextType {
  user: ApiUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined) 