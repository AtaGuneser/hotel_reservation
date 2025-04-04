import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import AdminLayout from '../layouts/AdminLayout'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
})

function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate({ to: '/login', replace: true })
        }
    }, [loading, isAuthenticated, navigate])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                    <h1 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h1>
                    <p className="mb-6 text-gray-600">Sorry, only administrators can access this area.</p>
                    <button
                        onClick={() => navigate({ to: '/login', replace: true })}
                        className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        )
    }

    return <AdminLayout />
} 