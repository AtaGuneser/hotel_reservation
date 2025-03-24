import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { LoginCredentials } from '../services/api'

const Login: React.FC = () => {
  const { login, logout, isAuthenticated, isAdmin, userData, loading, error } = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: 'johndoe@example.com',
    password: '123456'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate({ to: '/admin', replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  // If authenticated but not admin, show access denied
  if (isAuthenticated && !isAdmin && userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              Sorry, {userData.firstName}. Only administrators can access the admin panel.
            </p>
          </div>
          
          <button
            onClick={logout}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await login(credentials)
      navigate({ to: '/admin', replace: true })
    } catch (err) {
      // Error is already handled in AuthContext
      console.error('Login failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hotel Admin</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 