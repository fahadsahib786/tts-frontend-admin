// frontend-admin/src/app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminAPI from '@/lib/api/admin'
import type { User } from '@/types/auth'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { users: fetchedUsers, total } = await AdminAPI.getUsers(
        currentPage,
        limit
      )
      setUsers(fetchedUsers)
      setTotalUsers(total)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }
    try {
      await AdminAPI.deleteUser(userId)
      fetchUsers()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to delete user')
    }
  }

  const totalPages = Math.ceil(totalUsers / limit)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <div className="text-sm text-gray-500">
          Total Users: {totalUsers}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="mt-1 text-sm text-gray-500 space-y-1">
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>
                    Email Verified:{' '}
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </p>
                  <p>Joined: {formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    alert('Edit user functionality coming soon')
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={
                  currentPage === i + 1 ? 'default' : 'outline'
                }
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
