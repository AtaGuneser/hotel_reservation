import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      navigate({ to: '/admin' })
    } else {
      navigate({ to: '/login' })
    }
  }, [navigate])
  
  return <div>Redirecting...</div>
} 