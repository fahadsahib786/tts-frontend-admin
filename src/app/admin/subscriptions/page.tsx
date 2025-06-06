// frontend-admin/src/app/admin/subscriptions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminAPI from '@/lib/api/admin'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Subscription {
  _id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  plan: {
    name: string
    price: number
  }
  status: 'pending' | 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  paymentProofUrl?: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 10

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, selectedStatus])

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      const { subscriptions: subs, total } =
        await AdminAPI.getSubscriptions(
          currentPage,
          limit,
          selectedStatus
        )
      setSubscriptions(subs)
      setTotalSubscriptions(total)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to fetch subscriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (subscriptionId: string) => {
    try {
      await AdminAPI.approveSubscription(subscriptionId)
      fetchSubscriptions()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to approve subscription')
    }
  }

  const handleReject = async (subscriptionId: string) => {
    const reason = prompt('Please enter the reason for rejection:')
    if (!reason) return

    try {
      await AdminAPI.rejectSubscription(subscriptionId, reason)
      fetchSubscriptions()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to reject subscription')
    }
  }

  const totalPages = Math.ceil(totalSubscriptions / limit)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Subscriptions
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          <div className="text-sm text-gray-500">
            Total: {totalSubscriptions}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription._id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {subscription.user.firstName}{' '}
                    {subscription.user.lastName}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p>Email: {subscription.user.email}</p>
                    <p>Plan: {subscription.plan.name}</p>
                    <p>
                      Price:{' '}
                      {formatCurrency(subscription.plan.price)}
                    </p>
                  </div>
                  <div>
                    <p>
                      Start Date:{' '}
                      {formatDate(subscription.startDate)}
                    </p>
                    <p>
                      End Date: {formatDate(subscription.endDate)}
                    </p>
                    {subscription.paymentProofUrl && (
                      <p>
                        <a
                          href={subscription.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          View Payment Proof
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {subscription.status === 'pending' && (
                <div className="ml-4 flex space-x-3">
                  <Button
                    variant="default"
                    onClick={() => handleApprove(subscription._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(subscription._id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
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
