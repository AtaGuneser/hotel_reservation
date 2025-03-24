import { useState, useEffect, ReactNode, useCallback } from 'react'
import { authAPI, LoginCredentials, UserRole } from '../services/api'
import { AuthContext } from './context'
import { jwtDecode } from 'jwt-decode'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface AuthProviderProps {
  children: ReactNode
}

interface JWTPayload {
  sub: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

interface UserData {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const verifyToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        throw new Error('Token expired')
      }

      return decoded
    } catch (err) {
      console.error('Token verification failed:', err)
      return null
    }
  }, [])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authAPI.login(credentials.email, credentials.password)
      const decoded = verifyToken(response.token)
      
      if (!decoded) {
        throw new Error('Invalid token received')
      }

      return response
    },
    onSuccess: (response) => {
      setUserData(response.user)
      setToken(response.token)
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('authUser', JSON.stringify(response.user))
    }
  })

  const logout = useCallback(() => {
    setUserData(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')
    
    if (savedToken && savedUser) {
      const decoded = verifyToken(savedToken)
      if (decoded) {
        setToken(savedToken)
        setUserData(JSON.parse(savedUser))
      } else {
        logout()
      }
    }
  }, [verifyToken, logout])

  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        userData,
        token,
        isAuthenticated,
        isAdmin: userData?.role === UserRole.ADMIN,
        login,
        logout,
        loading: loginMutation.isPending,
        error: loginMutation.error?.message || null
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 