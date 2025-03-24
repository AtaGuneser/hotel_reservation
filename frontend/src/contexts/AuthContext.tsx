import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { authAPI, ApiUser, LoginCredentials, UserRole } from '../services/api'
import { AuthContext } from './context'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  const verifyAdminStatus = useCallback(async () => {
    if (!token) {
      setIsAdmin(false)
      return
    }

    try {
      const currentUser = await authAPI.getCurrentUser()
      setIsAdmin(currentUser.role === UserRole.ADMIN)
    } catch (err) {
      console.error('Error verifying admin status:', err)
      setIsAdmin(false)
      if (err instanceof Error && err.message.includes('401')) {
        logout()
      }
    }
  }, [token])

  useEffect(() => {
    // Check for saved token in localStorage
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        verifyAdminStatus()
      } catch (err) {
        // If there's an error parsing the user, clear the storage
        console.error('Error parsing user:', err)
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    }
    
    setLoading(false)
  }, [token, verifyAdminStatus])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authAPI.login(credentials.email, credentials.password)
      setUser(response.user)
      setToken(response.token)
      
      // Save to localStorage
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('authUser', JSON.stringify(response.user))
      
      // Verify admin status after login
      await verifyAdminStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAdmin(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
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