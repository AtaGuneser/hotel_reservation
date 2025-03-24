import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { authAPI, LoginCredentials, UserRole } from '../services/api'
import { AuthContext } from './context'
import { jwtDecode } from 'jwt-decode'

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')
    
    if (savedToken && savedUser) {
      try {
        const decoded = verifyToken(savedToken)
        if (decoded) {
          setToken(savedToken)
          setUserData(JSON.parse(savedUser))
        } else {
          logout()
        }
      } catch (err) {
        console.error('Error parsing user:', err)
        logout()
      }
    }
    
    setLoading(false)
  }, [verifyToken])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authAPI.login(credentials.email, credentials.password)
      const decoded = verifyToken(response.token)
      
      if (decoded) {
        setUserData(response.user)
        setToken(response.token)
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('authUser', JSON.stringify(response.user))
      } else {
        throw new Error('Invalid token received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUserData(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
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
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 