// frontend-admin/src/app/admin/stats/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import AdminAPI, { AdminStats } from '@/lib/api/admin'

export default function StatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await AdminAPI.getStats()
      setStats(data)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to fetch statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) =>
    new Intl.NumberFormat().format(num)

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Statistics</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.users.totalUsers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatNumber(stats.users.activeUsers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {formatNumber(stats.users.pendingVerification)}
              </p>
            </div>
          </div>
        </Card>

        {/* Subscription Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriptions</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.subscriptions.totalSubscriptions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatNumber(stats.subscriptions.activeSubscriptions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {formatNumber(stats.subscriptions.pendingApprovals)}
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue</h3>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(stats.subscriptions.revenue)}
            </p>
          </div>
        </Card>

        {/* System Usage Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Usage</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Characters Generated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.system.totalCharactersGenerated)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Files Generated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.system.totalFilesGenerated)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Storage Used</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatBytes(stats.system.totalStorageUsed)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
