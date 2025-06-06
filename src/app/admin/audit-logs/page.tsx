// frontend-admin/src/app/admin/audit-logs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminAPI from '@/lib/api/admin'
import { formatDate } from '@/lib/utils'

interface AuditLog {
  _id: string
  userId: string
  action: string
  details: string
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 20

  useEffect(() => {
    fetchLogs()
  }, [currentPage])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const { logs: fetched, total } =
        await AdminAPI.getAuditLogs(currentPage, limit)
      setLogs(fetched)
      setTotalLogs(total)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to fetch audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPages = Math.ceil(totalLogs / limit)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, idx) => (
            <div key={idx} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Audit Logs
        </h2>
        <div className="text-sm text-gray-500">
          Total Entries: {totalLogs}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log._id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-900">
                  {log.details}
                </p>
                {log.user && (
                  <div className="mt-2 text-sm text-gray-500">
                    By: {log.user.firstName} {log.user.lastName} (
                    {log.user.email})
                  </div>
                )}
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
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
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
