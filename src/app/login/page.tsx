// frontend-admin/src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import type { LoginCredentials } from '@/types/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Make sure NEXT_PUBLIC_API_URL is set to "http://localhost:5000/api"
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      // Parse out the JSON payload
      const payload = await response.json()

      // If backend responded 401/403/etc, throw its message
      if (!response.ok) {
        // The backend sends { success: false, error: "...", ... } on failure
        throw new Error(payload.error || payload.message || 'Login failed')
      }

      // The successful shape is { success: true, message: "...", data: { user, token } }
      const user = payload.data.user
      const token = payload.data.token

      if (!user || !token) {
        throw new Error('Invalid response from server')
      }

      // If not an admin, reject
      if (user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access only')
      }

      // Save to your Zustand store
      setToken(token)
      setUser(user)
      // Finally, navigate into your admin dashboard
      router.push('/admin/stats')
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in with your admin credentials
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-t-md"
              />
            </div>
            <div>
              <Input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="rounded-b-md mt-2"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
